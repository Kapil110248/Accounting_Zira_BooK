
import express from "express";
import {
  createTaxClass,
  getAllTaxClasses,
  getTaxClassById,
  updateTaxClass,
  deleteTaxClass,
  getTaxClassByCompany,
} from "../controllers/taxClassController.js";

const router = express.Router();

// ✅ Specific route first (to prevent conflict with /:id)
router.get("/company/:company_id", getTaxClassByCompany);

// ✅ CRUD routes
router.post("/", createTaxClass);
router.get("/", getAllTaxClasses);
router.get("/:id", getTaxClassById);
router.put("/:id", updateTaxClass);
router.delete("/:id", deleteTaxClass);

export default router;
