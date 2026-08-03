import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
const SEED_MARTILLERO_PASSWORD = process.env.SEED_MARTILLERO_PASSWORD || "Martillero123!";
const SEED_POSTOR_PASSWORD = process.env.SEED_POSTOR_PASSWORD || "Postor123!";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  // Admin
  const adminPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@remates.cl" },
    update: {},
    create: {
      email: "admin@remates.cl",
      name: "Administrador",
      passwordHash: adminPassword,
      role: "ADMINISTRATIVO",
    },
  });

  // Martillero
  const martilleroPassword = await bcrypt.hash(SEED_MARTILLERO_PASSWORD, 10);
  const martillero = await prisma.user.upsert({
    where: { email: "martillero@remates.cl" },
    update: {},
    create: {
      email: "martillero@remates.cl",
      name: "Carlos Martínez",
      passwordHash: martilleroPassword,
      role: "MARTILLERO",
    },
  });

  // Postor
  const postorPassword = await bcrypt.hash(SEED_POSTOR_PASSWORD, 10);
  const postor = await prisma.user.upsert({
    where: { email: "postor@remates.cl" },
    update: {},
    create: {
      email: "postor@remates.cl",
      name: "Juan Pérez",
      passwordHash: postorPassword,
      role: "POSTOR",
    },
  });

  // Segundo postor SIN garantía (para demostrar el bloqueo 1:1 por lote)
  await prisma.user.upsert({
    where: { email: "postor2@remates.cl" },
    update: {},
    create: {
      email: "postor2@remates.cl",
      name: "María González",
      passwordHash: postorPassword,
      role: "POSTOR",
    },
  });

  // Activo de ejemplo - Toyota Hilux
  let seededAsset = await prisma.asset.findFirst({
    where: { description: "Toyota Hilux 2022 4x4 Diesel SRV" },
  });

  if (seededAsset) {
    seededAsset = await prisma.asset.update({
      where: { id: seededAsset.id },
      data: {
        imageUrl: "https://picsum.photos/seed/toyota-hilux-2022/800/600",
        status: "ACTIVO",
        approvalStatus: "APROBADO",
      },
    });
    console.log(`Activo actualizado: ${seededAsset.description} con imagen`);
  } else {
    seededAsset = await prisma.asset.create({
      data: {
        description: "Toyota Hilux 2022 4x4 Diesel SRV",
        basePrice: 15000000,
        currentPrice: 15000000,
        status: "ACTIVO",
        approvalStatus: "APROBADO",
        imageUrl: "https://picsum.photos/seed/toyota-hilux-2022/800/600",
        martilleroId: martillero.id,
        approvedById: admin.id,
      },
    });
    console.log(`Activo creado: ${seededAsset.description} (ID: ${seededAsset.id})`);
  }

  // Garantía pagada 1:1 para el postor en el lote sembrado
  const existingGuarantee = await prisma.bidderGuarantee.findFirst({
    where: { userId: postor.id, assetId: seededAsset.id },
  });

  if (!existingGuarantee) {
    await prisma.bidderGuarantee.create({
      data: {
        userId: postor.id,
        assetId: seededAsset.id,
        amount: 500000,
        isPaid: true,
        paymentDate: new Date(),
      },
    });
    console.log(`Garantía creada para ${postor.email} en lote ${seededAsset.description}`);
  }

  console.log("Seed completado:");
  console.log(`  Admin:      ${admin.email} (contraseña desde env SEED_ADMIN_PASSWORD)`);
  console.log(`  Martillero: ${martillero.email} (contraseña desde env SEED_MARTILLERO_PASSWORD)`);
  console.log(`  Postor:     ${postor.email} (contraseña desde env SEED_POSTOR_PASSWORD)`);
  console.log(`  Postor2:    postor2@remates.cl (sin garantía, bloqueado para pujar)`);

  await prisma.$disconnect();
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
