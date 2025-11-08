// src/routes/expenseVoucher.routes.js
import express from "express";
import {
  createExpenseVoucher,
  deleteExpenseVoucher,
  getExpenseVoucherById,
  getExpenseVouchersByCompanyId,
  updateExpenseVoucher,
} from "../controllers/expenseVoucherController.js";

const router = express.Router();

router.post("/", createExpenseVoucher);
router.get("/:id", getExpenseVoucherById);
router.delete("/:id", deleteExpenseVoucher);
router.patch("/:id", updateExpenseVoucher);
router.get("/company/:companyId", getExpenseVouchersByCompanyId);

export default router;