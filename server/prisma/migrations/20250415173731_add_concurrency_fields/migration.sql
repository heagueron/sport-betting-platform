-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "processingQueue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processingStatus" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
