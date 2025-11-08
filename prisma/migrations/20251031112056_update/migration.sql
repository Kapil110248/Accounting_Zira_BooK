/*
  Warnings:

  - Added the required column `company_id` to the `contra_vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contra_vouchers` ADD COLUMN `company_id` INTEGER NOT NULL;
