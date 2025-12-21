-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "ifsc" TEXT,
ADD COLUMN     "payoutMethod" TEXT,
ADD COLUMN     "upiId" TEXT;
