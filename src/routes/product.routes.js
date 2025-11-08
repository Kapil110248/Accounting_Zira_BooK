// src/routes/product.routes.js
import { Router } from "express";
import { upload } from "../config/multer.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, getProductsByCompany, getProductsByCompanyAndWarehouse, updateProduct } from "../controllers/product.controller.js";
// 

const router = Router();

router.post("/", upload.single("image"), createProduct);

// 🟡 Get all
router.get("/", getAllProducts);

// 🟢 Get by company_id
router.get("/company/:company_id", getProductsByCompany);

// 🟢 Get by company_id + warehouse_id
router.get("/company/:company_id/warehouse/:warehouse_id", getProductsByCompanyAndWarehouse);

// 🟢 Get by ID
router.get("/:id", getProductById);

// 🟠 Update
router.put("/:id", upload.single("image"), updateProduct);

// 🔴 Delete
router.delete("/:id", deleteProduct);

export default router;