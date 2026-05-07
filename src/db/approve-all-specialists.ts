import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function approveAll() {
  console.log('Sincronizando esquema y aprobando especialistas...');

  try {
    // 1. Asegurar que las columnas existen (por si el push falló)
    await sql`ALTER TABLE especialistas ADD COLUMN IF NOT EXISTS número_licencia text;`;
    await sql`ALTER TABLE especialistas ADD COLUMN IF NOT EXISTS estado_verificación text DEFAULT 'pending' NOT NULL;`;

    // 2. Actualizar a todos a approved
    const result = await sql`
      UPDATE especialistas 
      SET estado_verificación = 'approved' 
    `;

    console.log('--------------------------------------------------');
    console.log('APROBACIÓN COMPLETADA');
    console.log('Especialistas actualizados:', result.count);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('Error al aprobar especialistas:', error);
  } finally {
    await sql.end();
  }
}

approveAll();
