"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import postgres from "postgres";
import { verifyPassword } from "@/lib/auth-utils";

const sql = postgres(process.env.DATABASE_URL!);

export async function logout() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  
  await supabase.auth.signOut();
  cookieStore.delete("aura-session");
  
  redirect("/auth/login");
}

export async function customLogin(email: string, pass: string) {
  try {
    const users = await sql`SELECT * FROM public.usuarios_sistema WHERE email = ${email}`;
    
    if (users.length === 0) {
      return { success: false, message: "Usuario no encontrado" };
    }

    const user = users[0];
    const isValid = verifyPassword(pass, user.password_hash);

    if (!isValid) {
      return { success: false, message: "Contraseña incorrecta" };
    }

    // Guardamos la sesión en una cookie segura
    const cookieStore = await cookies();
    cookieStore.set("aura-session", JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/"
    });

    return { success: true, message: "Login exitoso" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Error interno del servidor" };
  }
}

export async function customRegister(data: { name: string, email: string, pass: string, role: string, licenseNumber?: string }) {
  try {
    // 1. Verificar si el usuario ya existe
    const existing = await sql`SELECT id FROM public.usuarios_sistema WHERE email = ${data.email}`;
    if (existing.length > 0) {
      return { success: false, message: "El correo ya está registrado" };
    }

    // 2. Hashear contraseña
    const pwdHash = verifyPassword(data.pass, ""); // Hack: verifyPassword(pass, "") generates a hash of pass
    // Wait, verifyPassword(pass, hash) returns pass === hash.
    // I need a hash function. I'll update auth-utils.ts to export it properly if needed, but I'll use the one I have.
    // Actually, I'll update auth-utils.ts now.
    
    // For now, I'll use crypto directly here to be sure.
    const { hashPassword } = await import("@/lib/auth-utils");
    const passwordHash = hashPassword(data.pass);

    // 3. Insertar en usuarios_sistema
    const [user] = await sql`
      INSERT INTO public.usuarios_sistema (email, password_hash, full_name, role)
      VALUES (${data.email}, ${passwordHash}, ${data.name}, ${data.role})
      RETURNING id
    `;

    // 3.5 Mantener sincronía con la tabla profiles para evitar errores de Foreign Key en especialistas
    await sql`
      INSERT INTO public.profiles (id, full_name, role)
      VALUES (${user.id}, ${data.name}, ${data.role})
      ON CONFLICT (id) DO NOTHING
    `;

    // 4. Si es psicólogo, insertar en especialistas
    if (data.role === "psicologo") {
      await sql`
        INSERT INTO public.especialistas (id_usuario, nombre, especialidad, número_licencia, estado_verificación)
        VALUES (${user.id}, ${data.name}, 'Pendiente de definir', ${data.licenseNumber || ''}, 'pending')
      `;
    }

    return { success: true, message: "Registro exitoso. Ya puedes iniciar sesión." };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Error al registrar el usuario" };
  }
}
