// // src/routes/warehouses.routes.js
// import { Router } from "express";
// import {
//   createWarehouse,
//   getAllWarehouses,
//   getWarehouseById,
//   updateWarehouse,
//   deleteWarehouse,
//   getWarehousesByCompanyId,
// } from "../controllers/wareHouses.controller.js";

// const router = Router();

// // ✅ Create a new warehouse
// router.post("/", createWarehouse);

// // ✅ Get all warehouses
// router.get("/", getAllWarehouses);

// router.get("/company/:company_id", getWarehousesByCompanyId);

// // ✅ Get a single warehouse by ID
// router.get("/:id", getWarehouseById);

// // ✅ Update a warehouse
// router.patch("/:id", updateWarehouse); // Using PATCH as per your original code

// // ✅ Delete a warehouse
// router.delete("/:id", deleteWarehouse);

// export default router;

// src/routes/warehouses.routes.js
import { Router } from "express";
import { upload } from "../config/multer.js";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  getWarehouseDetails,
  getWarehouseInventory,
  updateWarehouse,
  deleteWarehouse,
  getWarehousesByCompanyId,
  addStockToWarehouse,
  importWarehousesFromExcel,
  exportWarehousesToExcel,
} from "../controllers/wareHouses.controller.js";

const router = Router();

// ✅ Create a new warehouse
router.post("/", createWarehouse);

// ✅ Get all warehouses (with total stocks)
router.get("/", getAllWarehouses);

// ✅ Get warehouses by company ID
router.get("/company/:company_id", getWarehousesByCompanyId);

// ✅ Get warehouse details with summary metrics
router.get("/:id/details", getWarehouseDetails);

// ✅ Get warehouse inventory list
router.get("/:id/inventory", getWarehouseInventory);

// ✅ Import warehouses from Excel (must be before /:id route)
router.post("/import", upload.single("file"), importWarehousesFromExcel);

// ✅ Export warehouses to Excel
router.get("/export/file", exportWarehousesToExcel);

// ✅ Add stock to warehouse (must be before /:id route)
router.post(
  "/:warehouse_id/stock",
  upload.single("image"),
  addStockToWarehouse
);
// ✅ Get a single warehouse by ID (basic)
router.get("/:id", getWarehouseById);

// ✅ Update a warehouse
router.patch("/:id", updateWarehouse);

// ✅ Delete a warehouse
router.delete("/:id", deleteWarehouse);

export default router;
