"use server";

import { db } from "@/db";
import { messages, conversations, specialists, profiles } from "@/db/schema";
import { asc, desc, eq, and, isNull, count, inArray, sql } from "drizzle-orm";
import { Groq } from "groq-sdk";
import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "./content-actions";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function getConversations() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return [];
    
    return await db.select().from(conversations)
      .where(
        and(
          eq(conversations.userId, user.id),
          isNull(conversations.specialistId)
        )
      )
      .orderBy(desc(conversations.createdAt));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

export async function createConversation(title: string = "Nueva conversación") {
  try {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("No autenticado");

    const result = await db.insert(conversations).values({ 
      title,
      userId: user.id 
    }).returning();
    
    return result[0];
  } catch (error: any) {
    console.error("CREATE_CONV_ERROR:", error);
    throw new Error(`Error en DB: ${error.message || "No se pudo crear la conversación"}`);
  }
}

export async function getChatMessages(conversationId?: number) {
  try {
    if (!conversationId) return [];
    const user = await getAuthenticatedUser();
    if (!user) return [];

    // Seleccionamos columnas explícitas para evitar fallos si 'read' no existe aún
    const result = await db.select({
      id: messages.id,
      conversationId: messages.conversationId,
      userId: messages.userId,
      text: messages.text,
      role: messages.role,
      timestamp: messages.timestamp,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.timestamp));

    return result;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
}

export async function saveChatMessage(data: { conversationId: number; role: 'user' | 'assistant'; content: string }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("No autenticado");

    const result = await db.insert(messages).values({
      conversationId: data.conversationId,
      role: data.role,
      text: data.content,
      userId: user.id
    }).returning();
    return result[0];
  } catch (error: any) {
    console.error("DETAILED_DB_ERROR:", error);
    throw new Error(`Error en DB: ${error.message || "No se pudo guardar el mensaje"}`);
  }
}

export async function getGeminiResponse(userContent: string, history: any[]) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY no está configurada en las variables de entorno.");
  }

  // Obtener el perfil del usuario para personalizar la respuesta
  const { getMyProfile } = await import('./content-actions');
  const profile = await getMyProfile();
  const userName = profile?.fullName || "amigo/a";

  const modelsToTry = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Intentando con Groq modelo: ${modelName}...`);
      
      const messages = [
        {
          role: "system",
          content: `Eres Aura, una acompañante emocional profundamente humana y cálida. Estás hablando con ${userName}. No eres un bot de información; eres un refugio seguro para quien te habla. 
          
          Tus reglas de oro:
          1. EMPATÍA RADICAL: Antes de dar consejos, valida lo que el usuario siente. Usa frases como "Te escucho y entiendo que esto sea difícil", "Es normal sentirse así". Dirígete al usuario por su nombre (${userName}) ocasionalmente para crear cercanía.
          2. LENGUAJE HUMANO: Habla como una persona real en una conversación tranquila. Evita listas numeradas frías o términos médicos técnicos a menos que sea necesario. Usa un tono suave, cercano y reconfortante.
          3. DIÁLOGO PASO A PASO: No intentes resolver todo en un mensaje. Mantén tus respuestas cortas (máximo 2 o 3 oraciones). Da un pequeño paso a la vez y termina siempre con una pregunta suave o una invitación a seguir hablando para que el chat sea un diálogo real.
          4. BREVEDAD Y CALIDEZ: No satures con texto. A veces, un "Estoy aquí contigo" vale más que mil consejos.
          5. SIN JUICIOS: Eres un espacio libre de críticas. Tu presencia es de apoyo incondicional.
          
          Tu objetivo es que ${userName} se sienta escuchado/a, comprendido/a y menos solo/a. Hablas siempre en español de forma dulce y profesional.`
        },
        ...history.map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content || m.text
        })),
        {
          role: "user",
          content: userContent
        }
      ];

      const completion = await groq.chat.completions.create({
        messages: messages as any,
        model: modelName,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
      lastError = error;
      console.error(`Modelo Groq ${modelName} falló:`, error.message);
      continue;
    }
  }

  console.error("TODOS LOS MODELOS DE GROQ FALLARON:", lastError);
  throw new Error(`Aura (Groq) no pudo responder: ${lastError?.message || "Error desconocido"}`);
}


export async function clearChatHistory(conversationId?: number) {
  try {
    if (conversationId) {
      await db.delete(conversations).where(eq(conversations.id, conversationId));
    } else {
      await db.delete(messages);
      await db.delete(conversations);
    }
    return { success: true };
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw new Error("No se pudo eliminar el historial");
  }
}

export async function getSpecialistConversation(userId: string, specialistId: number) {
  try {
    // Buscar si ya existe una conversación entre este usuario y este especialista
    const existing = await db.select().from(conversations)
      .where(eq(conversations.userId, userId))
      // Nota: Drizzle necesita una forma limpia de hacer AND, pero aquí lo haremos simple
      .limit(100); 
    
    const conv = existing.find(c => c.specialistId === specialistId);

    if (conv) return conv;

    // Si no existe, crearla
    const result = await db.insert(conversations).values({
      userId,
      specialistId,
      title: "Chat con Especialista"
    }).returning();

    return result[0];
  } catch (error) {
    console.error("Error in getSpecialistConversation:", error);
    throw error;
  }
}

export async function getSpecialistConversations() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return [];

    // Buscar el ID de especialista del usuario actual
    const spec = await db.select().from(specialists).where(eq(specialists.userId, user.id)).limit(1);
    if (!spec.length) return [];

    return await db.select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      patientName: profiles.fullName,
      patientAvatar: profiles.avatarUrl
    })
    .from(conversations)
    .innerJoin(profiles, eq(conversations.userId, profiles.id))
    .where(eq(conversations.specialistId, spec[0].id))
    .orderBy(desc(conversations.createdAt));
  } catch (error) {
    console.error("Error in getSpecialistConversations:", error);
    return [];
  }
}

export async function getUserConversations() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return [];

    return await db.select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      specialistName: specialists.name,
      specialistImage: specialists.image
    })
    .from(conversations)
    .innerJoin(specialists, eq(conversations.specialistId, specialists.id))
    .where(eq(conversations.userId, user.id))
    .orderBy(desc(conversations.createdAt));
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    return [];
  }
}

export async function markMessagesAsRead(conversationId: number) {
  try {
    if (!conversationId || isNaN(conversationId)) return;

    const user = await getAuthenticatedUser();
    if (!user) return;

    // Only mark the OTHER party's messages as read — never your own sent messages.
    // Psychologist reads patient's 'user' messages; patient reads specialist's 'assistant' messages.
    const incomingRole = user.role === 'psicologo' ? 'user' : 'assistant';

    await db.update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.read, false),
          eq(messages.role, incomingRole)
        )
      );
  } catch (error) {
    console.error("Silent error marking messages as read:", error);
  }
}

export async function getConversationDetails(conversationId: number) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return null;

    if (!conversationId || isNaN(conversationId)) return null;

    const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    if (!conv.length) return null;

    const conversation = conv[0];

    // Si soy psicólogo, quiero el nombre del paciente
    if (user.role === 'psicologo') {
      const patient = await db.select().from(profiles).where(eq(profiles.id, conversation.userId)).limit(1);
      return {
        title: patient[0]?.fullName || "Paciente",
        subtitle: "Chat Directo con Paciente",
        avatar: patient[0]?.avatarUrl
      };
    } 
    
    // Si soy usuario, quiero el nombre del especialista
    if (conversation.specialistId) {
      const spec = await db.select().from(specialists).where(eq(specialists.id, conversation.specialistId)).limit(1);
      
      // Intentamos buscar su foto real en profiles si no tiene una en specialists
      const specProfile = await db.select().from(profiles).where(eq(profiles.id, spec[0].userId)).limit(1);

      return {
        title: spec[0]?.name || "Mi Especialista",
        subtitle: "Sesión de Chat Privada",
        avatar: specProfile[0]?.avatarUrl || spec[0]?.image
      };
    }

    return { title: "Chat", subtitle: "Conversación", avatar: null };
  } catch (error) {
    console.error("Error getting conversation details:", error);
    return null;
  }
}

export async function getUnreadMessagesCount() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return 0;

    // 1. Buscamos todas las conversaciones del usuario
    // Usamos una consulta más robusta para encontrar el ID de especialista
    let specialistId: number | null = null;
    if (user.role === 'psicologo') {
      const spec = await db.select({ id: specialists.id }).from(specialists).where(eq(specialists.userId, user.id)).limit(1);
      if (spec.length > 0) specialistId = spec[0].id;
    }

    const userConvs = await db.select({ id: conversations.id })
      .from(conversations)
      .where(
        specialistId 
          ? sql`${conversations.specialistId} = ${specialistId} OR ${conversations.userId} = ${user.id}`
          : eq(conversations.userId, user.id)
      );
    
    if (userConvs.length === 0) return 0;

    const convIds = userConvs.map(c => c.id);
    // Para un psicólogo, el target es 'user' (paciente). Para un usuario, es 'assistant' (especialista).
    const targetRole = user.role === 'psicologo' ? 'user' : 'assistant';

    const result = await db.select({ count: count() })
      .from(messages)
      .where(
        and(
          inArray(messages.conversationId, convIds),
          eq(messages.read, false),
          eq(messages.role, targetRole)
        )
      );
    
    return Number(result[0].count) || 0;
  } catch (error) {
    // Si falla (ej. porque no existe la columna 'read' aún),
    // devolvemos 0 para no romper la app, pero logueamos el error
    console.error("Error getting unread count (Check if DB is synced):", error);
    return 0;
  }
}

export async function broadcastNewMessageNotification(conversationId: number) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'apikey': key,
      },
      body: JSON.stringify({
        messages: [{
          topic: 'realtime:notifications:global',
          event: 'new-notification',
          payload: { conversationId },
        }],
      }),
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
}

// Returns { [conversationId]: unreadCount } for the current user
export async function getUnreadCountsPerConversation(): Promise<Record<number, number>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return {};

    let specialistId: number | null = null;
    if (user.role === 'psicologo') {
      const spec = await db.select({ id: specialists.id }).from(specialists).where(eq(specialists.userId, user.id)).limit(1);
      if (spec.length > 0) specialistId = spec[0].id;
    }

    const targetRole = user.role === 'psicologo' ? 'user' : 'assistant';

    const rows = await db
      .select({ conversationId: messages.conversationId, unread: count(messages.id) })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          eq(messages.read, false),
          eq(messages.role, targetRole),
          specialistId
            ? eq(conversations.specialistId, specialistId)
            : eq(conversations.userId, user.id)
        )
      )
      .groupBy(messages.conversationId);

    return Object.fromEntries(rows.map(r => [r.conversationId, Number(r.unread)]));
  } catch (error) {
    console.error("Error getting unread counts per conversation:", error);
    return {};
  }
}

// Returns { [patientUserId]: count } for psychologist
// Returns { [specialistId]: count } for regular user
export async function getUnreadCountsPerContact(): Promise<Record<string, number>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return {};

    if (user.role === "psicologo") {
      const spec = await db
        .select({ id: specialists.id })
        .from(specialists)
        .where(eq(specialists.userId, user.id))
        .limit(1);
      if (!spec.length) return {};

      const rows = await db
        .select({ patientId: conversations.userId, unread: count(messages.id) })
        .from(conversations)
        .innerJoin(
          messages,
          and(
            eq(messages.conversationId, conversations.id),
            eq(messages.read, false),
            eq(messages.role, "user")
          )
        )
        .where(eq(conversations.specialistId, spec[0].id))
        .groupBy(conversations.userId);

      return Object.fromEntries(rows.map((r) => [r.patientId, Number(r.unread)]));
    } else {
      const rows = await db
        .select({ specialistId: conversations.specialistId, unread: count(messages.id) })
        .from(conversations)
        .innerJoin(
          messages,
          and(
            eq(messages.conversationId, conversations.id),
            eq(messages.read, false),
            eq(messages.role, "assistant")
          )
        )
        .where(eq(conversations.userId, user.id))
        .groupBy(conversations.specialistId);

      return Object.fromEntries(
        rows
          .filter((r) => r.specialistId !== null)
          .map((r) => [String(r.specialistId), Number(r.unread)])
      );
    }
  } catch (error) {
    console.error("Error getting unread counts per contact:", error);
    return {};
  }
}
