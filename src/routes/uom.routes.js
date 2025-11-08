import { Router } from "express";
import {
  createUOM,
  getAllUOMs,
  getUOMById,
  updateUOM,
  deleteUOM,
} from "../controllers/uom.controller.js";

const router = Router();

// ✅ Create a new UOM
router.post("/", createUOM);

// ✅ Get all UOMs
router.get("/", getAllUOMs);

// ✅ Get a single UOM by ID
router.get("/:id", getUOMById);

// ✅ Update a UOM
router.put("/:id", updateUOM);

// ✅ Delete a UOM
router.delete("/:id", deleteUOM);

export default router;