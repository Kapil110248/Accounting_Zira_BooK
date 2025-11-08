// src/routes/companyUsers.routes.js
import express from "express";
import {
  createCompanyUser,
  getAllCompanyUsers,
  getCompanyUserById,
  updateCompanyUser,
  deleteCompanyUser,
  getCompanyUsersByCompanyId,
} from "../controllers/companyUsers.controller.js";

const router = express.Router();

/**
 * Company Users Routes (CRUD + By Company)
 * Base path: /api/company-users
 */

// ✅ Get all users of a specific company (placed first to avoid route conflict)
router.get("/company/:company_id", getCompanyUsersByCompanyId);

// ✅ CRUD routes
router.post("/", createCompanyUser);        // Create
router.get("/", getAllCompanyUsers);        // Read all
router.get("/:id", getCompanyUserById);     // Read single
router.put("/:id", updateCompanyUser);      // Update
router.delete("/:id", deleteCompanyUser);   // Delete

export default router;
