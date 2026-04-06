import "dotenv/config";

import { DevelopmentStatus, UserRole } from "@prisma/client";

import { hashPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "devwk.c@gmail.com")
    .trim()
    .toLowerCase();
  const adminPasswordPlain = (process.env.ADMIN_PASSWORD ?? "change-me").trim();
  const passwordHash = await hashPassword(adminPasswordPlain);

  const company = await prisma.company.upsert({
    where: { slug: "demo-urbanismo" },
    update: {
      name: "Demo Urbanismo",
      active: true,
    },
    create: {
      name: "Demo Urbanismo",
      slug: "demo-urbanismo",
      email: "contato@demourbanismo.com.br",
      phone: "5562999999999",
      active: true,
    },
  });

  const city = await prisma.city.upsert({
    where: { slug: "goiania-go" },
    update: {
      name: "Goiania",
      state: "GO",
    },
    create: {
      name: "Goiania",
      state: "GO",
      slug: "goiania-go",
    },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin LoteMap",
      role: UserRole.SUPERADMIN,
      active: true,
      passwordHash,
    },
    create: {
      name: "Admin LoteMap",
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPERADMIN,
      active: true,
      companyId: company.id,
    },
  });

  await prisma.development.upsert({
    where: {
      cityId_slug: {
        cityId: city.id,
        slug: "residencial-das-palmeiras",
      },
    },
    update: {
      name: "Residencial das Palmeiras",
      companyId: company.id,
      whatsapp: "5562999999999",
      status: DevelopmentStatus.PUBLISHED,
      published: true,
      mapSvgUrl: "/exemplo-loteamento.svg",
    },
    create: {
      companyId: company.id,
      cityId: city.id,
      name: "Residencial das Palmeiras",
      slug: "residencial-das-palmeiras",
      shortDescription: "Loteamento com infraestrutura completa.",
      status: DevelopmentStatus.PUBLISHED,
      whatsapp: "5562999999999",
      published: true,
      mapSvgUrl: "/exemplo-loteamento.svg",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
