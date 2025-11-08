import { Router } from "express";
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole, updateRoleStatus } from "../controllers/role.controller.js";
// import {
//   createRole,
//   getAllRoles,
//   getRoleById,
//   updateRole,
//   deleteRole,
//   getRolesByCompanyId,
// } from "../controllers/rolecontroller.js";

const router = Router();

// router.post("/", createRole);
// router.get("/", getAllRoles);
// router.get("/:id", getRoleById);
// router.patch("/:id", updateRole);
// router.delete("/:id", deleteRole);
// router.get("/company/:company_id", getRolesByCompanyId);

router.post("/", createRole);
router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.put("/:id", updateRole);
router.patch("/:id/status", updateRoleStatus);
router.delete("/:id", deleteRole);

export default router;