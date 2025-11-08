// src/routes/vendors.routes.js
import { Router } from "express";
import { createVendor, deleteVendor, getAllVendors, getVendorById, getVendorsByCompanyId, updateVendor } from "../controllers/vendor.controller.js";
import { upload } from "../config/multer.js";
// import {
//   createVendor,
//   updateVendor,
//   getAllVendors,
//   getVendorById,
//   getVendorsByCompany,
//   deleteVendor
// } from "../controllers/vendorscontroller.js";

const router = Router();

// router.post("/", createVendor);
// router.get("/", getAllVendors);
// router.get("/:id", getVendorById);
// router.get("/company/:company_id", getVendorsByCompany);
// router.put("/:id", updateVendor);
// router.delete("/:id", deleteVendor);


const uploadFields = upload.fields([
  { name: "id_card_image", maxCount: 1 },
  { name: "any_file", maxCount: 1 },
]);

router.post("/", uploadFields, createVendor);
router.get("/", getAllVendors);
router.get("/company/:company_id", getVendorsByCompanyId);
router.get("/:id", getVendorById);
router.put("/:id", uploadFields, updateVendor);
router.delete("/:id", deleteVendor);



export default router;