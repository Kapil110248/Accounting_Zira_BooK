-- CreateTable
CREATE TABLE `warehouses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `warehouse_name` VARCHAR(255) NULL,
    `location` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
