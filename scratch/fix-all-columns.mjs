import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function fix() {
  try {
    // Conversaciones
    await sql.unsafe('ALTER TABLE conversaciones RENAME COLUMN id TO identificación').catch(() => {});
    await sql.unsafe('ALTER TABLE conversaciones RENAME COLUMN title TO título').catch(() => {});
    await sql.unsafe('ALTER TABLE conversaciones RENAME COLUMN created_at TO creado_en').catch(() => {});
    
    // Mensajes
    await sql.unsafe('ALTER TABLE mensajes RENAME COLUMN id TO identificación').catch(() => {});
    await sql.unsafe('ALTER TABLE mensajes RENAME COLUMN text TO texto').catch(() => {});
    await sql.unsafe('ALTER TABLE mensajes RENAME COLUMN timestamp TO "marca de tiempo"').catch(() => {});
    
    // Diario
    await sql.unsafe('ALTER TABLE entradas_del_diario RENAME COLUMN id TO identificación').catch(() => {});
    await sql.unsafe('ALTER TABLE entradas_del_diario RENAME COLUMN content TO contenido').catch(() => {});
    await sql.unsafe('ALTER TABLE entradas_del_diario RENAME COLUMN mood TO ánimo').catch(() => {});
    await sql.unsafe('ALTER TABLE entradas_del_diario RENAME COLUMN created_at TO creado_en').catch(() => {});

    // Especialistas y Ceremonias
    await sql.unsafe('ALTER TABLE especialistas RENAME COLUMN id TO identificación').catch(() => {});
    await sql.unsafe('ALTER TABLE ceremonias RENAME COLUMN id TO identificación').catch(() => {});

    console.log('Sincronización de columnas completada.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
