// src/routes/customer.routes.js
import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomersByCompany
} from "../controllers/customers.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management APIs
 */

// ✅ Create a new customer (supports file uploads: id_card_image, profile image)
router.post("/", createCustomer);

// ✅ Get all customers (ordered by newest first)
router.get("/", getAllCustomers);

// ✅ Get a single customer by ID
router.get("/:id", getCustomerById);

// ✅ Get all customers belonging to a specific company
router.get("/company/:company_id", getCustomersByCompany);

// ✅ Partially update a customer (supports file uploads)
router.patch("/:id", updateCustomer);

// ✅ Delete a customer permanently
router.delete("/:id", deleteCustomer);

export default router;