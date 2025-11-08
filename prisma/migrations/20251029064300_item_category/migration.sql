-- CreateTable
CREATE TABLE `item_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `item_category_name` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
