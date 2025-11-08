


import { Router } from "express";
import { 
  createSalesOrder,
  saveOrUpdateSalesOrder 
} from "../controllers/salesOrderController.js";

const router = Router();

// Create Sales Order (POST)
router.post("/create-sales-order", createSalesOrder);

// Save or Update Sales Order (legacy - supports both create and update)
router.post("/save-or-update", saveOrUpdateSalesOrder);

export default router;