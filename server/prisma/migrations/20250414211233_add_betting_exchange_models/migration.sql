/*
  Warnings:

  - The values [PENDING] on the enum `BetStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `marketId` to the `bets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BetType" AS ENUM ('BACK', 'LAY');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'SUSPENDED', 'CLOSED', 'SETTLED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "BetStatus_new" AS ENUM ('UNMATCHED', 'PARTIALLY_MATCHED', 'FULLY_MATCHED', 'WON', 'LOST', 'CANCELLED', 'VOID');
ALTER TABLE "bets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bets" ALTER COLUMN "status" TYPE "BetStatus_new" USING ("status"::text::"BetStatus_new");
ALTER TYPE "BetStatus" RENAME TO "BetStatus_old";
ALTER TYPE "BetStatus_new" RENAME TO "BetStatus";
DROP TYPE "BetStatus_old";
ALTER TABLE "bets" ALTER COLUMN "status" SET DEFAULT 'UNMATCHED';
COMMIT;

-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "liability" DOUBLE PRECISION,
ADD COLUMN     "marketId" TEXT NOT NULL,
ADD COLUMN     "matchedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "settledAt" TIMESTAMP(3),
ADD COLUMN     "type" "BetType" NOT NULL DEFAULT 'BACK',
ALTER COLUMN "status" SET DEFAULT 'UNMATCHED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reservedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MarketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bet_matches" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backBetId" TEXT NOT NULL,
    "layBetId" TEXT NOT NULL,

    CONSTRAINT "bet_matches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bet_matches" ADD CONSTRAINT "bet_matches_backBetId_fkey" FOREIGN KEY ("backBetId") REFERENCES "bets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bet_matches" ADD CONSTRAINT "bet_matches_layBetId_fkey" FOREIGN KEY ("layBetId") REFERENCES "bets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
