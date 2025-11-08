import { Router } from "express";
import {
  createTransfer,
  deleteTransfer,
  getAllTransfers,
  getTransferById,
  getTransfersByCompany,
  updateTransfer,
} from "../controllers/stockTransfer.controller.js";

const router = Router();

router.post("/", createTransfer); // ✅ Create
// router.get("/", getAllTransfers); // ✅ All
// router.get("/company/:companyId", getTransfersByCompanyId); // ✅ Filter by company

router.get("/", getAllTransfers);

// 🔍 Get transfer by ID
router.get("/:id", getTransferById);

// 🏢 Get transfers by company ID
router.get("/company/:company_id", getTransfersByCompany);


router.put("/:id", updateTransfer);

// 🗑️ Delete transfer
router.delete("/:id", deleteTransfer);

export default router;
