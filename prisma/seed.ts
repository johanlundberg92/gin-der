import { SessionStage } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { generateAdminPin, generateJoinCodeCandidate } from "@/lib/session-logic";

async function main() {
  await prisma.tastingNote.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.gin.deleteMany();
  await prisma.session.deleteMany();

  const session = await prisma.session.create({
    data: {
      name: "Friday Botanical Flight",
      eventDate: new Date(),
      joinCode: generateJoinCodeCandidate(),
      adminPin: generateAdminPin(),
      stage: SessionStage.LOBBY,
      gins: {
        create: [
          {
            order: 1,
            name: "Nordic Dry",
            distillery: "Juniper Works",
            abv: 42,
            description: "Bright citrus peel, white pepper, and a clean pine finish.",
          },
          {
            order: 2,
            name: "Garden Reserve",
            distillery: "Glasshouse Spirits",
            abv: 45,
            description: "Soft floral lift with coriander warmth and rosemary depth.",
          },
          {
            order: 3,
            name: "Coastal Bloom",
            distillery: "Harbor Distilling",
            abv: 47,
            description: "Saline edge, grapefruit oils, and a long herbal snap.",
          },
        ],
      },
    },
    include: {
      gins: true,
    },
  });

  const participant = await prisma.participant.create({
    data: {
      sessionId: session.id,
      name: "Demo Taster",
      accessToken: crypto.randomUUID(),
    },
  });

  await prisma.tastingNote.create({
    data: {
      participantId: participant.id,
      ginId: session.gins[0].id,
      overallScore: 8,
      juniper: 5,
      citrus: 4,
      floral: 3,
      spice: 4,
      herbal: 3,
      sweetness: 2,
      customNotes: "Super crisp and classic. Would happily pour this as a martini.",
    },
  });

  console.log(
    JSON.stringify(
      {
        sessionId: session.id,
        joinCode: session.joinCode,
        adminPin: session.adminPin,
      },
      null,
      2,
    ),
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
