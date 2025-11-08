// src/Routes/companySettingsRoutes.js
import express from "express";
import {
  createCompanySettings,
  getAllCompanySettings,
  getCompanySettingsById,
  updateCompanySettings,
  deleteCompanySettings,
} from "../controllers/companySetting.controller.js";

const router = express.Router();

// CRUD Routes
router.post("/", createCompanySettings);
router.get("/", getAllCompanySettings);
router.get("/:id", getCompanySettingsById);
router.put("/:id", updateCompanySettings);
router.delete("/:id", deleteCompanySettings);

export default router;
