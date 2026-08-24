-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "odometer" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "odometerAlert" DOUBLE PRECISION NOT NULL DEFAULT 10000;

-- CreateTable
CREATE TABLE "VehicleLocation" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "odometer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'manual',

    CONSTRAINT "VehicleLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleLocation" ADD CONSTRAINT "VehicleLocation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
