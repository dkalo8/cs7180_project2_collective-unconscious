-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_sessionToken_logId_symbol_key" ON "Reaction"("sessionToken", "logId", "symbol");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;
