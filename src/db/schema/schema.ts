import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  varchar,
  boolean,
  numeric,
  check,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { user } from './auth-schema';

export const bicycleTypeEnum = pgEnum('type', [
  'city',
  'gravel',
  'electric',
  'BMX',
  'hybrid',
  'mountain',
  'road',
  'fatbike',
  'kids',
  'cargo',
]);

export const bicycleGenderEnum = pgEnum('gender', ['male', 'female', 'unisex']);
export const bicycleGearSystemEnum = pgEnum('gearSystem', [
  'internal',
  'external',
  'fixie',
]);

export const bicycle = pgTable(
  'bicycle',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id)
      .notNull(),
    make: text('make').notNull(),
    model: text('model'),
    serialNumber: text('serial_number').notNull(),
    imageUrls: text('image_urls').array(), // stores multiple image URLs
    type: bicycleTypeEnum('type'),
    wheelSize: varchar('wheel_size'),
    weight: integer('weight'),
    gearSystem: bicycleGearSystemEnum('gear_system'),
    numGears: integer('num_gears'),
    gender: bicycleGenderEnum('gender'),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    // Case/whitespace-insensitive: the same physical bike can't be
    // registered twice under "Trek" and "trek". NULL model is normalized to
    // '' so two bikes with the same make/serial and no model still collide.
    // Scoped to non-deleted rows so a removed registration frees its serial.
    uniqueIndex('bicycle_serial_make_model_idx')
      .on(
        sql`lower(trim(${table.serialNumber}))`,
        sql`lower(trim(${table.make}))`,
        sql`coalesce(lower(trim(${table.model})), '')`
      )
      .where(sql`${table.deletedAt} is null`),
  ]
);

export const listing = pgTable(
  'listing',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id)
      .notNull(),
    bicycleId: text('bicycle_id')
      .references(() => bicycle.id)
      .notNull(),
    isForSale: boolean('is_for_sale').default(false),
    price: numeric('price', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('delete_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => {
    return [check('price_check1', sql`${table.price} > 0`)];
  }
);

export const theftStatusEnum = pgEnum('theft_status', [
  'active',
  'recovered',
  'resolved',
]);

export const theft = pgTable(
  'theft',
  {
    id: text('id').primaryKey(),
    bicycleId: text('bicycle_id')
      .references(() => bicycle.id)
      .notNull(),
    status: theftStatusEnum('status').notNull().default('active'),
    // Null until the report is made visible on the public status page.
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    description: text('description'),
    contact: text('contact'), // telephone + whatever?
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    // A bike can be reported stolen more than once over its life (stolen,
    // recovered, stolen again) but only one report can be active at a time.
    uniqueIndex('theft_bicycle_active_idx')
      .on(table.bicycleId)
      .where(sql`${table.status} = 'active' and ${table.deletedAt} is null`),
  ]
);

export const theftRelation = relations(bicycle, ({ many }) => ({
  theftReports: many(theft),
}));

export type Bicycle = typeof bicycle.$inferSelect;
export type Theft = typeof theft.$inferSelect;
