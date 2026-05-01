"use server";

import { db } from "@/db";
import { messages, conversations } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
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
      .where(eq(conversations.userId, user.id))
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
          content: "Eres Aura Chat, una asistente inteligente especializada en bienestar emocional y psicología. Tu objetivo es escuchar de forma empática, ofrecer apoyo emocional y sugerir ejercicios de bienestar. Hablas de forma cálida, profesional y cercana en español."
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
