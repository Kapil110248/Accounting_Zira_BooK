-- CreateTable
CREATE TABLE `contra_vouchers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_no_auto` VARCHAR(50) NOT NULL,
    `voucher_no_manual` VARCHAR(50) NULL,
    `voucher_date` DATE NOT NULL,
    `account_from_id` INTEGER NOT NULL,
    `account_to_id` INTEGER NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `document` VARCHAR(255) NULL,
    `narration` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contra_vouchers` ADD CONSTRAINT `contra_vouchers_account_from_id_fkey` FOREIGN KEY (`account_from_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contra_vouchers` ADD CONSTRAINT `contra_vouchers_account_to_id_fkey` FOREIGN KEY (`account_to_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
