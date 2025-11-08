// src/routes/permission.routes.js
import { Router } from "express";
import {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} from "../controllers/permissioncontroller.js";

const router = Router();

router.post("/", createPermission);           // ✅ Create
router.get("/", getAllPermissions);           // ✅ List all
router.get("/:id", getPermissionById);        // ✅ Get by ID
router.put("/:id", updatePermission);         // ✅ Update
router.delete("/:id", deletePermission);      // ✅ Delete

export default router;