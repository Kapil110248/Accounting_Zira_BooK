-- CreateTable
CREATE TABLE `adjustment_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adjustment_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `rate` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `narration` TEXT NULL,

    INDEX `adjustment_id`(`adjustment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adjustments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `voucher_no` VARCHAR(50) NOT NULL,
    `manual_voucher_no` VARCHAR(50) NULL,
    `adjustment_type` VARCHAR(50) NULL,
    `voucher_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `total_value` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `company_id`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `adjustment_items` ADD CONSTRAINT `adjustment_items_ibfk_1` FOREIGN KEY (`adjustment_id`) REFERENCES `adjustments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `adjustments` ADD CONSTRAINT `adjustments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
