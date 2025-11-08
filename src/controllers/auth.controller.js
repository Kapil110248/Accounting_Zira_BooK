// // src/controllers/auth.controller.js
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();

// // ✅ Existing: Company Login
// export const companyLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "email and password are required" });
//     }

//     const company = await prisma.companies.findUnique({
//       where: { email },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         password_hash: true,
//         plan_id: true,
//         status: true,
//       },
//     });

//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     const ok = await bcrypt.compare(password, company.password_hash);
//     if (!ok) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     if (company.status !== "Active") {
//       return res.status(403).json({ message: "Company not active" });
//     }

//     const token = jwt.sign(
//       {
//         company_id: company.id,
//         plan_id: company.plan_id,
//         name: company.name,
//         email: company.email,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "12h" }
//     );

//     return res.status(200).json({
//       message: "Login successful",
//       data: {
//         id: company.id,
//         name: company.name,
//         email: company.email,
//         plan_id: company.plan_id,
//         status: company.status,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// // ✅ Existing: Get Company Modules
// export const myModules = async (req, res) => {
//   try {
//     const { company_id, plan_id } = req.user;

//     const planModules = await prisma.plan_modules.findMany({
//       where: { plan_id: plan_id },
//       include: {
//         modules: {
//           select: {
//             id: true,
//             key: true,
//             label: true,
//           },
//         },
//       },
//     });

//     if (planModules.length === 0) {
//       return res.status(404).json({ message: "No modules mapped to your plan" });
//     }

//     const modules = planModules.map(pm => ({
//       id: pm.modules.id,
//       key: pm.modules.key,
//       label: pm.modules.label,
//       module_price: pm.module_price,
//     }));

//     return res.status(200).json({
//       message: "Modules fetched successfully",
//       data: {
//         company_id,
//         plan_id,
//         modules,
//       },
//     });
//   } catch (error) {
//     console.error("Fetch modules error:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// // ✅ NEW: Superadmin Login
// export const superadminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     // Find user in platform_users table
//     const user = await prisma.platform_users.findUnique({
//       where: { email },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         password_hash: true,
//         role: true,
//         status: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if user is superadmin
//     if (user.role !== "superadmin") {
//       return res.status(403).json({ message: "Access denied. Only superadmin can login here." });
//     }

//     if (user.status !== "Active") {
//       return res.status(403).json({ message: "Account is not active" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password_hash);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         user_id: user.id,
//         role: user.role,
//         name: user.name,
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "12h" }
//     );

//     return res.status(200).json({
//       message: "Superadmin login successful",
//       data: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Superadmin login error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = "1d"; // token validity

// ---------------------------------------------------
// LOGIN (email + password, role in JWT)
// ---------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role, // SUPERADMIN or COMPANY
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          UserStatus: user.UserStatus,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// ----------Super Admin Controllers ----------

export const createSuperAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload profile image if exists
    let profileUrl = null;
    if (req.file) {
      profileUrl = await uploadToCloudinary(req.file.buffer, "superadmins");
    }

    // Create super admin
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPERADMIN",
        profile: profileUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        created_at: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Super admin created successfully", data: newUser });
  } catch (error) {
    console.error("Create super admin error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


// ---------- Company Controllers All Controllers----------

export const createCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      startDate,
      expireDate,
      plan_id,
      planType,
      address,
      country,
      state,
      city,
      postal_code,
      currency,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password || !startDate || !expireDate || !plan_id || !planType) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // ✅ Check if company email exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Company with this email already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🖼️ Upload multiple company images (if provided)
    let company_icon_url = null;
    let favicon_url = null;
    let company_logo_url = null;
    let company_dark_logo_url = null;

    if (req.files) {
      if (req.files.company_icon) {
        company_icon_url = await uploadToCloudinary(req.files.company_icon[0].buffer, "company_icons");
      }
      if (req.files.favicon) {
        favicon_url = await uploadToCloudinary(req.files.favicon[0].buffer, "company_favicons");
      }
      if (req.files.company_logo) {
        company_logo_url = await uploadToCloudinary(req.files.company_logo[0].buffer, "company_logos");
      }
      if (req.files.company_dark_logo) {
        company_dark_logo_url = await uploadToCloudinary(req.files.company_dark_logo[0].buffer, "company_dark_logos");
      }
    }

    // ✅ Create company record
    const newCompany = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "COMPANY",
        startDate: new Date(startDate),
        expireDate: new Date(expireDate),
        address,
        country,
        state,
        city,
        postal_code,
        currency,
        company_icon_url,
        favicon_url,
        company_logo_url,
        company_dark_logo_url,
        user_plans: {
          create: {
            plan_id: parseInt(plan_id),
            planType,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        startDate: true,
        expireDate: true,
        address: true,
        country: true,
        state: true,
        city: true,
        postal_code: true,
        currency: true,
        company_icon_url: true,
        favicon_url: true,
        company_logo_url: true,
        company_dark_logo_url: true,
        user_plans: true,
        created_at: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "✅ Company created successfully",
      data: newCompany,
    });
  } catch (error) {
    console.error("❌ Create company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      startDate,
      expireDate,
      plan_id,
      planType,
      address,
      country,
      state,
      city,
      postal_code,
      currency,
    } = req.body;

    const companyId = parseInt(id);

    const existingCompany = await prisma.users.findUnique({
      where: { id: companyId },
      include: { user_plans: true },
    });

    if (!existingCompany || existingCompany.role !== "COMPANY") {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // 🖼️ Handle multiple image uploads (replace only those provided)
    let {
      company_icon_url,
      favicon_url,
      company_logo_url,
      company_dark_logo_url,
    } = existingCompany;

    if (req.files) {
      if (req.files.company_icon) {
        company_icon_url = await uploadToCloudinary(req.files.company_icon[0].buffer, "company_icons");
      }
      if (req.files.favicon) {
        favicon_url = await uploadToCloudinary(req.files.favicon[0].buffer, "company_favicons");
      }
      if (req.files.company_logo) {
        company_logo_url = await uploadToCloudinary(req.files.company_logo[0].buffer, "company_logos");
      }
      if (req.files.company_dark_logo) {
        company_dark_logo_url = await uploadToCloudinary(req.files.company_dark_logo[0].buffer, "company_dark_logos");
      }
    }

    // 🧱 Build update object
    const updateData = {
      name: name ?? existingCompany.name,
      startDate: startDate ? new Date(startDate) : existingCompany.startDate,
      expireDate: expireDate ? new Date(expireDate) : existingCompany.expireDate,
      address: address ?? existingCompany.address,
      country: country ?? existingCompany.country,
      state: state ?? existingCompany.state,
      city: city ?? existingCompany.city,
      postal_code: postal_code ?? existingCompany.postal_code,
      currency: currency ?? existingCompany.currency,
      company_icon_url,
      favicon_url,
      company_logo_url,
      company_dark_logo_url,
    };

    // ✅ Plan update or creation
    if (plan_id || planType) {
      const lastPlan = await prisma.user_plans.findFirst({
        where: { user_id: companyId },
        orderBy: { id: "desc" },
      });

      if (lastPlan) {
        await prisma.user_plans.update({
          where: { id: lastPlan.id },
          data: {
            plan_id: plan_id ? parseInt(plan_id) : lastPlan.plan_id,
            planType: planType ?? lastPlan.planType,
          },
        });
      } else {
        await prisma.user_plans.create({
          data: {
            user_id: companyId,
            plan_id: parseInt(plan_id),
            planType,
          },
        });
      }
    }

    // ✅ Update company details
    const updatedCompany = await prisma.users.update({
      where: { id: companyId },
      data: updateData,
      include: { user_plans: true },
    });

    return res.status(200).json({
      success: true,
      message: "✅ Company updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("❌ Update company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      include: { user_plans: true },
    });
    
    if (!company || company.role !== "COMPANY") {
      return res.status(404).json({ message: "Company not found" });
    }
    
    return res.status(200).json({ message: "Company fetched successfully", data: company });
  } catch (error) {
    console.error("Get company by ID error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.users.findMany({
      where: { role: "COMPANY" },
      include: {
        user_plans: {
          include: {
            plan: true, // ✅ Fetch related plan details
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (error) {
    console.error("Get all companies error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Find company
    const company = await prisma.users.findUnique({ where: { id: parseInt(id) } });
    if (!company || company.role !== "COMPANY") {
      return res.status(404).json({ message: "Company not found" });
    }

    // ✅ Delete profile image from Cloudinary if exists
    if (company.profile) {
      // Extract public_id from URL
      const publicId = company.profile.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    // ✅ Delete company from database
    await prisma.users.delete({ where: { id: parseInt(id) } });
    
    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Delete company error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// user creaete under company 
//all Controler functions related to USER management

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, UserStatus, company_id, user_role } = req.body;
    
    // 🧾 Validate required fields
    if (!email || !password || !name || !user_role) {
      return res
      .status(400)
      .json({ message: "Name, email, user_role and password are required" });
    }

    // 🧍‍♂️ Validate company_id (the user who creates others)
    if (!company_id) {
      return res
      .status(400)
      .json({ message: "company_id (creator user) is required" });
    }

    // Check if the creator user actually exists and is a COMPANY
    const creator = await prisma.users.findUnique({
      where: { id: parseInt(company_id) },
    });

    if (!creator || creator.role !== "COMPANY") {
      return res
        .status(403)
        .json({ message: "Invalid company_id or user is not a COMPANY role" });
    }
    
    // 🧍 Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
      .status(409)
      .json({ message: "User with this email already exists" });
    }
    
    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ☁️ Upload profile image if provided
    let profileUrl = null;
    if (req.file) {
      profileUrl = await uploadToCloudinary(req.file.buffer, "users");
    }
    
    // 🏗️ Create USER under the COMPANY
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        profile: profileUrl,
        phone,
        UserStatus,
        user_role,
        created_by: parseInt(company_id), // 👈 link to COMPANY user
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        phone: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
        company: {
          select: { id: true, name: true, email: true }, // show which company created them
        },
      },
    });
    
    return res.status(201).json({
      success: true,
      message: "User created successfully under the company",
      data: newUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, UserStatus, password, user_role } = req.body;

    // 🔍 Find existing user
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ☁️ Handle profile image update
    let profileUrl = existingUser.profile;

    if (req.file) {
      // If old image exists, delete it first
      if (existingUser.profile) {
        try {
          const publicId = existingUser.profile.split("/").pop().split(".")[0];
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.warn("Failed to delete old image:", err.message);
        }
      }
      // Upload new image
      profileUrl = await uploadToCloudinary(req.file.buffer, "users");
    }

    // 🔐 If password provided → hash it
    let hashedPassword = existingUser.password;
    if (password) {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 🧩 Prepare update data
    const updateData = {
      name: name ?? existingUser.name,
      phone: phone ?? existingUser.phone,
      profile: profileUrl,
      UserStatus: UserStatus ?? existingUser.UserStatus,
      user_role: user_role ?? existingUser.user_role,
      password: hashedPassword,
    };

    // 🛠️ Update user
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
        company: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUsersByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({ message: "company_id is required" });
    }

    // Fetch users created by the given company
    const users = await prisma.users.findMany({
      where: { created_by: parseInt(company_id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        phone: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully for this company",
      data: users,
    });
  } catch (error) {
    console.error("Get users by company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        phone: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
        company: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 🧾 Validate ID
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 🔍 Find the user
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🛡️ Optional: Prevent deleting COMPANY or SUPERADMIN users
    if (existingUser.role === "COMPANY" || existingUser.role === "SUPERADMIN") {
      return res.status(403).json({ message: "Cannot delete COMPANY or SUPERADMIN users" });
    }

    // ☁️ Delete profile image from Cloudinary if exists
    if (existingUser.profile) {
      try {
        const publicId = existingUser.profile.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      } catch (err) {
        console.warn("⚠️ Failed to delete profile image from Cloudinary:", err.message);
      }
    }

    // 🗑️ Delete the user
    await prisma.users.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};