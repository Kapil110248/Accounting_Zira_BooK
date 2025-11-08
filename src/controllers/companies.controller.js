import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import fs from "fs";

const prisma = new PrismaClient();

// ✅ Cloudinary Config
cloudinary.v2.config({
  cloud_name: "dkqcqrrbp",
  api_key: "418838712271323",
  api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ",
});

// ✅ Create Company
export const createCompany = async (req, res) => {
  try {
    const { name, email, password, start_date, expire_date, plan_id, plan_type } = req.body;

    // 🔒 Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields: name, email, and password are required"
      });
    }

    if (!plan_id) {
      return res.status(400).json({
        message: "plan_id is required"
      });
    }

    let logoUrl = null;

    // 🖼️ Upload logo if provided
    if (req.files && req.files.logo) {
      const file = req.files.logo;
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "company_logos",
        });
        logoUrl = uploadResult.secure_url;
        // Clean up temp file
        fs.unlinkSync(file.tempFilePath);
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).json({ message: "Logo upload failed" });
      }
    }

    // 🔐 Hash password (now guaranteed to be defined)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 💾 Create company in DB
    const newCompany = await prisma.companies.create({
      data: {
        name,
        email,
        password_hash,
        start_date: start_date ? new Date(start_date) : null,
        expire_date: expire_date ? new Date(expire_date) : null,
        plan_id: parseInt(plan_id, 10),
        plan_type: plan_type || null,
        logo_url: logoUrl,
        status: "Active",
      },
    });

    return res.status(201).json({
      message: "Company created successfully",
      companyId: newCompany.id
    });
  } catch (error) {
    // 📧 Handle duplicate email (Prisma unique constraint)
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(409).json({ message: "Email already exists" });
    }

    console.error("Create company error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get All Companies (with plan name — NO schema change needed)
export const getCompanies = async (req, res) => {
  try {
    // Step 1: Fetch companies with plan_id (scalar field only)
    const companies = await prisma.companies.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        start_date: true,
        expire_date: true,
        status: true,
        logo_url: true,
        plan_type: true,
        plan_id: true, // ✅ Only scalar field — safe
        // ❌ DO NOT include 'plan' here
      },
      orderBy: { id: 'desc' },
    });

    if (companies.length === 0) {
      return res.status(404).json({ message: "No companies found" });
    }

    // Step 2: Fetch all referenced plans in one query
    const planIds = [...new Set(companies.map(c => c.plan_id))];
    const plans = await prisma.plans.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true }
    });

    // Step 3: Create a map for quick lookup
    const planMap = new Map(plans.map(p => [p.id, p.name]));

    // Step 4: Attach plan name to each company
    const data = companies.map(company => ({
      ...company,
      plan_name: planMap.get(company.plan_id) || 'Unknown Plan'
    }));

    return res.status(200).json({
      message: "Companies fetched successfully",
      data
    });
  } catch (error) {
    console.error("Fetch companies error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Company Modules
export const getCompanyModules = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = parseInt(id, 10);

    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, plan_id: true },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const planModules = await prisma.plan_modules.findMany({
      where: { plan_id: company.plan_id },
      include: {
        modules: {
          select: { id: true, key: true, label: true },
        },
      },
    });

    if (planModules.length === 0) {
      return res.status(404).json({ message: "No modules mapped to this company's plan" });
    }

    const modules = planModules.map(pm => ({
      id: pm.modules.id,
      key: pm.modules.key,
      label: pm.modules.label,
      module_price: pm.module_price,
    }));

    return res.status(200).json({
      message: "Company modules fetched successfully",
      data: {
        company_id: company.id,
        company_name: company.name,
        plan_id: company.plan_id,
        modules,
      },
    });
  } catch (error) {
    console.error("Fetch company modules error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Company (Partial Update)
export const updateCompanyPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = parseInt(id, 10);

    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const {
      name,
      email,
      password,
      start_date,
      expire_date,
      plan_id,
      plan_type,
    } = req.body;

    let logoUrl = null;
    if (req.files && req.files.logo) {
      const file = req.files.logo;
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "company_logos",
        });
        logoUrl = uploadResult.secure_url;
        fs.unlinkSync(file.tempFilePath);
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).json({ message: "Logo upload failed" });
      }
    }

    // 🔐 Hash new password only if provided
    let password_hash = undefined;
    if (password !== undefined) {
      if (password === "") {
        return res.status(400).json({ message: "Password cannot be empty" });
      }
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    // 🧱 Build dynamic update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password_hash !== undefined) updateData.password_hash = password_hash;
    if (start_date !== undefined) updateData.start_date = start_date ? new Date(start_date) : null;
    if (expire_date !== undefined) updateData.expire_date = expire_date ? new Date(expire_date) : null;
    if (plan_id !== undefined) updateData.plan_id = parseInt(plan_id, 10);
    if (plan_type !== undefined) updateData.plan_type = plan_type;
    if (logoUrl) updateData.logo_url = logoUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await prisma.companies.update({
      where: { id: companyId },
      data: updateData,
    });

    return res.status(200).json({ message: "Company updated successfully" });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Company not found" });
    }
    console.error("Update company error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// ✅ Get Single Company by ID (with plan name)
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = parseInt(id, 10);

    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        start_date: true,
        expire_date: true,
        status: true,
        logo_url: true,
        plan_type: true,
        plan_id: true,
      },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Fetch plan name
    const plan = await prisma.plans.findUnique({
      where: { id: company.plan_id },
      select: { name: true }
    });

    const data = {
      ...company,
      plan_name: plan?.name || 'Unknown Plan'
    };

    return res.status(200).json({
      message: "Company fetched successfully",
      data
    });
  } catch (error) {
    console.error("Fetch company by ID error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// ✅ Delete Company
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = parseInt(id, 10);

    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const existing = await prisma.companies.findUnique({
      where: { id: companyId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Company not found" });
    }

    await prisma.companies.delete({
      where: { id: companyId },
    });

    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Delete company error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};