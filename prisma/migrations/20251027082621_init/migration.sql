-- CreateTable
CREATE TABLE `plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plan_name` VARCHAR(100) NOT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `invoice_limit` INTEGER NOT NULL DEFAULT 0,
    `additional_invoice_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `user_limit` INTEGER NOT NULL DEFAULT 1,
    `storage_capacity` INTEGER NULL,
    `billing_cycle` ENUM('Monthly', 'Yearly') NOT NULL DEFAULT 'Monthly',
    `status` ENUM('Active', 'Inactive', 'Expired') NOT NULL DEFAULT 'Active',
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plan_id` INTEGER NOT NULL,
    `module_name` VARCHAR(100) NOT NULL,
    `module_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPERADMIN', 'COMPANY', 'USER') NOT NULL,
    `profile` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `expireDate` DATETIME(3) NULL,
    `UserStatus` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` INTEGER NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_id` INTEGER NOT NULL,
    `planType` ENUM('Monthly', 'Yearly') NOT NULL DEFAULT 'Monthly',
    `status` ENUM('Active', 'Inactive', 'Expired') NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_plans_user_id_idx`(`user_id`),
    INDEX `user_plans_plan_id_idx`(`plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `plan_modules` ADD CONSTRAINT `plan_modules_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_plans` ADD CONSTRAINT `user_plans_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_plans` ADD CONSTRAINT `user_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
