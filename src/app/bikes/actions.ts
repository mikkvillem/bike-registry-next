"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  bicycle,
  bicycleGearSystemEnum,
  bicycleGenderEnum,
  bicycleTypeEnum,
} from "@/db/schema/schema";
import { getSession } from "@/lib/session";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

function asEnumValue<T extends readonly string[]>(
  values: T,
  value: FormDataEntryValue | null,
): T[number] | undefined {
  return values.includes(value as string) ? (value as T[number]) : undefined;
}

async function saveImages(bikeId: string, files: File[]): Promise<string[]> {
  const validFiles = files.filter((file) => file.size > 0);
  if (validFiles.length === 0) return [];

  const bikeDir = path.join(uploadsDir, bikeId);
  await mkdir(bikeDir, { recursive: true });

  const urls: string[] = [];
  for (const [index, file] of validFiles.entries()) {
    const ext = path.extname(file.name) || "";
    const filename = `${index}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(bikeDir, filename), buffer);
    urls.push(`/uploads/${bikeId}/${filename}`);
  }
  return urls;
}

export async function createBike(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");

  const make = (formData.get("make") as string)?.trim();
  const serialNumber = (formData.get("serialNumber") as string)?.trim();
  if (!make || !serialNumber) {
    throw new Error("Make and serial number are required.");
  }
  const model = (formData.get("model") as string)?.trim() || null;

  const bikeId = crypto.randomUUID();
  const images = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File);
  const imageUrls = await saveImages(bikeId, images);

  const weightRaw = formData.get("weight");
  const numGearsRaw = formData.get("numGears");

  try {
    await db.insert(bicycle).values({
      id: bikeId,
      userId: session.user.id,
      make,
      model,
      serialNumber,
      type: asEnumValue(bicycleTypeEnum.enumValues, formData.get("type")),
      gender: asEnumValue(bicycleGenderEnum.enumValues, formData.get("gender")),
      gearSystem: asEnumValue(
        bicycleGearSystemEnum.enumValues,
        formData.get("gearSystem"),
      ),
      wheelSize: (formData.get("wheelSize") as string) || null,
      weight: weightRaw ? Number(weightRaw) : null,
      numGears: numGearsRaw ? Number(numGearsRaw) : null,
      description: (formData.get("description") as string) || null,
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("bicycle_serial_make_model_idx")
    ) {
      throw new Error(
        "A bike with this make, model, and serial number is already registered.",
      );
    }
    throw error;
  }

  redirect(`/bikes/${bikeId}`);
}
