/*
  Warnings:

  - A unique constraint covering the columns `[petId]` on the table `PetAdoptionStatus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[petId,userId]` on the table `PetAdoptionStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `LikedPets` (
    `userId` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LikedPets_userId_petId_key`(`userId`, `petId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `PetAdoptionStatus_petId_key` ON `PetAdoptionStatus`(`petId`);

-- CreateIndex
CREATE UNIQUE INDEX `PetAdoptionStatus_petId_userId_key` ON `PetAdoptionStatus`(`petId`, `userId`);

-- AddForeignKey
ALTER TABLE `LikedPets` ADD CONSTRAINT `LikedPets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LikedPets` ADD CONSTRAINT `LikedPets_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
