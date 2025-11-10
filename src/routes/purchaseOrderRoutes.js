import { Router } from "express";
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus
} from "../controllers/purchaseOrder.controller.js";

const router = Router();

router.post("/create-purchase-order", createPurchaseOrder);
router.get("/get-orders", getAllPurchaseOrders);
router.get("/get-particular/:id", getPurchaseOrderById);
router.put("/update-purchase/:id", updatePurchaseOrder);
router.patch("/update-status/:id", updatePurchaseOrderStatus);
router.delete("/delete-purchase/:id", deletePurchaseOrder);

export default router;