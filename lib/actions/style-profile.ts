"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { styleProfileSchema, type StyleProfileFormValues } from "@/lib/validations";

export async function upsertStyleProfile(values: StyleProfileFormValues) {
  const parsed = styleProfileSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the style profile fields and try again." };
  }

  const existing = await prisma.styleProfile.findFirst({
    select: { id: true }
  });

  if (existing) {
    await prisma.styleProfile.update({
      where: { id: existing.id },
      data: parsed.data
    });
  } else {
    await prisma.styleProfile.create({
      data: parsed.data
    });
  }

  revalidatePath("/style-profile");
  return { ok: true };
}
