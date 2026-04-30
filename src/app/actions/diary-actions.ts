"use server";

import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

export async function getDiaryEntries() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id))
      .orderBy(desc(journalEntries.createdAt));
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    return [];
  }
}

export async function createDiaryEntry(data: { content: string; mood: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const result = await db.insert(journalEntries).values({
      userId: user.id, // <-- Esto es lo que faltaba
      content: data.content,
      mood: data.mood,
    }).returning();
    
    return result[0];
  } catch (error) {
    console.error("Error creating diary entry:", error);
    throw error;
  }
}
