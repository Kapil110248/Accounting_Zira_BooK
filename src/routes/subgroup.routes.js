// src/routes/subgroup.routes.js

import express from "express";
import {
  createSubgroup,
  getAllSubgroups,
  getSubgroupsByCategory,
  updateSubgroup,
  deleteSubgroup,
} from "../controllers/subgroup.controller.js";

const router = express.Router();

// ✅ Create a new subgroup
router.post("/", createSubgroup);

// ✅ Get all subgroups (with category info)
router.get("/", getAllSubgroups);

// ✅ Get subgroups by category ID
router.get("/category/:categoryId", getSubgroupsByCategory);

// ✅ Update subgroup by ID
router.put("/:id", updateSubgroup);

// ✅ Soft delete subgroup by ID
router.delete("/:id", deleteSubgroup);

export default router;
