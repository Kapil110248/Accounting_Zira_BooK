/*
  Warnings:

  - You are about to drop the column `voucher_no_manual` on the `contra_vouchers` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `contra_vouchers` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.
  - You are about to alter the column `document` on the `contra_vouchers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - Added the required column `voucher_number` to the `contra_vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `contra_vouchers` DROP FOREIGN KEY `contra_vouchers_account_from_id_fkey`;

-- DropForeignKey
ALTER TABLE `contra_vouchers` DROP FOREIGN KEY `contra_vouchers_account_to_id_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_warehouse_id_fkey`;

-- DropForeignKey
ALTER TABLE `transfer_items` DROP FOREIGN KEY `transfer_items_ibfk_1`;

-- DropForeignKey
ALTER TABLE `transfer_items` DROP FOREIGN KEY `transfer_items_ibfk_2`;

-- DropForeignKey
ALTER TABLE `transfer_items` DROP FOREIGN KEY `transfer_items_ibfk_3`;

-- DropIndex
DROP INDEX `products_warehouse_id_fkey` ON `products`;

-- AlterTable
ALTER TABLE `contra_vouchers` DROP COLUMN `voucher_no_manual`,
    ADD COLUMN `voucher_number` VARCHAR(191) NOT NULL,
    MODIFY `voucher_no_auto` VARCHAR(191) NULL,
    MODIFY `voucher_date` DATETIME(3) NOT NULL,
    MODIFY `amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `document` VARCHAR(191) NULL,
    MODIFY `narration` VARCHAR(191) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `company_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `warehouses` ADD COLUMN `address_line1` VARCHAR(255) NULL,
    ADD COLUMN `address_line2` VARCHAR(255) NULL,
    ADD COLUMN `city` VARCHAR(100) NULL,
    ADD COLUMN `country` VARCHAR(100) NULL,
    ADD COLUMN `pincode` VARCHAR(20) NULL,
    ADD COLUMN `state` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `pos_invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `tax_id` INTEGER NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `payment_status` VARCHAR(50) NOT NULL,
    `symbol` VARCHAR(10) NULL,
    `currency` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_classes` (
    `company_id` INTEGER NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_class` VARCHAR(255) NOT NULL,
    `tax_value` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_invoice_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salesorder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `company_name` VARCHAR(255) NULL,
    `company_address` TEXT NULL,
    `company_email` VARCHAR(255) NULL,
    `company_phone` VARCHAR(50) NULL,
    `logo_url` TEXT NULL,
    `qoutation_to_customer_name` VARCHAR(255) NULL,
    `qoutation_to_customer_address` TEXT NULL,
    `qoutation_to_customer_email` VARCHAR(255) NULL,
    `qoutation_to_customer_phone` VARCHAR(50) NULL,
    `ref_no` VARCHAR(100) NULL,
    `Manual_ref_ro` VARCHAR(100) NULL,
    `Payment_no` VARCHAR(100) NULL,
    `Manual_payment_no` VARCHAR(100) NULL,
    `invoice_no` VARCHAR(100) NULL,
    `Manual_invoice_no` VARCHAR(100) NULL,
    `Manual_SO_ref` VARCHAR(100) NULL,
    `Challan_no` VARCHAR(100) NULL,
    `Manual_challan_no` VARCHAR(100) NULL,
    `Manual_DC_no` VARCHAR(100) NULL,
    `SO_no` VARCHAR(100) NULL,
    `customer_ref` VARCHAR(100) NULL,
    `quotation_no` VARCHAR(100) NULL,
    `manual_quo_no` VARCHAR(100) NULL,
    `quotation_date` DATE NULL,
    `valid_till` DATE NULL,
    `due_date` DATE NULL,
    `subtotal` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `tax` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `discount` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `total` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `bank_name` VARCHAR(255) NULL,
    `account_no` VARCHAR(100) NULL,
    `account_holder` VARCHAR(255) NULL,
    `ifsc_code` VARCHAR(50) NULL,
    `notes` TEXT NULL,
    `terms` TEXT NULL,
    `signature_url` TEXT NULL,
    `photo_url` TEXT NULL,
    `attachment_url` TEXT NULL,
    `bill_to_attention_name` VARCHAR(255) NULL,
    `bill_to_company_name` VARCHAR(255) NULL,
    `bill_to_company_address` TEXT NULL,
    `bill_to_company_phone` VARCHAR(50) NULL,
    `bill_to_company_email` VARCHAR(255) NULL,
    `bill_to_customer_name` VARCHAR(255) NULL,
    `bill_to_customer_address` TEXT NULL,
    `bill_to_customer_email` VARCHAR(255) NULL,
    `bill_to_customer_phone` VARCHAR(50) NULL,
    `ship_to_attention_name` VARCHAR(255) NULL,
    `ship_to_company_name` VARCHAR(255) NULL,
    `ship_to_company_address` TEXT NULL,
    `ship_to_company_phone` VARCHAR(50) NULL,
    `ship_to_company_email` VARCHAR(255) NULL,
    `ship_to_customer_name` VARCHAR(255) NULL,
    `ship_to_customer_address` TEXT NULL,
    `ship_to_customer_email` VARCHAR(255) NULL,
    `ship_to_customer_phone` VARCHAR(50) NULL,
    `payment_received_customer_name` VARCHAR(255) NULL,
    `payment_received_customer_address` TEXT NULL,
    `payment_received_customer_email` VARCHAR(255) NULL,
    `payment_received_customer_phone` VARCHAR(50) NULL,
    `driver_name` VARCHAR(255) NULL,
    `driver_phone` VARCHAR(50) NULL,
    `amount_received` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `total_amount` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `payment_status` VARCHAR(50) NULL DEFAULT 'Pending',
    `total_invoice` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `balance` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `payment_note` TEXT NULL,
    `quotation_status` VARCHAR(50) NULL DEFAULT 'Pending',
    `sales_order_status` VARCHAR(50) NULL DEFAULT 'Pending',
    `delivery_challan_status` VARCHAR(50) NULL DEFAULT 'Pending',
    `invoice_status` VARCHAR(50) NULL DEFAULT 'Pending',
    `draft_status` VARCHAR(50) NULL DEFAULT 'Draft',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salesorderitems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sales_order_id` INTEGER NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `qty` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `rate` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `tax_percent` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `discount` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `amount` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_salesOrderItems`(`sales_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `reference_id` VARCHAR(100) NULL,
    `manual_voucher_no` VARCHAR(100) NULL,
    `auto_voucher_no` VARCHAR(100) NULL,
    `customer_id` INTEGER NULL,
    `return_no` VARCHAR(100) NOT NULL,
    `invoice_no` VARCHAR(100) NOT NULL,
    `return_date` DATE NOT NULL,
    `return_type` VARCHAR(50) NULL DEFAULT 'Sales Return',
    `warehouse_id` INTEGER NULL,
    `reason_for_return` TEXT NULL,
    `sub_total` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `tax_total` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `discount_total` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `grand_total` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `status` VARCHAR(50) NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `sales_return_company_id_idx`(`company_id`),
    INDEX `sales_return_customer_id_idx`(`customer_id`),
    INDEX `sales_return_warehouse_id_idx`(`warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_return_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sales_return_id` INTEGER NOT NULL,
    `product_id` INTEGER NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `rate` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `tax_percent` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `discount` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `amount` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_salesReturnItems`(`sales_return_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchaseorder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `company_name` VARCHAR(191) NULL,
    `company_address` TEXT NULL,
    `company_email` VARCHAR(191) NULL,
    `company_phone` VARCHAR(191) NULL,
    `logo_url` VARCHAR(191) NULL,
    `quotation_from_vendor_name` VARCHAR(191) NULL,
    `quotation_from_vendor_address` TEXT NULL,
    `quotation_from_vendor_email` VARCHAR(191) NULL,
    `quotation_from_vendor_phone` VARCHAR(191) NULL,
    `ref_no` VARCHAR(191) NULL,
    `Manual_ref_ro` VARCHAR(191) NULL,
    `quotation_no` VARCHAR(191) NULL,
    `manual_quo_no` VARCHAR(191) NULL,
    `quotation_date` DATETIME(3) NULL,
    `valid_till` DATETIME(3) NULL,
    `due_date` DATETIME(3) NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `tax` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `bank_name` VARCHAR(191) NULL,
    `account_no` VARCHAR(191) NULL,
    `account_holder` VARCHAR(191) NULL,
    `ifsc_code` VARCHAR(191) NULL,
    `bank_details` TEXT NULL,
    `notes` TEXT NULL,
    `terms` TEXT NULL,
    `signature_url` VARCHAR(191) NULL,
    `photo_url` VARCHAR(191) NULL,
    `attachment_url` VARCHAR(191) NULL,
    `bill_to_attention_name` VARCHAR(191) NULL,
    `bill_to_company_name` VARCHAR(191) NULL,
    `bill_to_company_address` TEXT NULL,
    `bill_to_company_phone` VARCHAR(191) NULL,
    `bill_to_company_email` VARCHAR(191) NULL,
    `bill_to_vendor_name` VARCHAR(191) NULL,
    `bill_to_vendor_address` TEXT NULL,
    `bill_to_vendor_email` VARCHAR(191) NULL,
    `bill_to_vendor_phone` VARCHAR(191) NULL,
    `ship_to_attention_name` VARCHAR(191) NULL,
    `ship_to_company_name` VARCHAR(191) NULL,
    `ship_to_company_address` TEXT NULL,
    `ship_to_company_phone` VARCHAR(191) NULL,
    `ship_to_company_email` VARCHAR(191) NULL,
    `ship_to_vendor_name` VARCHAR(191) NULL,
    `ship_to_vendor_address` TEXT NULL,
    `ship_to_vendor_email` VARCHAR(191) NULL,
    `ship_to_vendor_phone` VARCHAR(191) NULL,
    `payment_made_vendor_name` VARCHAR(191) NULL,
    `payment_made_vendor_address` TEXT NULL,
    `payment_made_vendor_email` VARCHAR(191) NULL,
    `payment_made_vendor_phone` VARCHAR(191) NULL,
    `driver_name` VARCHAR(191) NULL,
    `driver_phone` VARCHAR(191) NULL,
    `driver_details` TEXT NULL,
    `amount_paid` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `payment_status` VARCHAR(191) NULL DEFAULT 'Pending',
    `total_bill` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `payment_note` TEXT NULL,
    `quotation_status` VARCHAR(191) NULL DEFAULT 'Pending',
    `purchase_order_status` VARCHAR(191) NULL DEFAULT 'Pending',
    `goods_receipt_status` VARCHAR(191) NULL DEFAULT 'Pending',
    `bill_status` VARCHAR(191) NULL DEFAULT 'Pending',
    `draft_status` VARCHAR(191) NULL DEFAULT 'Draft',
    `PO_no` VARCHAR(191) NULL,
    `Manual_PO_ref` VARCHAR(191) NULL,
    `GR_no` VARCHAR(191) NULL,
    `Manual_GR_no` VARCHAR(191) NULL,
    `Bill_no` VARCHAR(191) NULL,
    `Manual_Bill_no` VARCHAR(191) NULL,
    `Payment_no` VARCHAR(191) NULL,
    `Manual_payment_no` VARCHAR(191) NULL,
    `vendor_ref` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchaseorderitems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_order_id` INTEGER NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `qty` DECIMAL(10, 2) NOT NULL,
    `rate` DECIMAL(15, 2) NOT NULL,
    `tax_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `amount` DECIMAL(15, 2) NOT NULL,

    INDEX `purchaseorderitems_purchase_order_id_idx`(`purchase_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_return` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `reference_id` VARCHAR(191) NOT NULL,
    `manual_voucher_no` VARCHAR(191) NULL,
    `auto_voucher_no` VARCHAR(191) NOT NULL,
    `vendor_id` INTEGER NULL,
    `vendor_name` VARCHAR(191) NULL,
    `return_no` VARCHAR(191) NOT NULL,
    `invoice_no` VARCHAR(191) NOT NULL,
    `return_date` DATETIME(3) NOT NULL,
    `return_type` VARCHAR(191) NOT NULL DEFAULT 'Purchase Return',
    `warehouse_id` INTEGER NOT NULL,
    `reason_for_return` TEXT NULL,
    `bank_name` VARCHAR(191) NULL,
    `account_no` VARCHAR(191) NULL,
    `account_holder` VARCHAR(191) NULL,
    `ifsc_code` VARCHAR(191) NULL,
    `sub_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `tax_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `discount_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `grand_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `purchase_return_reference_id_key`(`reference_id`),
    UNIQUE INDEX `purchase_return_auto_voucher_no_key`(`auto_voucher_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_return_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_return_id` INTEGER NOT NULL,
    `product_id` INTEGER NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `rate` DECIMAL(15, 2) NOT NULL,
    `tax_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `amount` DECIMAL(15, 2) NOT NULL,

    INDEX `purchase_return_items_purchase_return_id_idx`(`purchase_return_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_items` ADD CONSTRAINT `transfer_items_transfer_id_fkey` FOREIGN KEY (`transfer_id`) REFERENCES `transfers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_items` ADD CONSTRAINT `transfer_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_items` ADD CONSTRAINT `transfer_items_source_warehouse_id_fkey` FOREIGN KEY (`source_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contra_vouchers` ADD CONSTRAINT `fk_contra_from_account` FOREIGN KEY (`account_from_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contra_vouchers` ADD CONSTRAINT `fk_contra_to_account` FOREIGN KEY (`account_to_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_invoices` ADD CONSTRAINT `pos_invoices_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `vendorsCustomer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_invoices` ADD CONSTRAINT `pos_invoices_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `tax_classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_invoice_products` ADD CONSTRAINT `pos_invoice_products_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `pos_invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_invoice_products` ADD CONSTRAINT `pos_invoice_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salesorderitems` ADD CONSTRAINT `fk_salesOrderItems` FOREIGN KEY (`sales_order_id`) REFERENCES `salesorder`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sales_return_items` ADD CONSTRAINT `fk_salesReturnItems` FOREIGN KEY (`sales_return_id`) REFERENCES `sales_return`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `purchaseorderitems` ADD CONSTRAINT `purchaseorderitems_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchaseorder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_return_items` ADD CONSTRAINT `purchase_return_items_purchase_return_id_fkey` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_return`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `transfer_items_product_id_idx` ON `transfer_items`(`product_id`);
DROP INDEX `product_id` ON `transfer_items`;

-- RedefineIndex
CREATE INDEX `transfer_items_source_warehouse_id_idx` ON `transfer_items`(`source_warehouse_id`);
DROP INDEX `source_warehouse_id` ON `transfer_items`;

-- RedefineIndex
CREATE INDEX `transfer_items_transfer_id_idx` ON `transfer_items`(`transfer_id`);
DROP INDEX `transfer_id` ON `transfer_items`;
