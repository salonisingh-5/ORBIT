import { PrismaClient } from "@prisma/client";
import { SEED_CLUBS, SEED_OPPORTUNITIES } from "../src/lib/seed-data";

const prisma = new PrismaClient();

const SEED_USER_EMAIL = "orbit-seed@rvce.edu.in";

async function main() {
  const seedUser = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: { name: "ORBIT Seed Publisher", role: "ADMIN" },
    create: {
      email: SEED_USER_EMAIL,
      name: "ORBIT Seed Publisher",
      role: "ADMIN",
    },
  });

  for (const club of SEED_CLUBS) {
    await prisma.club.upsert({
      where: { slug: club.slug },
      update: {
        name: club.name,
        description: club.description,
        logoUrl: club.logoUrl,
        websiteUrl: club.websiteUrl,
      },
      create: {
        name: club.name,
        slug: club.slug,
        description: club.description,
        logoUrl: club.logoUrl,
        websiteUrl: club.websiteUrl,
      },
    });
  }

  for (const opportunity of SEED_OPPORTUNITIES) {
    const club = await prisma.club.findUnique({
      where: { slug: opportunity.clubSlug },
    });

    const dates = {
      deadline: new Date(opportunity.deadline),
      startDate: opportunity.startDate ? new Date(opportunity.startDate) : null,
      endDate: opportunity.endDate ? new Date(opportunity.endDate) : null,
    };

    await prisma.opportunity.upsert({
      where: { slug: opportunity.slug },
      update: {
        title: opportunity.title,
        description: opportunity.description,
        category: opportunity.category,
        officialUrl: opportunity.officialUrl,
        location: opportunity.location,
        status: opportunity.status,
        clubId: club?.id ?? null,
        createdById: seedUser.id,
        ...dates,
      },
      create: {
        id: opportunity.id,
        title: opportunity.title,
        slug: opportunity.slug,
        description: opportunity.description,
        category: opportunity.category,
        officialUrl: opportunity.officialUrl,
        location: opportunity.location,
        status: opportunity.status,
        clubId: club?.id ?? null,
        createdById: seedUser.id,
        ...dates,
      },
    });
  }

  console.log(
    `Seeded ${SEED_CLUBS.length} clubs and ${SEED_OPPORTUNITIES.length} opportunities.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
