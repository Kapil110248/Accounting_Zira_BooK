import { Router } from "express";
import {
  getSalesReportSummary,
  getSalesReport,
  getSalesReportOptimized
} from "../controllers/salesReport.controller.js";

const router = Router();

// Get Sales Report Summary Metrics (Total Amount, Paid, Unpaid, Overdue)
router.get("/summary", getSalesReportSummary);

// Get Detailed Sales Report with Filtering
router.get("/detailed", getSalesReport);

// Get Optimized Sales Report (Recommended - Better Performance)
router.get("/", getSalesReportOptimized);

export default router;

