// src/routes/category.routes.js

import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoriesByCompany
} from "../controllers/category.controller.js";


const router = express.Router();

// ✅ Create a new category
router.post("/", createCategory);

// ✅ Get all categories (including subgroups)
router.get("/", getAllCategories);

// ✅ Get categories by company ID
router.get("/company/:companyId", getCategoriesByCompany);

// ✅ Update category by ID
router.put("/:id", updateCategory);

// ✅ Soft delete category by ID
router.delete("/:id", deleteCategory);

export default router;
