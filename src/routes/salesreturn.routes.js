// import { Router } from "express";
// import {
//   createSalesReturn,
//   getAllSalesReturns,
//   getSalesReturnById,
//   updateSalesReturn,
//   deleteSalesReturn
// } from "../controllers/salesreturn.controller.js";

// const router = Router();

// // Create Sales Return (POST)
// router.post("/create-sales-return", createSalesReturn);

// // Get All Sales Returns (GET)
// router.get("/get-returns", getAllSalesReturns);

// // Get Sales Return by ID (GET)
// router.get("/get-particular/:id", getSalesReturnById);

// // Update Sales Return (PUT)
// router.put("/update-sale/:id", updateSalesReturn);

// // Delete Sales Return (DELETE)
// router.delete("/delete-sale/:id", deleteSalesReturn);

// export default router;

import { Router } from "express";
import {
  createSalesReturn,
  getAllSalesReturns,
  getSalesReturnById,
  updateSalesReturn,
  deleteSalesReturn
} from "../controllers/salesReturn.controller.js";

const router = Router();

// Create Sales Return (POST)
router.post("/create-sales-return", createSalesReturn);

// Get All Sales Returns (GET)
router.get("/get-returns", getAllSalesReturns);

// Get Sales Return by ID (GET) - supports both path parameter and query parameter
router.get("/get-particular/:id", getSalesReturnById);
router.get("/get-particular", getSalesReturnById); // For query parameter format: ?id=1

// Update Sales Return (PUT)
router.put("/update-sale/:id", updateSalesReturn);

// Delete Sales Return (DELETE)
router.delete("/delete-sale/:id", deleteSalesReturn);

export default router;


  