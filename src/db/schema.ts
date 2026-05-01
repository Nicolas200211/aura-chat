import { pgTable, bigserial, text, timestamp, uuid, bigint } from 'drizzle-orm/pg-core';

export const journalEntries = pgTable('entradas_del_diario', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  userId: uuid('ID de usuario').notNull(),
  content: text('contenido').notNull(),
  mood: text('ánimo').notNull(),
  createdAt: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable('conversaciones', {
  id: bigserial('identificación', { mode: 'number' }).primaryKey(),
  userId: uuid('ID de usuario').notNull(),
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
  name: text('nombre').notNull(),
  specialty: text('especialidad').notNull(),
  rating: text('clasificación').notNull(),
  experience: text('experiencia').notNull(),
  image: text('imagen'),
  availability: text('disponibilidad').notNull(),
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

export const profiles = pgTable('perfiles', {
  id: uuid('id').primaryKey(), // Vinculado al Auth ID
  fullName: text('nombre_completo'),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('actualizado_en', { withTimezone: true }).defaultNow().notNull(),
});
