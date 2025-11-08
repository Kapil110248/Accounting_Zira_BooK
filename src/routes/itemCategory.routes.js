// src/routes/itemcategory.routes.js
import { Router } from "express";
import {
  createItemCategory,
  getAllCategoryItem,
  getItemCategoriesByCompanyId,
} from "../controllers/itemCategory.controller.js"; // ✅ corrected filename

const router = Router();

// ✅ Create a new item category
router.post("/", createItemCategory);

// ✅ Get all item categories (with company names)
router.get("/", getAllCategoryItem);

// ✅ Get item categories by company_id
router.get("/company/:company_id", getItemCategoriesByCompanyId);

// Optional: You can add update/delete later
// router.patch("/:id", updateCategory);
// router.delete("/:id", deleteCategory);

export default router;