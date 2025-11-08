import { Router } from "express";
import {
  createIncomeVoucher,
  getIncomeVouchersByCompany,
  patchIncomeVoucher,
  deleteIncomeVoucher
} from "../controllers/incomeVoucherController.js";

const router = Router();

// 🔹 Create a new income voucher
router.post("/", createIncomeVoucher);

// 🔹 Get all income vouchers for a specific company
router.get("/company/:company_id", getIncomeVouchersByCompany);

// 🔹 Update an income voucher (partial update)
router.patch("/:id", patchIncomeVoucher);

// 🔹 Delete an income voucher
router.delete("/:id", deleteIncomeVoucher);

export default router;