import postgres from 'postgres';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: 'require' });

async function createNewAdmin() {
  const adminEmail = 'admin1@aurachat.com';
  const adminPass = '123456';
  const adminName = 'Nuevo Administrador';
  const userId = crypto.randomUUID();

  console.log(`🚀 Iniciando creación de administrador: ${adminEmail}...`);

  try {
    // 1. Verificar si ya existe
    const existing = await sql`SELECT id FROM auth.users WHERE email = ${adminEmail}`;
    let finalUserId = userId;

    if (existing.length > 0) {
      finalUserId = existing[0].id;
      console.log(`Usuario ya existe con ID: ${finalUserId}. Actualizando rol...`);
      
      await sql`
        UPDATE auth.users SET
          raw_user_meta_data = ${JSON.stringify({ role: "admin", full_name: adminName })},
          updated_at = now()
        WHERE id = ${finalUserId}
      `;
    } else {
      await sql`
        INSERT INTO auth.users (
          id, email, encrypted_password, email_confirmed_at, 
          raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at, instance_id
        )
        VALUES (
          ${userId}, ${adminEmail}, extensions.crypt(${adminPass}, extensions.gen_salt('bf')), now(), 
          ${JSON.stringify({ role: "admin", full_name: adminName })},
          ${JSON.stringify({ provider: 'email', providers: ['email'] })},
          'authenticated', 'authenticated', now(), now(), '00000000-0000-0000-0000-000000000000'
        )
      `;
      console.log('✅ Usuario inyectado en auth.users');
    }

    // 2. Asegurar el perfil en la tabla pública
    await sql`
      INSERT INTO profiles (id, full_name, role, updated_at)
      VALUES (${finalUserId}, ${adminName}, 'admin', now())
      ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = ${adminName}
    `;

    console.log('✅ Perfil de administrador configurado en la tabla profiles.');
    console.log('--------------------------------------------------');
    console.log('CREACIÓN EXITOSA');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPass);
    console.log('Rol:', 'admin');
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

createNewAdmin();
