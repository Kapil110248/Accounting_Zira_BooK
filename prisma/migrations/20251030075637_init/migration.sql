-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `service_name` VARCHAR(255) NULL,
    `sku` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `uom` VARCHAR(100) NULL,
    `price` DECIMAL(15, 2) NULL,
    `tax_percent` DECIMAL(5, 2) NULL,
    `allow_in_invoice` VARCHAR(255) NULL,
    `remarks` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
