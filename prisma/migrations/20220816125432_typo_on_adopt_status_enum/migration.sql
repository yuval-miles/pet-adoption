/*
  Warnings:

  - The values [Fosterd] on the enum `Pet_adoptionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `pet` MODIFY `adoptionStatus` ENUM('Available', 'Fostered', 'Adopted') NOT NULL DEFAULT 'Available';
