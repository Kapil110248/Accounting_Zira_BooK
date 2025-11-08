// src/routes/module.routes.js
import { Router } from "express";
import {
  createModule,
  getAllModules,
  deleteModule,
} from "../controllers/modulescontroller.js";

const router = Router();

router.post("/", createModule);    // add new master module
router.get("/", getAllModules);    // list master modules
router.delete("/:id", deleteModule);

export default router;