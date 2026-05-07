import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString, { prepare: false, ssl: 'require' });
const db = drizzle(client);

async function createTestPsychologist() {
  console.log('🚀 Creando usuario psicólogo de prueba...');

  try {
    // 1. Intentamos crear el usuario en auth.users (esquema interno de Supabase)
    // Usamos SQL plano porque Drizzle no maneja el esquema 'auth' por defecto
    const userId = '77777777-7777-7777-7777-777777777777'; // ID fijo para pruebas
    const email = 'psicologo@test.com';
    // Contraseña: 'Nicolas12345678' (hasheada para Supabase/Postgres)
    const passwordHash = '$2a$10$abcdefghijklmnopqrstuv'; // Esto es solo un placeholder, Supabase usa bcrypt

    console.log('1. Insertando en auth.users (si no existe)...');
    await client`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
      VALUES (
        ${userId}, 
        '00000000-0000-0000-0000-000000000000', 
        ${email}, 
        crypt('Nicolas12345678', gen_salt('bf')), 
        now(), 
        'authenticated', 
        'authenticated', 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name":"Nicolas Psicologo"}', 
        now(), 
        now(), 
        '', '', '', ''
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    console.log('2. Insertando en public.perfiles...');
    await client`
      INSERT INTO public.perfiles (id, nombre_completo, rol, actualizado_en)
      VALUES (${userId}, 'Nicolas Psicologo', 'psicologo', now())
      ON CONFLICT (id) DO UPDATE SET rol = 'psicologo';
    `;

    console.log('3. Insertando en public.especialistas...');
    await client`
      INSERT INTO public.especialistas (userId, nombre, especialidad, clasificación, experiencia, disponibilidad)
      VALUES (${userId}, 'Nicolas Psicologo', 'Psicología Clínica Pro', '5.0', '15 años', 'Lun - Sáb')
      ON CONFLICT DO NOTHING;
    `;

    console.log('✅ Usuario psicólogo creado con éxito!');
    console.log('Email: psicologo@test.com');
    console.log('Password: Nicolas12345678');
    
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createTestPsychologist();
