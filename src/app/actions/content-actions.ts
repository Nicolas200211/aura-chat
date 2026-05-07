"use server";

import { db } from "@/db";
import { exercises, specialists, journalEntries, appointments, profiles, userBadges, badges } from "@/db/schema";
import { desc, eq, and, count, asc } from "drizzle-orm";
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
    return await db.select()
      .from(specialists)
      .where(eq(specialists.verificationStatus, 'approved'))
      .orderBy(asc(specialists.name));
  } catch (error) {
    console.error("Error fetching specialists:", error);
    return [];
  }
}

// --- DIARIO ---
export async function saveJournalEntry(title: string, content: string, mood: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    return await db.insert(journalEntries).values({
      userId: user.id,
      title,
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

export async function deleteJournalEntry(id: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    return await db.delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)));
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
}

export async function updateJournalEntry(id: number, title: string, content: string, mood: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    return await db.update(journalEntries)
      .set({ title, content, mood })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
      .returning();
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error;
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

export async function getSpecialistProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const result = await db.select().from(specialists)
      .where(eq(specialists.userId, user.id));
    
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching specialist profile:", error);
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

export async function updateSpecialistProfile(data: { specialty?: string, licenseNumber?: string, price?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const spec = await db.select().from(specialists).where(eq(specialists.userId, user.id)).limit(1);
    if (!spec.length) throw new Error("No eres especialista");

    const updateData: any = {};
    if (data.specialty) updateData.specialty = data.specialty;
    if (data.price) updateData.price = data.price;
    
    if (data.licenseNumber && data.licenseNumber !== spec[0].licenseNumber) {
      updateData.licenseNumber = data.licenseNumber;
      updateData.verificationStatus = 'pending'; // Re-verificar si cambia la licencia
    }

    return await db.update(specialists)
      .set(updateData)
      .where(eq(specialists.id, spec[0].id))
      .returning();
  } catch (error) {
    console.error("Error updating specialist profile:", error);
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
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    // Gráfico general (promedio)
    const chartData = last7Days.map(d => {
      const dayName = days[d.getDay()];
      const dayEntries = entries.filter(e => 
        new Date(e.createdAt!).toLocaleDateString() === d.toLocaleDateString()
      );
      const value = dayEntries.length > 0 
        ? dayEntries.reduce((acc, curr) => acc + (moodValues[curr.mood] || 5), 0) / dayEntries.length
        : 5;
      return { day: dayName, value };
    });

    // Estadísticas por cada ánimo (frecuencia)
    const moodData: Record<string, any[]> = {
      feliz: [],
      triste: [],
      ansioso: []
    };

    ["feliz", "triste", "ansioso"].forEach(m => {
      moodData[m] = last7Days.map(d => {
        const dayName = days[d.getDay()];
        const count = entries.filter(e => 
          e.mood === m && new Date(e.createdAt!).toLocaleDateString() === d.toLocaleDateString()
        ).length;
        return { day: dayName, value: count };
      });
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
      chartData,
      moodData,
      streak,
      totalEntries: entries.length
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

export async function getProfileStats() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { badges: 0, streak: 0 };

    const badgeCountResult = await db.select({ val: count() }).from(userBadges).where(eq(userBadges.userId, user.id));
    const stats = await getDashboardStats();

    return {
      badges: badgeCountResult[0].val || 0,
      streak: stats?.streak || 0
    };
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return { badges: 0, streak: 0 };
  }
}

export async function getSpecialistStats() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { sessions: 0, rating: "0.0", streak: 0 };

    const spec = await db.select().from(specialists).where(eq(specialists.userId, user.id)).limit(1);
    if (!spec.length) return { sessions: 0, rating: "0.0", streak: 0 };

    const allAppointments = await db.select()
      .from(appointments)
      .where(eq(appointments.specialistId, spec[0].id))
      .orderBy(desc(appointments.date));

    // Calcular racha profesional (días seguidos con citas)
    let streak = 0;
    const uniqueDates = Array.from(new Set(allAppointments.map(a => a.date)));
    
    if (uniqueDates.length > 0) {
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (uniqueDates.includes(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
    }

    return {
      sessions: allAppointments.length,
      rating: spec[0].rating || "5.0",
      streak
    };
  } catch (error) {
    console.error("Error fetching specialist stats:", error);
    return { sessions: 0, rating: "0.0", streak: 0 };
  }
}

export async function getPsychologistPatients() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Buscamos el ID de especialista del usuario actual
    const specialist = await db.select().from(specialists)
      .where(eq(specialists.userId, user.id));
    
    if (!specialist.length) return [];

    const specId = specialist[0].id;

    // 2. Buscamos usuarios únicos que tengan citas con este especialista
    const patients = await db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      lastSession: appointments.date,
      status: appointments.status,
    })
    .from(appointments)
    .innerJoin(profiles, eq(appointments.userId, profiles.id))
    .where(eq(appointments.specialistId, specId))
    .orderBy(desc(appointments.createdAt));

    // Filtrar para tener pacientes únicos (el último registro de cada uno)
    const uniquePatients = Array.from(new Map(patients.map(p => [p.id, p])).values());

    return uniquePatients;
  } catch (error) {
    console.error("Error fetching psychologist patients:", error);
    return [];
  }
}

export async function getSpecialistAppointments() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Buscamos el ID de especialista del usuario actual
    const specialist = await db.select().from(specialists)
      .where(eq(specialists.userId, user.id));
    
    if (!specialist.length) return [];

    const specId = specialist[0].id;

    // 2. Buscamos las citas donde este usuario es el especialista
    return await db.select({
      id: appointments.id,
      date: appointments.date,
      time: appointments.time,
      status: appointments.status,
      patientName: profiles.fullName,
      patientImage: profiles.avatarUrl
    })
    .from(appointments)
    .innerJoin(profiles, eq(appointments.userId, profiles.id))
    .where(eq(appointments.specialistId, specId))
    .orderBy(desc(appointments.createdAt));
  } catch (error) {
    console.error("Error fetching specialist appointments:", error);
    return [];
  }
}
