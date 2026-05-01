-- CreateEnum
CREATE TYPE "SessionStage" AS ENUM ('SETUP', 'LOBBY', 'TASTING', 'REVEAL', 'RESULTS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "joinCode" TEXT NOT NULL,
    "adminPin" TEXT NOT NULL,
    "stage" "SessionStage" NOT NULL DEFAULT 'SETUP',
    "currentGinIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gin" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "distillery" TEXT,
    "abv" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TastingNote" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "ginId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "juniper" INTEGER NOT NULL,
    "citrus" INTEGER NOT NULL,
    "floral" INTEGER NOT NULL,
    "spice" INTEGER NOT NULL,
    "herbal" INTEGER NOT NULL,
    "sweetness" INTEGER NOT NULL,
    "customNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TastingNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_joinCode_key" ON "Session"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "Gin_sessionId_order_key" ON "Gin"("sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_accessToken_key" ON "Participant"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "TastingNote_participantId_ginId_key" ON "TastingNote"("participantId", "ginId");

-- AddForeignKey
ALTER TABLE "Gin" ADD CONSTRAINT "Gin_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TastingNote" ADD CONSTRAINT "TastingNote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TastingNote" ADD CONSTRAINT "TastingNote_ginId_fkey" FOREIGN KEY ("ginId") REFERENCES "Gin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
