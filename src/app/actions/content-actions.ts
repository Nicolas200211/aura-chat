"use server";

import { db } from "@/db";
import { exercises, specialists, journalEntries, appointments, profiles } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

// --- EJERCICIOS ---
export async function getExercises() {
  try {
    return await db.select().from(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
}

// --- ESPECIALISTAS ---
export async function getSpecialists() {
  try {
    return await db.select().from(specialists);
  } catch (error) {
    console.error("Error fetching specialists:", error);
    return [];
  }
}

// --- DIARIO ---
export async function saveJournalEntry(content: string, mood: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    return await db.insert(journalEntries).values({
      userId: user.id,
      content,
      mood,
    }).returning();
  } catch (error) {
    console.error("Error saving journal entry:", error);
    throw error;
  }
}

export async function getJournalEntries() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, user.id))
      .orderBy(desc(journalEntries.createdAt));
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }
}

// --- CITAS ---
export async function getAppointments() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return await db.select({
      id: appointments.id,
      date: appointments.date,
      time: appointments.time,
      status: appointments.status,
      specialistName: specialists.name,
      specialistImage: specialists.image
    })
    .from(appointments)
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(eq(appointments.userId, user.id))
    .orderBy(desc(appointments.createdAt));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export async function saveAppointment(specialistId: number, date: string, time: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    return await db.insert(appointments).values({
      userId: user.id,
      specialistId,
      date,
      time,
      status: "Confirmado"
    }).returning();
  } catch (error) {
    console.error("Error saving appointment:", error);
    throw error;
  }
}

export async function deleteAppointment(appointmentId: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    return await db.delete(appointments)
      .where(eq(appointments.id, appointmentId));
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}

// --- PERFIL ---
export async function getMyProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const result = await db.select().from(profiles)
      .where(eq(profiles.id, user.id));
    
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateProfile(data: { fullName?: string, avatarUrl?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    return await db.insert(profiles)
      .values({
        id: user.id,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
          updatedAt: new Date()
        }
      })
      .returning();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

// --- ESTADÍSTICAS ---
export async function getDashboardStats() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const entries = await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, user.id))
      .orderBy(desc(journalEntries.createdAt));

    const moodValues: Record<string, number> = {
      "feliz": 9,
      "triste": 4,
      "ansioso": 6,
      "enojado": 3,
      "neutral": 7
    };

    const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    const last7DaysData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = days[d.getDay()];
      
      const dayEntries = entries.filter(e => 
        new Date(e.createdAt!).toLocaleDateString() === d.toLocaleDateString()
      );

      const value = dayEntries.length > 0 
        ? dayEntries.reduce((acc, curr) => acc + (moodValues[curr.mood] || 5), 0) / dayEntries.length
        : 5;

      return { day: dayName, value };
    });

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const hasEntry = entries.some(e => 
        new Date(e.createdAt!).toLocaleDateString() === checkDate.toLocaleDateString()
      );
      if (hasEntry) streak++;
      else if (i > 0) break;
    }

    return {
      chartData: last7DaysData,
      streak,
      totalEntries: entries.length
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}
