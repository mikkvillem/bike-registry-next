"use server";

import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { bicycle, theft } from "@/db/schema/schema";

export type SearchResult = {
  id: string;
  make: string;
  model: string | null;
  type: string | null;
  serialNumber: string;
  imageUrls: string[] | null;
  stolen: {
    status: string;
    publishedAt: Date | null;
    stolenOn: string | null;
    location: string | null;
    description: string | null;
  } | null;
};

export async function searchBikes(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const normalizedQuery = query.trim().toLowerCase();

  const results = await db
    .select({
      id: bicycle.id,
      make: bicycle.make,
      model: bicycle.model,
      type: bicycle.type,
      serialNumber: bicycle.serialNumber,
      imageUrls: bicycle.imageUrls,
      theftId: theft.id,
      theftStatus: theft.status,
      publishedAt: theft.publishedAt,
      stolenOn: theft.stolenOn,
      location: theft.location,
      description: theft.description,
    })
    .from(bicycle)
    .leftJoin(
      theft,
      and(
        eq(theft.bicycleId, bicycle.id),
        eq(theft.status, "active"),
        isNotNull(theft.publishedAt),
        isNull(theft.deletedAt),
      ),
    )
    .where(
      and(
        sql`lower(trim(${bicycle.serialNumber})) like ${`%${normalizedQuery}%`}`,
        isNull(bicycle.deletedAt),
      ),
    )
    .orderBy(bicycle.createdAt);

  const bikeMap = new Map<string, SearchResult>();

  for (const row of results) {
    if (!bikeMap.has(row.id)) {
      bikeMap.set(row.id, {
        id: row.id,
        make: row.make,
        model: row.model,
        type: row.type,
        serialNumber: row.serialNumber,
        imageUrls: row.imageUrls,
        stolen: row.theftId
          ? {
              status: row.theftStatus ?? "active",
              publishedAt: row.publishedAt,
              stolenOn: row.stolenOn,
              location: row.location,
              description: row.description,
            }
          : null,
      });
    }
  }

  return Array.from(bikeMap.values());
}
