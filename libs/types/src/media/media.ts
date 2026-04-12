import { Prisma } from "../../../../apps/delivest-api/generated/prisma/client.js";

export type EntityModelName = Uncapitalize<Prisma.ModelName>;

export type PhotoDelegate = {
  findUnique: (args: {
    where: { id: string };
    select: { photos: true };
  }) => Promise<{ photos: Prisma.JsonValue } | null>;

  update: (args: {
    where: { id: string };
    data: { photos: any };
    select: { photos: true };
  }) => Promise<{ photos: Prisma.JsonValue }>;
};
