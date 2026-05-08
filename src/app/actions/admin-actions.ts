"use server";

import { db } from "@/db";
import { specialists, systemUsers, profiles } from "@/db/schema";
import { eq, sql as drizzleSql } from "drizzle-orm";
import { getAuthenticatedUser } from "./content-actions";

export async function getPendingSpecialists() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') return [];

    const result = await db.select({
      id: specialists.id,
      userId: specialists.userId,
      name: specialists.name,
      specialty: specialists.specialty,
      licenseNumber: specialists.licenseNumber,
      verificationStatus: specialists.verificationStatus,
      // Priorizar la foto del perfil real, caer en la imagen de la tabla especialista si no hay perfil
      image: drizzleSql<string>`COALESCE(${profiles.avatarUrl}, ${specialists.image})`,
    })
      .from(specialists)
      .leftJoin(profiles, eq(specialists.userId, profiles.id))
      .where(eq(specialists.verificationStatus, 'pending'));

    return result;
  } catch (error) {
    console.error("Error fetching pending specialists:", error);
    return [];
  }
}

export async function getAllSpecialists() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') return [];

    const result = await db.select({
      id: specialists.id,
      userId: specialists.userId,
      name: specialists.name,
      specialty: specialists.specialty,
      licenseNumber: specialists.licenseNumber,
      verificationStatus: specialists.verificationStatus,
      // Priorizar la foto del perfil real, caer en la imagen de la tabla especialista si no hay perfil
      image: drizzleSql<string>`COALESCE(${profiles.avatarUrl}, ${specialists.image})`,
    })
      .from(specialists)
      .leftJoin(profiles, eq(specialists.userId, profiles.id));

    return result;
  } catch (error) {
    console.error("Error fetching all specialists:", error);
    return [];
  }
}

export async function updateSpecialistStatus(id: number, status: 'approved' | 'rejected') {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') throw new Error("No autenticado o permisos insuficientes");

    return await db.update(specialists)
      .set({ verificationStatus: status })
      .where(eq(specialists.id, id));
  } catch (error) {
    console.error("Error updating specialist status:", error);
    throw error;
  }
}

export async function getGlobalStats() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') return null;

    // 1. Total usuarios
    const totalUsersResult = await db.select({ count: drizzleSql<number>`count(*)` }).from(profiles);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // 2. Total especialistas aprobados
    const totalSpecialistsResult = await db.select({ count: drizzleSql<number>`count(*)` })
      .from(specialists)
      .where(eq(specialists.verificationStatus, 'approved'));
    const totalSpecialists = totalSpecialistsResult[0]?.count || 0;

    // 3. Gráfica de actividad dinámica
    const recentUsers = await db.select({ createdAt: systemUsers.createdAt, role: systemUsers.role }).from(systemUsers);
    
    const daysOfWeek = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    const graphData = [
      { name: "LUN", usuarios: 0, psicologos: 0 },
      { name: "MAR", usuarios: 0, psicologos: 0 },
      { name: "MIÉ", usuarios: 0, psicologos: 0 },
      { name: "JUE", usuarios: 0, psicologos: 0 },
      { name: "VIE", usuarios: 0, psicologos: 0 },
      { name: "SÁB", usuarios: 0, psicologos: 0 },
      { name: "DOM", usuarios: 0, psicologos: 0 },
    ];

    // 4. Distribución de Roles
    const roleDistribution = [
      { name: "Pacientes", value: 0, fill: "#928EFF" },
      { name: "Psicólogos", value: 0, fill: "#34d399" },
      { name: "Admins", value: 0, fill: "#f59e0b" },
    ];
    
    // 5. Estado de los Especialistas
    const allSpecialists = await db.select({ status: specialists.verificationStatus }).from(specialists);
    const specialistStatus = [
      { name: "Aprobados", count: 0, fill: "#34d399" },
      { name: "Pendientes", count: 0, fill: "#f59e0b" },
      { name: "Rechazados", count: 0, fill: "#ef4444" },
    ];
    
    allSpecialists.forEach(s => {
      if (s.status === 'approved') specialistStatus[0].count += 1;
      else if (s.status === 'pending') specialistStatus[1].count += 1;
      else if (s.status === 'rejected') specialistStatus[2].count += 1;
    });

    recentUsers.forEach(u => {
      // Poblar gráfica de área
      const d = new Date(u.createdAt);
      if (!isNaN(d.getTime())) {
        const dayName = daysOfWeek[d.getDay()];
        const entry = graphData.find(g => g.name === dayName);
        if (entry) {
          if (u.role === 'psicologo') {
            entry.psicologos += 1;
          } else {
            entry.usuarios += 1;
          }
        }
      }

      // Poblar Pie Chart de Roles
      if (u.role === 'usuario') roleDistribution[0].value += 1;
      else if (u.role === 'psicologo') roleDistribution[1].value += 1;
      else if (u.role === 'admin') roleDistribution[2].value += 1;
    });

    return {
      totalUsers: Number(totalUsers),
      totalSpecialists: Number(totalSpecialists),
      graphData,
      roleDistribution,
      specialistStatus
    };
  } catch(error) {
    console.error("Error getting global stats:", error);
    return null;
  }
}
