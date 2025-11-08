-- CreateTable
CREATE TABLE `transfer_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transfer_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `source_warehouse_id` INTEGER NOT NULL,
    `qty` DECIMAL(10, 2) NOT NULL,
    `rate` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `narration` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `product_id`(`product_id`),
    INDEX `source_warehouse_id`(`source_warehouse_id`),
    INDEX `transfer_id`(`transfer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `voucher_no` VARCHAR(50) NOT NULL,
    `manual_voucher_no` VARCHAR(50) NULL,
    `transfer_date` DATE NOT NULL,
    `destination_warehouse_id` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transfer_items` ADD CONSTRAINT `transfer_items_ibfk_1` FOREIGN KEY (`transfer_id`) REFERENCES `transfers`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transfer_items` ADD CONSTRAINT `transfer_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transfer_items` ADD CONSTRAINT `transfer_items_ibfk_3` FOREIGN KEY (`source_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
