// // src/routes/plan.routes.js
// import { Router } from "express";
// import {
//   createPlan,
//   getPlans,
//   getPlanById,
//   getPlanWithModules,
//   updatePlan,
//   deletePlan,
// } from "../controllers/planController.js";

// const router = Router();

// // ✅ Create a new plan (with optional modules)
// router.post("/", createPlan);

// // ✅ Get all plans (with subscriber count & modules)
// router.get("/", getPlans);

// // ✅ Get a single plan by ID (basic details)
// router.get("/:id", getPlanById);

// // ✅ Get a plan with its modules (detailed view)
// router.get("/:id/modules", getPlanWithModules); // Better URL structure

// // ✅ Update a plan (and its modules)
// router.put("/:id", updatePlan);

// // ✅ Delete a plan (and related data)
// router.delete("/:id", deletePlan);

// export default router;




import express from "express";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller.js";

const router = express.Router();

router.post("/", createPlan);
router.get("/", getAllPlans);
router.get("/:id", getPlanById);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

export default router;
