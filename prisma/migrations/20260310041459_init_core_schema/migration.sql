-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Freewriting',
    "accessMode" TEXT NOT NULL DEFAULT 'OPEN',
    "turnMode" TEXT NOT NULL DEFAULT 'FREESTYLE',
    "participantLimit" INTEGER,
    "roundLimit" INTEGER,
    "turnTimeout" INTEGER,
    "perTurnLengthLimit" INTEGER,
    "seed" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "accessCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Writer" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "nickname" TEXT,
    "colorHex" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "joinOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Writer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turn" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "turnOrder" INTEGER NOT NULL,
    "logId" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Turn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Writer_sessionToken_logId_key" ON "Writer"("sessionToken", "logId");

-- AddForeignKey
ALTER TABLE "Writer" ADD CONSTRAINT "Writer_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Writer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
