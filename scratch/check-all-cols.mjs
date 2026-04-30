import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function check() {
  const tables = ['conversaciones', 'mensajes', 'entradas_del_diario', 'ceremonias', 'especialistas'];
  for (const table of tables) {
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${table}`;
    console.log(`Columnas de ${table}:`, cols.map(c => c.column_name));
  }
  process.exit(0);
}

check();
