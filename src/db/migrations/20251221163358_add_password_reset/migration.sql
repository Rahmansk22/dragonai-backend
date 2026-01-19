-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetOtp" TEXT DEFAULT '';
ALTER TABLE "User" ADD COLUMN "resetOtpExpiry" DATETIME;
