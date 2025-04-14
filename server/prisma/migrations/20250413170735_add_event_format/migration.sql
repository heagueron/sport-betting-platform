-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('HEAD_TO_HEAD', 'MULTI_PARTICIPANT');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "format" "EventFormat" NOT NULL DEFAULT 'HEAD_TO_HEAD';
