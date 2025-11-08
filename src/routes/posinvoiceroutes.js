// src/routes/product.routes.js
import { Router } from "express";
import { upload } from "../config/multer.js";
import {
  createposinvoice,
  deleteinvoice,
  getAllinvoice,
  getinvoiceById,
  updateposinvoice,
  summarydahboard,
} from "../controllers/posinvoice.controller.js";
//

const router = Router();

router.post("/", createposinvoice);

// 🟡 Get all
router.get("/company/:company_id", getAllinvoice);

// 🟢 Get by company_id
router.get("/summary", summarydahboard);

// 🟢 Get by company_id + warehouse_id

// 🟢 Get by ID
router.get("/:id", getinvoiceById);

// 🔵update
router.put("/:id", updateposinvoice);

// 🔴 Delete
router.delete("/:id", deleteinvoice);

export default router;
