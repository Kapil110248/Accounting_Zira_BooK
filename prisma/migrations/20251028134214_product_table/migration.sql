-- AlterTable
ALTER TABLE `accounts` ADD COLUMN `accountBalance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `warehouse_id` INTEGER NULL,
    `item_category_id` INTEGER NULL,
    `item_name` VARCHAR(255) NULL,
    `hsn` VARCHAR(100) NULL,
    `barcode` VARCHAR(100) NULL,
    `sku` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `initial_qty` INTEGER NULL,
    `min_order_qty` INTEGER NULL,
    `as_of_date` VARCHAR(255) NULL,
    `initial_cost` DECIMAL(15, 2) NULL,
    `sale_price` DECIMAL(15, 2) NULL,
    `purchase_price` DECIMAL(15, 2) NULL,
    `discount` DECIMAL(5, 2) NULL,
    `tax_account` VARCHAR(255) NULL,
    `remarks` TEXT NULL,
    `image` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
