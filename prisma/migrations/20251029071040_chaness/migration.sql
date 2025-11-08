-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `item_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
