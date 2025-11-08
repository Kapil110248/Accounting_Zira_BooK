-- AlterTable
ALTER TABLE `plans` MODIFY `storage_capacity` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `parent_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `main_category` VARCHAR(191) NOT NULL,
    `subgroup_name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_of_subgroups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `subgroup_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `subgroup_id` INTEGER NOT NULL,
    `sub_of_subgroup_id` INTEGER NULL,
    `account_number` VARCHAR(191) NULL,
    `ifsc_code` VARCHAR(191) NULL,
    `bank_name_branch` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendorsCustomer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name_english` VARCHAR(191) NOT NULL,
    `name_arabic` VARCHAR(191) NULL,
    `company_name` VARCHAR(191) NULL,
    `google_location` VARCHAR(191) NULL,
    `id_card_image` VARCHAR(191) NULL,
    `any_file` VARCHAR(191) NULL,
    `account_type` VARCHAR(191) NULL,
    `balance_type` VARCHAR(191) NULL,
    `account_name` VARCHAR(191) NULL,
    `account_balance` DOUBLE NULL DEFAULT 0.0,
    `creation_date` DATETIME(3) NULL,
    `bank_account_number` VARCHAR(191) NULL,
    `bank_ifsc` VARCHAR(191) NULL,
    `bank_name_branch` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `state_code` VARCHAR(191) NULL,
    `shipping_address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `credit_period_days` INTEGER NULL DEFAULT 0,
    `enable_gst` BOOLEAN NULL DEFAULT false,
    `gstIn` VARCHAR(191) NULL,
    `type` ENUM('vender', 'customer') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` VARCHAR(255) NULL,
    `company_id` INTEGER NULL,
    `transaction_id` VARCHAR(50) NULL,
    `balance_type` VARCHAR(255) NULL,
    `voucher_type` VARCHAR(100) NULL,
    `voucher_no` VARCHAR(100) NULL,
    `amount` DECIMAL(15, 2) NULL,
    `from_type` VARCHAR(255) NULL,
    `from_id` INTEGER NULL,
    `account_type` VARCHAR(255) NULL,
    `note` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sub_of_subgroups` ADD CONSTRAINT `sub_of_subgroups_subgroup_id_fkey` FOREIGN KEY (`subgroup_id`) REFERENCES `parent_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_subgroup_id_fkey` FOREIGN KEY (`subgroup_id`) REFERENCES `parent_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_sub_of_subgroup_id_fkey` FOREIGN KEY (`sub_of_subgroup_id`) REFERENCES `sub_of_subgroups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendorsCustomer` ADD CONSTRAINT `vendorsCustomer_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
