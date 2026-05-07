import { pgTable, bigserial, text, timestamp, uuid, bigint } from 'drizzle-orm/pg-core';

export const journalEntries = pgTable('entradas_del_diario', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  userId: uuid('ID de usuario').notNull(),
  title: text('título').notNull().default('Registro Emocional'),
  content: text('contenido').notNull(),
  mood: text('ánimo').notNull(),
  createdAt: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable('conversaciones', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  userId: uuid('ID de usuario').notNull(),
  specialistId: bigint('ID de especialista', { mode: 'number' }).references(() => specialists.id),
  title: text('título').default('Nueva conversación'),
  createdAt: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable('mensajes', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  conversationId: bigint('ID de conversación', { mode: 'number' }).references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('ID de usuario').notNull(),
  text: text('texto').notNull(),
  role: text('role').notNull(),
  timestamp: timestamp('marca de tiempo', { withTimezone: true }).defaultNow().notNull(),
});

export const exercises = pgTable('ceremonias', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  title: text('título').notNull(),
  description: text('descripción').notNull(),
  category: text('categoría').notNull(),
  duration: text('duración').notNull(),
  difficulty: text('dificultad').notNull(),
  image: text('imagen'),
  steps: text('pasos').array(),
});

export const specialists = pgTable('especialistas', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  userId: uuid('id_usuario').references(() => profiles.id).notNull(),
  name: text('nombre').notNull(),
  specialty: text('especialidad').notNull(),
  rating: text('calificación').default('5.0'),
  image: text('imagen'),
  price: text('precio').default('S/ 0'),
  availability: text('disponibilidad').default('Disponible'),
  licenseNumber: text('número_licencia'),
  verificationStatus: text('estado_verificación').default('pending').notNull(), // 'pending', 'approved', 'rejected'
});

export const appointments = pgTable('citas', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  userId: uuid('ID de usuario').notNull(),
  specialistId: bigint('ID de especialista', { mode: 'number' }).references(() => specialists.id),
  date: text('fecha').notNull(),
  time: text('hora').notNull(),
  status: text('estado').default('Pendiente'),
  createdAt: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Vinculado al Auth ID
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: text('role').default('usuario').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const badges = pgTable('logros', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  name: text('nombre').notNull(),
  description: text('descripción').notNull(),
  icon: text('icono').notNull(),
});

export const userBadges = pgTable('usuarios_logros', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  userId: uuid('ID de usuario').references(() => profiles.id).notNull(),
  badgeId: bigint('ID de logro', { mode: 'number' }).references(() => badges.id).notNull(),
  earnedAt: timestamp('ganado_en', { withTimezone: true }).defaultNow().notNull(),
});
