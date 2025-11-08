-- CreateTable
CREATE TABLE `income_vouchers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `auto_receipt_no` VARCHAR(50) NOT NULL,
    `manual_receipt_no` VARCHAR(50) NULL,
    `voucher_date` DATE NOT NULL,
    `deposited_to` VARCHAR(100) NOT NULL,
    `received_from` INTEGER NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `narration` TEXT NULL,
    `status` VARCHAR(255) NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `auto_receipt_no`(`auto_receipt_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `income_voucher_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_id` INTEGER NOT NULL,
    `income_account` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `row_narration` TEXT NULL,

    INDEX `voucher_id`(`voucher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `income_voucher_entries` ADD CONSTRAINT `income_voucher_entries_ibfk_1` FOREIGN KEY (`voucher_id`) REFERENCES `income_vouchers`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
