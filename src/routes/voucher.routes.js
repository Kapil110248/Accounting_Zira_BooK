
import { Router } from "express";
import { upload } from "../config/multer.js";

import { createVoucher, getVoucherById,getVouchersByCompany, updateVoucher, deleteVoucher } from "../controllers/voucherController.js";

const router = Router();


// router.post("/", createVoucher);
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "photos", maxCount: 10 },
    { name: "references", maxCount: 10 },
  ]),
  createVoucher
);

router.get("/company/:companyId", getVouchersByCompany);

router.get("/:id", getVoucherById);

// router.put("/:id", updateVoucher);
router.patch(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "photos", maxCount: 10 },
    { name: "references", maxCount: 10 },
  ]),
  updateVoucher
);

router.delete("/:id", deleteVoucher);



export default router;
