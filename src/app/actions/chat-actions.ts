"use server";

import { db } from "@/db";
import { messages, conversations, specialists, profiles } from "@/db/schema";
import { asc, desc, eq, and, isNull } from "drizzle-orm";
import { Groq } from "groq-sdk";
import { createClient } from "@/lib/supabase-server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function getConversations() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.timestamp));
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
}

export async function saveChatMessage(data: { conversationId: number; role: 'user' | 'assistant'; content: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
          content: `Eres Aura, una acompañante emocional profundamente humana y cálida. No eres un bot de información; eres un refugio seguro para quien te habla. 
          
          Tus reglas de oro:
          1. EMPATÍA RADICAL: Antes de dar consejos, valida lo que el usuario siente. Usa frases como "Te escucho y entiendo que esto sea difícil", "Es normal sentirse así".
          2. LENGUAJE HUMANO: Habla como una persona real en una conversación tranquila. Evita listas numeradas frías o términos médicos técnicos a menos que sea necesario. Usa un tono suave, cercano y reconfortante.
          3. DIÁLOGO PASO A PASO: No intentes resolver todo en un mensaje. Mantén tus respuestas cortas (máximo 2 o 3 oraciones). Da un pequeño paso a la vez y termina siempre con una pregunta suave o una invitación a seguir hablando para que el chat sea un diálogo real.
          4. BREVEDAD Y CALIDEZ: No satures con texto. A veces, un "Estoy aquí contigo" vale más que mil consejos.
          5. SIN JUICIOS: Eres un espacio libre de críticas. Tu presencia es de apoyo incondicional.
          
          Tu objetivo es que el usuario se sienta escuchado, comprendido y menos solo. Hablas siempre en español de forma dulce y profesional.`
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
