import express from "express";
import {
  createTaxEntry,
  getTaxEntriesByCompany,
  updateTaxEntry,
  deleteTaxEntry,
} from "../controllers/taxEntry.controller.js";
const router = express.Router();

router.post("/", createTaxEntry);
router.get("/company/:company_id", getTaxEntriesByCompany);
router.put("/:id", updateTaxEntry);
router.delete("/:id", deleteTaxEntry);

export default router;
