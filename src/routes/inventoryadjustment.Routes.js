// src/routes/adjustmentRoutes.js
import { Router } from "express";
import {
  createAdjustment,
  getAllAdjustments,
  getAdjustmentById,
  getAdjustmentsByCompanyId,
  updateAdjustment,
  deleteAdjustment
} from "../controllers/inventoryadjustment.controller.js"; // 👈 Updated filename

const router = Router();

// ✅ Create a new adjustment
router.post("/", createAdjustment);

// ✅ Get all adjustments (with items, products, warehouses)
router.get("/", getAllAdjustments);

// ✅ Get a single adjustment by ID
router.get("/:id", getAdjustmentById);

// ✅ Get all adjustments for a specific company
router.get("/company/:companyId", getAdjustmentsByCompanyId);

// ✅ Update an adjustment (use PUT for full replace, PATCH for partial — but we use PUT here)
router.put("/:id", updateAdjustment); // 👈 Changed from PATCH to PUT (common for full update)

// ✅ Delete an adjustment
router.delete("/:id", deleteAdjustment);

export default router;