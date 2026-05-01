"use server";

import { db } from "@/db";
import { messages, conversations } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase-server";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno.");
  }

  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-8b-latest",
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Intentando con modelo: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Eres Aura Chat, una asistente inteligente especializada en bienestar emocional y psicología. Tu objetivo es escuchar de forma empática, ofrecer apoyo emocional y sugerir ejercicios de bienestar. Hablas de forma cálida, profesional y cercana en español.",
      });

      const formattedHistory = history.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content || m.text }],
      }));

      const firstUserIndex = formattedHistory.findIndex(h => h.role === "user");
      const safeHistory = firstUserIndex !== -1 ? formattedHistory.slice(firstUserIndex) : [];

      const chat = model.startChat({ history: safeHistory });
      const result = await chat.sendMessage(userContent);
      return result.response.text();
    } catch (error: any) {
      lastError = error;
      console.error(`Modelo ${modelName} falló con: [${error.status ?? error.code ?? 'ERR'}] ${error.message}`);
      continue;
    }
  }

  console.error("TODOS LOS MODELOS FALLARON. Último error:", lastError);
  throw new Error(`Error al conectar con Aura AI: ${lastError?.message ?? "Error desconocido"}`);
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
