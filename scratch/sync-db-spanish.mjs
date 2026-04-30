import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function transformAndRelate() {
  try {
    console.log('Iniciando transformación de tablas a Español y estableciendo relaciones...');

    // 1. Renombrar tablas si existen en inglés
    const renameSpecs = [
      ['exercises', 'ceremonias'],
      ['messages', 'mensajes'],
      ['conversations', 'conversaciones'],
      ['journal_entries', 'entradas_del_diario'],
      ['specialists', 'especialistas']
    ];

    for (const [oldName, newName] of renameSpecs) {
      await sql.unsafe(`ALTER TABLE IF EXISTS ${oldName} RENAME TO ${newName}`).catch(() => {});
    }

    // 2. Renombrar columnas clave para que coincidan con la captura
    await sql.unsafe(`ALTER TABLE mensajes RENAME COLUMN conversation_id TO "ID de conversación"`).catch(() => {});
    await sql.unsafe(`ALTER TABLE mensajes RENAME COLUMN user_id TO "ID de usuario"`).catch(() => {});
    await sql.unsafe(`ALTER TABLE conversaciones RENAME COLUMN user_id TO "ID de usuario"`).catch(() => {});
    await sql.unsafe(`ALTER TABLE entradas_del_diario RENAME COLUMN user_id TO "ID de usuario"`).catch(() => {});
    
    // Ajustar columnas de ceremonias (exercises)
    await sql.unsafe(`ALTER TABLE ceremonias RENAME COLUMN title TO título`).catch(() => {});
    await sql.unsafe(`ALTER TABLE ceremonias RENAME COLUMN description TO descripción`).catch(() => {});
    await sql.unsafe(`ALTER TABLE ceremonias RENAME COLUMN category TO categoría`).catch(() => {});
    await sql.unsafe(`ALTER TABLE ceremonias RENAME COLUMN duration TO duración`).catch(() => {});
    await sql.unsafe(`ALTER TABLE ceremonias RENAME COLUMN difficulty TO dificultad`).catch(() => {});

    // 3. ESTABLECER RELACIONES (Foreign Keys)
    console.log('Creando llaves foráneas...');

    // Mensajes -> Conversaciones
    await sql.unsafe(`
      ALTER TABLE mensajes 
      ADD CONSTRAINT fk_mensajes_conversacion 
      FOREIGN KEY ("ID de conversación") 
      REFERENCES conversaciones(id) 
      ON DELETE CASCADE
    `).catch(() => {});

    // Conversaciones -> Usuarios
    await sql.unsafe(`
      ALTER TABLE conversaciones 
      ADD CONSTRAINT fk_conversaciones_usuario 
      FOREIGN KEY ("ID de usuario") 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE
    `).catch(() => {});

    // Diario -> Usuarios
    await sql.unsafe(`
      ALTER TABLE entradas_del_diario 
      ADD CONSTRAINT fk_diario_usuario 
      FOREIGN KEY ("ID de usuario") 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE
    `).catch(() => {});

    console.log('¡Base de datos sincronizada y relacionada con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('Error en la transformación:', error);
    process.exit(1);
  }
}

transformAndRelate();
