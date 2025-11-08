-- CreateTable
CREATE TABLE `userRoles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `role_name` VARCHAR(191) NOT NULL,
    `general_permissions` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL,
    `module_name` VARCHAR(191) NOT NULL,
    `can_create` BOOLEAN NOT NULL DEFAULT false,
    `can_view` BOOLEAN NOT NULL DEFAULT false,
    `can_update` BOOLEAN NOT NULL DEFAULT false,
    `can_delete` BOOLEAN NOT NULL DEFAULT false,
    `full_access` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(100) NULL,
    `general_permissions` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `userRoles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
