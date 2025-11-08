// src/routes/ewayBill.routes.js
import express from "express";
import {
  createEwayBill,
  deleteEwayBill,
  getEwayBillById,
  getEwayBillsByCompany,
  updateEwayBill,
} from "../controllers/ewaybill.controller.js ";

const router = express.Router();

// ✅ POST /api/ewaybills → Create a new e-Way Bill
router.post("/", createEwayBill);

// ✅ GET /api/ewaybills/:id → Get a single e-Way Bill by ID
router.get("/:id", getEwayBillById);

// ✅ PATCH /api/ewaybills/:id → Partially update an e-Way Bill
router.patch("/:id", updateEwayBill);

// ✅ DELETE /api/ewaybills/:id → Delete an e-Way Bill
router.delete("/:id", deleteEwayBill);

// ✅ GET /api/ewaybills/company/:companyId → Get all e-Way Bills for a company
router.get("/company/:companyId", getEwayBillsByCompany);

export default router;