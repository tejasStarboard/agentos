import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  jsonb,
  pgTable,
  primaryKey as pgPrimaryKey,
  text as pgText,
  timestamp,
} from 'drizzle-orm/pg-core';

/** SQLite `documents` — JSON stored as text. */
export const sqliteDocuments = sqliteTable(
  'documents',
  {
    collection: text('collection').notNull(),
    id: text('id').notNull(),
    data: text('data').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.collection, t.id] })],
);

/** Postgres `documents` — JSON stored as jsonb. */
export const pgDocuments = pgTable(
  'documents',
  {
    collection: pgText('collection').notNull(),
    id: pgText('id').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
  },
  (t) => [pgPrimaryKey({ columns: [t.collection, t.id] })],
);
