import { Router } from "express";
import {
  getPurchaseReportSummary,
  getPurchaseReport,
  getPurchaseReportOptimized,
} from "../controllers/purchaseReport.controller.js";

const router = Router();

// Get Purchase Report Summary Metrics (Total Purchase, Paid Amount, Pending Payment, Overdue)
router.get("/summary", getPurchaseReportSummary);

// Get Detailed Purchase Report with Filtering
router.get("/detailed", getPurchaseReport);

// Get Optimized Purchase Report (Recommended - Better Performance)
router.get("/", getPurchaseReportOptimized);

export default router;
