// src/routes/auth.routes.js
import { Router } from "express";
import {
  createCompany,
  createSuperAdmin,
  createUser,
  deleteCompany,
  deleteUser,
  getAllCompanies,
  getCompanyById,
  getUserById,
  getUsersByCompanyId,
  login,
  updateCompany,
  updateUser,
} from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.js";

const router = Router();

// // Public routes
// router.post("/company-login", companyLogin);
// router.post("/superadmin-login", superadminLogin); // ✅ NEW

// // Protected route
// router.get("/me/modules", authCompany, myModules);
router.post("/login", login);

//-------Supter Admin routes-------//
router.post("/Super-admin", upload.single("profile"), createSuperAdmin);

//-------Company routes-------//
router.post("/Company", upload.single("profile"), createCompany);
router.put(
  "/Company/:id",
  upload.fields([
    { name: "companyIcon", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
    { name: "companyDarkLogo", maxCount: 1 },
  ]),
  updateCompany
);
router.get("/Company/:id", getCompanyById);
router.get("/Company", getAllCompanies);
router.delete("/Company/:id", deleteCompany);

//-------User routes-------//
router.post("/User", upload.single("profile"), createUser);
router.put("/User/:id", upload.single("profile"), updateUser);
router.delete("/User/:id", deleteUser);
router.get("/User/company/:company_id", getUsersByCompanyId);
router.get("/User/:id", getUserById);

export default router;
