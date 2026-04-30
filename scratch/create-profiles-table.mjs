import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function create() {
  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS perfiles (
        id UUID PRIMARY KEY,
        nombre_completo TEXT,
        avatar_url TEXT,
        actualizado_en TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Tabla perfiles creada con éxito.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

create();
