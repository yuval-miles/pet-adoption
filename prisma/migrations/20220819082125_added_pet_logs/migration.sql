/*
  Warnings:

  - You are about to drop the `petstatusaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `petstatusaction` DROP FOREIGN KEY `PetStatusAction_petId_fkey`;

-- DropForeignKey
ALTER TABLE `petstatusaction` DROP FOREIGN KEY `PetStatusAction_userId_fkey`;

-- DropTable
DROP TABLE `petstatusaction`;

-- CreateTable
CREATE TABLE `PetAdoptionStatus` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('Available', 'Fostered', 'Adopted') NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PetLogs` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('Available', 'Fostered', 'Adopted') NOT NULL,
    `petId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PetAdoptionStatus` ADD CONSTRAINT `PetAdoptionStatus_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PetAdoptionStatus` ADD CONSTRAINT `PetAdoptionStatus_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PetLogs` ADD CONSTRAINT `PetLogs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PetLogs` ADD CONSTRAINT `PetLogs_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
