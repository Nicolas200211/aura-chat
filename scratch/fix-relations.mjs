import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function fixRelations() {
  try {
    console.log('Estableciendo relaciones de integridad en Supabase...');

    // 1. Relación: entradas_del_diario -> auth.users
    await sql`
      ALTER TABLE entradas_del_diario 
      ADD CONSTRAINT fk_diario_usuario 
      FOREIGN KEY ("ID de usuario") 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
    `.catch(e => console.log('Relación diario ya existe o error:', e.message));

    // 2. Relación: conversaciones -> auth.users
    await sql`
      ALTER TABLE conversaciones 
      ADD CONSTRAINT fk_conversaciones_usuario 
      FOREIGN KEY ("ID de usuario") 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
    `.catch(e => console.log('Relación conversaciones ya existe o error:', e.message));

    // 3. Relación: mensajes -> conversaciones (Asegurar)
    await sql`
      ALTER TABLE mensajes 
      ADD CONSTRAINT fk_mensajes_conversacion 
      FOREIGN KEY ("ID de conversación") 
      REFERENCES conversaciones(identificación) 
      ON DELETE CASCADE;
    `.catch(e => console.log('Relación mensajes ya existe o error:', e.message));

    console.log('Relaciones establecidas con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error al fijar relaciones:', error);
    process.exit(1);
  }
}

fixRelations();
