-- CreateTable
CREATE TABLE `uoms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `unit_name` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
