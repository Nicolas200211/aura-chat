import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function fixDatabase() {
  console.log('Iniciando estandarización de columnas...');

  try {
    // Renombrar columnas con nombres "sucios" (con espacios o tildes)
    // Usamos SQL crudo para asegurar el mapeo con Drizzle
    
    const columnsToRename = [
      { old: 'ID de usuario', new: 'id_usuario' },
      { old: 'clasificación', new: 'calificación' },
      { old: 'identificación', new: 'identificación' } // por si acaso
    ];

    for (const col of columnsToRename) {
      try {
        await sql.unsafe(`ALTER TABLE especialistas RENAME COLUMN "${col.old}" TO ${col.new}`);
        console.log(`Columna "${col.old}" renombrada a "${col.new}"`);
      } catch (e: any) {
        console.log(`Aviso: No se pudo renombrar "${col.old}" (posiblemente ya existe o no está):`, e.message);
      }
    }

    // Asegurar que las nuevas columnas existan
    await sql`ALTER TABLE especialistas ADD COLUMN IF NOT EXISTS precio text DEFAULT 'S/ 0'`;
    await sql`ALTER TABLE especialistas ADD COLUMN IF NOT EXISTS número_licencia text`;
    await sql`ALTER TABLE especialistas ADD COLUMN IF NOT EXISTS estado_verificación text DEFAULT 'pending' NOT NULL`;

    // Forzar aprobación para que aparezcan en Terapia
    const adminId = 'f0949bbd-0122-4f9d-91c7-a4e7e8ad1e92';
    await sql`UPDATE especialistas SET id_usuario = ${adminId} WHERE id_usuario IS NULL`;
    await sql`UPDATE especialistas SET estado_verificación = 'approved' WHERE estado_verificación != 'approved'`;
    await sql`UPDATE especialistas SET precio = 'S/ 60' WHERE precio IS NULL OR precio = 'S/ 0'`;

    console.log('--------------------------------------------------');
    console.log('BASE DE DATOS ESTANDARIZADA CON ÉXITO');
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('Error crítico durante la estandarización:', error);
  } finally {
    await sql.end();
  }
}

fixDatabase();
