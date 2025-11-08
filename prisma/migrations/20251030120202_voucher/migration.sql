-- CreateTable
CREATE TABLE `vouchers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `voucher_type` VARCHAR(50) NOT NULL,
    `voucher_number` VARCHAR(100) NOT NULL,
    `date` DATE NOT NULL,
    `from_name` VARCHAR(255) NULL,
    `from_email` VARCHAR(255) NULL,
    `from_phone` VARCHAR(50) NULL,
    `from_address` TEXT NULL,
    `notes` TEXT NULL,
    `logo_url` VARCHAR(255) NULL,
    `signature_url` VARCHAR(255) NULL,
    `status` VARCHAR(50) NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `to_name` VARCHAR(255) NULL,
    `transfer_amount` INTEGER NULL,
    `from_account` INTEGER NULL,
    `to_account` INTEGER NULL,
    `customer_id` INTEGER NULL,
    `vendor_id` INTEGER NULL,
    `manual_voucher_no` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucher_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_id` INTEGER NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,
    `attachment_type` VARCHAR(50) NOT NULL,

    INDEX `voucher_id`(`voucher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucher_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_id` INTEGER NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `hsn_code` VARCHAR(50) NULL,
    `quantity` DECIMAL(10, 2) NULL DEFAULT 1.00,
    `rate` DECIMAL(10, 2) NULL,
    `amount` DECIMAL(10, 2) NULL,
    `tax_type` VARCHAR(20) NULL DEFAULT 'None',
    `tax_rate` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `tax_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,

    INDEX `voucher_id`(`voucher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `voucher_attachments` ADD CONSTRAINT `voucher_attachments_ibfk_1` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_items` ADD CONSTRAINT `voucher_items_ibfk_1` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
