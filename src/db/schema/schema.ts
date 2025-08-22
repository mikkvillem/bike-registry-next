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

export const bicycle = pgTable('bicycle', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => user.id)
    .notNull(),
  imageUrls: text('image_urls').array(), // stores multiple image URLs
  type: bicycleTypeEnum('type'),
  wheelSize: varchar('wheel_size'),
  weight: integer('weight'),
  gearSystem: integer('num_gears'),
  numGears: integer('num_gears'),
  gender: bicycleGenderEnum('gender'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

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

export const theft = pgTable('theft', {
  id: text('id').primaryKey(),
  bicycleId: text('bicycle_id')
    .references(() => bicycle.id)
    .notNull(),
  description: text('description'),
  contact: text('contact'), // telephone + whatever?
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

export const theftRelation = relations(bicycle, ({ one }) => ({
  theft: one(theft, {
    fields: [bicycle.id],
    references: [theft.bicycleId],
  }),
}));

export type Bicycle = typeof bicycle.$inferSelect;
export type Theft = typeof theft.$inferSelect;
