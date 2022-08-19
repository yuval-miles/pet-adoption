-- DropForeignKey
ALTER TABLE `petstatusaction` DROP FOREIGN KEY `PetStatusAction_userId_fkey`;

-- AlterTable
ALTER TABLE `petstatusaction` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PetStatusAction` ADD CONSTRAINT `PetStatusAction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
