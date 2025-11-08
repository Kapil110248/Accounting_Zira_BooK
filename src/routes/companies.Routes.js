// src/routes/companies.routes.js
import { Router } from "express";
import {
  createCompany,
  getCompanies,
  getCompanyModules,
  updateCompanyPlan,
  deleteCompany
} from "../controllers/companies.controller.js";
import { authCompany } from "../middlewares/authCompany.js";

const router = Router();

// Super admin routes
router.post("/", createCompany);                 // Create new company
router.get("/", getCompanies);     
              
router.get("/:id/modules", getCompanyModules);   // Get modules for a company (admin view)
router.put("/:id/plan", updateCompanyPlan);      // Update company (including plan)
router.put('/:id', updateCompanyPlan);
router.delete("/:id", deleteCompany);            // Delete company

// Company self-access: get own modules (protected)
router.get("/me/modules", authCompany, (req, res) => {
  // Redirect to auth module route (assumes it exists and is Prisma-ready)
  return res.redirect(307, "/api/auth/me/modules");
});

export default router;

