// src/routes/adminuser.routes.js
import express from "express";
import {
  createAdminUser,
  getAllAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  login,
} from "../controllers/adminusercontroller.js";

const router = express.Router();

// ✅ POST /api/adminusers → Create a new Admin User
router.post("/", createAdminUser);

// ✅ GET /api/adminusers → Get all Admin Users
router.get("/", getAllAdminUsers);

// ✅ GET /api/adminusers/:id → Get a single Admin User by ID
router.get("/:id", getAdminUserById);

// ✅ PATCH /api/adminusers/:id → Update an Admin User
router.patch("/:id", updateAdminUser);

// ✅ DELETE /api/adminusers/:id → Delete an Admin User
router.delete("/:id", deleteAdminUser);

// ✅ POST /api/adminusers/login → Login for Admin or Company
router.post("/login", login);

export default router;
