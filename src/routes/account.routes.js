import express from "express";
import { createAccount, createParentAccount, createSubOfSubgroup, deleteAccount, deleteSubOfSubgroup, getAccountsByCompanyId, getAllAccounts, getParentAccountsByCompanyId, getSubOfSubgroupsBySubgroupId, updateAccount } from "../controllers/account.controller.js";


const router = express.Router();


router.post("/create-subgroup", createParentAccount);
router.get("/subgroup/:company_id", getParentAccountsByCompanyId);

// ----------- Sub-Of-Subgroup Account Controllers ----------- //
router.post("/sub-of-subgroup", createSubOfSubgroup);
router.get("/sub-of-subgroup/:subgroup_id", getSubOfSubgroupsBySubgroupId);
router.delete("/sub-of-subgroup/:id", deleteSubOfSubgroup);

// ----------- Account Controllers ----------- //

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/company/:company_id", getAccountsByCompanyId);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);
export default router;
