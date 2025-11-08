import { Router } from "express";
import {
  createUnitDetail,
  getAllUnitDetails,
  getUnitDetailById,
  getUnitDetailsByCompanyId,
  updateUnitDetail,
  deleteUnitDetail,
} from "../controllers/unitdetail.controller.js";

const router = Router();

// ✅ Create a new Unit Detail
router.post("/", createUnitDetail);

// ✅ Get all Unit Details
router.get("/", getAllUnitDetails);

// ✅ Get a single Unit Detail by ID
router.get("/:id", getUnitDetailById);

// ✅ Get Unit Details by Company ID
router.get("/getUnitDetailsByCompanyId/:company_id", getUnitDetailsByCompanyId);

// ✅ Update a Unit Detail
router.put("/:id", updateUnitDetail);

// ✅ Delete a Unit Detail
router.delete("/:id", deleteUnitDetail);

export default router;