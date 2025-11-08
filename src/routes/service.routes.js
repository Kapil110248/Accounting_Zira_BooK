import { Router } from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  getServicesByCompanyId,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

const router = Router();

// ✅ Create a new service
router.post("/", createService);

// ✅ Get all services (with company names)
router.get("/", getAllServices);

// ✅ Get a single service by ID
router.get("/:id", getServiceById);

// ✅ Get all services for a specific company
router.get("/company/:company_id", getServicesByCompanyId); // More RESTful than "/getServicesByCompanyId/:company_id"

// ✅ Update a service
router.put("/:id", updateService); // Using PUT for full update

// ✅ Delete a service
router.delete("/:id", deleteService);

export default router;