-- CreateTable
CREATE TABLE `Pet` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `adoptionStatus` ENUM('available', 'fosterd', 'adopted') NOT NULL DEFAULT 'available',
    `type` VARCHAR(15) NOT NULL,
    `picture` VARCHAR(255) NOT NULL,
    `height` DOUBLE NOT NULL,
    `weight` DOUBLE NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `bio` MEDIUMTEXT NOT NULL,
    `hypoallergenic` BOOLEAN NOT NULL,
    `dietaryRes` TINYTEXT NOT NULL,
    `breed` VARCHAR(50) NOT NULL,
    `userId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
