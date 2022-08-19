/*
  Warnings:

  - You are about to drop the column `adoptionStatus` on the `pet` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `pet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `pet` DROP FOREIGN KEY `Pet_userId_fkey`;

-- AlterTable
ALTER TABLE `pet` DROP COLUMN `adoptionStatus`,
    DROP COLUMN `userId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `PetStatusAction` (
    `id` VARCHAR(191) NOT NULL,
    `action` ENUM('Available', 'Fostered', 'Adopted') NOT NULL DEFAULT 'Available',
    `prevAction` ENUM('Available', 'Fostered', 'Adopted') NULL,
    `petId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PetStatusAction` ADD CONSTRAINT `PetStatusAction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PetStatusAction` ADD CONSTRAINT `PetStatusAction_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
