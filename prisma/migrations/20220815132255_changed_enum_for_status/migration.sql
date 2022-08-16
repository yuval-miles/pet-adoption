/*
  Warnings:

  - You are about to alter the column `adoptionStatus` on the `pet` table. The data in that column could be lost. The data in that column will be cast from `Enum("pet_adoptionStatus")` to `Enum("Pet_adoptionStatus")`.

*/
-- AlterTable
ALTER TABLE `pet` MODIFY `adoptionStatus` ENUM('Available', 'Fosterd', 'Adopted') NOT NULL DEFAULT 'Available';
