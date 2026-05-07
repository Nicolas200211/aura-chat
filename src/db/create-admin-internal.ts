import postgres from 'postgres';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function createAdmin() {
  const adminEmail = 'admin@aurachat.com';
  const adminPass = '123456';
  const adminName = 'Administrador Maestro';
  const userId = crypto.randomUUID();

  console.log('Iniciando creación de administrador interno...');

  try {
    // 1. Crear en auth.users (Supabase Auth)
    // Usamos SQL crudo para saltarnos la API de Supabase y hacerlo 'de sangre'
    await sql`
      INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        raw_user_meta_data, 
        aud, 
        role,
        created_at,
        updated_at,
        last_sign_in_at
      )
      VALUES (
        ${userId}, 
        ${adminEmail}, 
        extensions.crypt(${adminPass}, extensions.gen_salt('bf')), 
        now(), 
        ${JSON.stringify({ role: "admin", full_name: adminName })},
        'authenticated',
        'authenticated',
        now(),
        now(),
        now()
      )
    `;

    console.log('Usuario inyectado en auth.users con ID:', userId);

    // 2. El trigger 'on_auth_user_created' debería activarse, 
    // pero por si acaso o si no existe, aseguramos el perfil.
    await sql`
      INSERT INTO profiles (id, full_name, role, updated_at)
      VALUES (${userId}, ${adminName}, 'admin', now())
      ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = ${adminName}
    `;

    console.log('Perfil de administrador configurado correctamente.');
    console.log('--------------------------------------------------');
    console.log('CREACIÓN EXITOSA');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPass);
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('Error al crear el administrador:', error);
  } finally {
    await sql.end();
  }
}

createAdmin();
