import { Router } from "express";
import {
  createPurchaseReturn,
  getAllPurchaseReturns,
  getPurchaseReturnById,
  updatePurchaseReturn,
  deletePurchaseReturn
} from "../controllers/purchase.controller.js";

const router = Router();

// Create Purchase Return (POST)
router.post("/ ", createPurchaseReturn);

// Get All Purchase Returns (GET) with filters
router.get("/get-returns", getAllPurchaseReturns);

// Get Purchase Return by ID (GET)
router.get("/get-particular/:id", getPurchaseReturnById);

// Update Purchase Return (PUT)
router.put("/update-purchase/:id", updatePurchaseReturn);

// Delete Purchase Return (DELETE)
router.delete("/delete-purchase/:id", deletePurchaseReturn);

export default router;