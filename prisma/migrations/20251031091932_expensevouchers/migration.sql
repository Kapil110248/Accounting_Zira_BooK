-- CreateTable
CREATE TABLE `expensevoucher_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_id` INTEGER NOT NULL,
    `account_name` VARCHAR(255) NULL,
    `vendor_id` INTEGER NULL,
    `amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `narration` VARCHAR(255) NULL,

    INDEX `fk_expensevoucher_items`(`voucher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expensevouchers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `auto_receipt_no` VARCHAR(50) NOT NULL,
    `manual_receipt_no` VARCHAR(50) NULL,
    `voucher_date` DATE NOT NULL,
    `paid_from_account_id` INTEGER NOT NULL,
    `narration` TEXT NULL,
    `total_amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `expensevoucher_items` ADD CONSTRAINT `fk_expensevoucher_items` FOREIGN KEY (`voucher_id`) REFERENCES `expensevouchers`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
