-- CreateTable
CREATE TABLE `unit_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `uom_id` INTEGER NULL,
    `weight_per_unit` DOUBLE NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
