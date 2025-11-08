

import prisma from "../config/db.js";


 // ----------- Parent Account Controllers ----------- //
export const createParentAccount = async (req, res) => {
  try {
    const { main_category, subgroup_name, company_id } = req.body;
    
    if (!main_category || !subgroup_name || !company_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newParentAccount = await prisma.parent_accounts.create({
      data: {
        main_category,
        subgroup_name,
        company_id: parseInt(company_id),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Parent Account created successfully",
      data: newParentAccount,
    });
  } catch (error) {
    console.error("Create Parent Account Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getParentAccountsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({ message: "company_id is required" });
    }

    // Fetch all parent accounts for this company
    const parentAccounts = await prisma.parent_accounts.findMany({
      where: { company_id: parseInt(company_id) },
      orderBy: { id: "desc" },
    });

    if (parentAccounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No parent accounts found for this company",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parent accounts fetched successfully",
      data: parentAccounts,
    });
  } catch (error) {
    console.error("Get Parent Accounts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



// ----------- Sub of Subgroup Controllers ----------- //

export const createSubOfSubgroup = async (req, res) => {
  try {
    const { subgroup_id, name } = req.body;

    if (!subgroup_id || !name) {
      return res.status(400).json({
        success: false,
        message: "subgroup_id and name are required",
      });
    }

    const sub = await prisma.sub_of_subgroups.create({
      data: {
        name,
        subgroup_id: parseInt(subgroup_id),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Sub of Subgroup created successfully",
      data: sub,
    });
  } catch (error) {
    console.error("❌ Error creating Sub of Subgroup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getSubOfSubgroupsBySubgroupId = async (req, res) => {
  try {
    const { subgroup_id } = req.params;

    if (!subgroup_id) {
      return res.status(400).json({
        success: false,
        message: "subgroup_id is required",
      });
    }

    const subs = await prisma.sub_of_subgroups.findMany({
      where: { subgroup_id: parseInt(subgroup_id) },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Sub of Subgroups fetched successfully",
      data: subs,
    });
  } catch (error) {
    console.error("❌ Error fetching by subgroup_id:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteSubOfSubgroup = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.sub_of_subgroups.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Sub of Subgroup deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting Sub of Subgroup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ----------- Account Controllers ----------- //

export const createAccount = async (req, res) => {
  try {
    const {
      company_id,
      subgroup_id,
      sub_of_subgroup_id,
      account_number,
      ifsc_code,
      bank_name_branch,
    } = req.body;

    if (!company_id || !subgroup_id) {
      return res.status(400).json({
        success: false,
        message: "company_id and subgroup_id are required",
      });
    }

    const newAccount = await prisma.accounts.create({
      data: {
        company_id: parseInt(company_id),
        subgroup_id: parseInt(subgroup_id),
        sub_of_subgroup_id: sub_of_subgroup_id
          ? parseInt(sub_of_subgroup_id)
          : null,
        account_number,
        ifsc_code,
        bank_name_branch,
      },
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("❌ Error creating account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await prisma.accounts.findMany({
      orderBy: { created_at: "desc" },
      include: {
        company: { select: { id: true, name: true } },
        parent_account: { select: { id: true, subgroup_name: true } },
        sub_of_subgroup: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: accounts,
    });
  } catch (error) {
    console.error("❌ Error fetching accounts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAccountsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id is required" });
    }

    const accounts = await prisma.accounts.findMany({
      where: { company_id: parseInt(company_id) },
      orderBy: { created_at: "desc" },
      include: {
        parent_account: { select: { id: true, subgroup_name: true } },
        sub_of_subgroup: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: accounts,
    });
  } catch (error) {
    console.error("❌ Error fetching by company_id:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subgroup_id,
      sub_of_subgroup_id,
      account_number,
      ifsc_code,
      bank_name_branch,
      accountBalance
    } = req.body;

    const updated = await prisma.accounts.update({
      where: { id: parseInt(id) },
      data: {
        subgroup_id: parseInt(subgroup_id),
        sub_of_subgroup_id: sub_of_subgroup_id
          ? parseInt(sub_of_subgroup_id)
          : null,
        account_number,
        ifsc_code,
        bank_name_branch,
        accountBalance
      },
    });

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.accounts.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};