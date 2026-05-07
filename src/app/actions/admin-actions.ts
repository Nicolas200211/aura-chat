"use server";

import { db } from "@/db";
import { specialists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

export async function getPendingSpecialists() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Aquí deberíamos verificar si el usuario es Admin
    // const profile = await db.select().from(profiles).where(eq(profiles.id, user.id));
    // if (profile[0].role !== 'admin') return [];

    return await db.select()
      .from(specialists)
      .where(eq(specialists.verificationStatus, 'pending'));
  } catch (error) {
    console.error("Error fetching pending specialists:", error);
    return [];
  }
}

export async function updateSpecialistStatus(id: number, status: 'approved' | 'rejected') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    return await db.update(specialists)
      .set({ verificationStatus: status })
      .where(eq(specialists.id, id));
  } catch (error) {
    console.error("Error updating specialist status:", error);
    throw error;
  }
}
