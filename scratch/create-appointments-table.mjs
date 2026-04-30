import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function create() {
  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS citas (
        identificación BIGSERIAL PRIMARY KEY,
        "ID de usuario" UUID NOT NULL,
        "ID de especialista" BIGINT REFERENCES especialistas(identificación),
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        estado TEXT DEFAULT 'Pendiente',
        creado_en TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Tabla citas creada y sincronizada.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

create();
