

// // Utility: Convert to number safely (for Decimal/BigInt) - Not strictly needed for roles, but kept for consistency.
// const toNumber = (val) => {
//   if (val == null) return 0;
//   if (typeof val === 'object' && typeof val.toNumber === 'function') {
//     return val.toNumber();
//   }
//   return Number(val);
// };


// // ✅ Create Role
// export const createRole = async (req, res) => {
//   try {
//     const { role_name, role_type_id, general_permissions = [] } = req.body;

//     if (!role_name || !role_type_id) {
//       return res.status(400).json({ status: false, message: "role_name and role_type_id are required" });
//     }

//     // Ensure general_permissions is an array
//     const permissionsArray = Array.isArray(general_permissions) ? general_permissions : [];

//     const newRole = await prisma.roles.create({
//       data: {
//         role_name,
//         role_type_id: parseInt(role_type_id),
//         general_permissions: JSON.stringify(permissionsArray), // Store as JSON string
//       },
//     });

//     res.status(201).json({ status: true, message: "Role created successfully", data: newRole });
//   } catch (error) {
//     console.error("Error creating role:", error);
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

// // ✅ Get All Roles (without type_name)
// export const getAllRoles = async (req, res) => {
//   try {
//     const roles = await prisma.roles.findMany();

//     // Parse general_permissions from JSON string to array
//     const cleanedRoles = roles.map(role => ({
//       ...role,
//       general_permissions: role.general_permissions
//         ? JSON.parse(role.general_permissions)
//         : [],
//       type_name: null, // 👈 Since we can't join, set to null
//     }));

//     res.json({
//       status: true,
//       message: "Roles fetched successfully",
//       data: cleanedRoles,
//     });
//   } catch (error) {
//     console.error("Error fetching roles:", error);
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

// // ✅ Get Role By ID (without type_name)
// export const getRoleById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const role = await prisma.roles.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!role) {
//       return res.status(404).json({ status: false, message: "Role not found" });
//     }

//     // Parse general_permissions from JSON string to array
//     const cleanedRole = {
//       ...role,
//       general_permissions: role.general_permissions
//         ? JSON.parse(role.general_permissions)
//         : [],
//       type_name: null, // 👈 Since we can't join, set to null
//     };

//     res.json({
//       status: true,
//       message: "Role fetched successfully",
//       data: cleanedRole,
//     });
//   } catch (error) {
//     console.error("Error fetching role by ID:", error);
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

// // ✅ Get Roles by Company ID (without type_name)
// export const getRolesByCompanyId = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     const roles = await prisma.roles.findMany({
//       where: {
//         company_id: parseInt(company_id),
//       },
//     });

//     if (roles.length === 0) {
//       return res.status(404).json({ status: false, message: "No roles found for this company" });
//     }

//     // Parse general_permissions from JSON string to array
//     const cleanedRoles = roles.map(role => ({
//       ...role,
//       general_permissions: role.general_permissions
//         ? JSON.parse(role.general_permissions)
//         : [],
//       type_name: null, // 👈 Since we can't join, set to null
//     }));

//     res.json({
//       status: true,
//       message: "Roles fetched successfully",
//       data: cleanedRoles,
//     });
//   } catch (error) {
//     console.error("Error fetching roles by company ID:", error);
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

// // ✅ Update Role
// export const updateRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role_name, role_type_id, general_permissions } = req.body;

//     // Find the existing role
//     const existingRole = await prisma.roles.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!existingRole) {
//       return res.status(404).json({ status: false, message: "Role not found" });
//     }

//     // Ensure general_permissions is an array
//     const permissionsArray = Array.isArray(general_permissions) ? general_permissions : [];

//     // Update the role
//     const updatedRole = await prisma.roles.update({
//       where: { id: parseInt(id) },
//       data: {
//         role_name: role_name || existingRole.role_name,
//         role_type_id: role_type_id ? parseInt(role_type_id) : existingRole.role_type_id,
//         general_permissions: JSON.stringify(permissionsArray), // Store as JSON string
//       },
//     });

//     res.json({ status: true, message: "Role updated successfully", data: updatedRole });
//   } catch (error) {
//     console.error("Error updating role:", error);
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

// // ✅ Delete Role
// export const deleteRole = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the role first to check existence (optional, but good for user feedback)
//     const existingRole = await prisma.roles.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!existingRole) {
//       return res.status(404).json({ status: false, message: "Role not found" });
//     }

//     // Delete the role
//     const deletedRole = await prisma.roles.delete({
//       where: { id: parseInt(id) },
//     });

//     res.json({ status: true, message: "Role deleted successfully", data: deletedRole });
//   } catch (error) {
//     // Check if the error is because the record doesn't exist (Prisma will throw an error)
//     if (error.code === 'P2025') { // Record to delete does not exist
//       return res.status(404).json({ status: false, message: "Role not found" });
//     }
//     console.error("Error deleting role:", error);
//     res.status(500).json({ status: false, message: error.message });
//   }
// };


import prisma from "../config/db.js";

export const createRole = async (req, res) => {
  try {
    const { company_id, role_name, general_permissions, permissions } = req.body;

    // ✅ Basic validation
    if (!role_name)
      return res.status(400).json({ success: false, message: "Role name is required" });

    // ✅ Create Role with nested permissions
    const role = await prisma.userRoles.create({
      data: {
        company_id: company_id ? Number(company_id) : null,
        role_name,
        general_permissions: JSON.stringify(general_permissions || []),
        permissions: {
          create: permissions?.map((p) => ({
            module_name: p.module_name,
            can_create: !!p.can_create,
            can_view: !!p.can_view,
            can_update: !!p.can_update,
            can_delete: !!p.can_delete,
            full_access: !!p.full_access,
          })) || [],
        },
      },
      include: {
        permissions: true,
      },
    });

    res.status(201).json({ success: true, message: "Role created successfully", data: role });
  } catch (error) {
    console.error("Create Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 GET ALL ROLES
 */
export const getAllRoles = async (req, res) => {
  try {
    const { company_id } = req.query; // Get company_id from query params

    let filter = {};
    if (company_id) {
      filter.company_id = parseInt(company_id); // Convert to Int
    }

    const roles = await prisma.userRoles.findMany({
      where: filter,
      include: { permissions: true },
      orderBy: { created_at: "desc" },
    });

    res.json({
      success: true,
      message: company_id
        ? `Roles for company_id ${company_id} fetched successfully`
        : "All roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    console.error("Get All Roles Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 GET ROLE BY ID
 */
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.userRoles.findUnique({
      where: { id: Number(id) },
      include: { permissions: true },
    });

    if (!role)
      return res.status(404).json({ success: false, message: "Role not found" });

    res.json({ success: true, data: role });
  } catch (error) {
    console.error("Get Role by ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 UPDATE ROLE
 */
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, general_permissions, permissions } = req.body;

    // ✅ Update role details
    const updatedRole = await prisma.userRoles.update({
      where: { id: Number(id) },
      data: {
        role_name,
        general_permissions: JSON.stringify(general_permissions || []),
      },
    });

    // ✅ Delete old permissions & recreate
    await prisma.role_permissions.deleteMany({ where: { role_id: Number(id) } });

    await prisma.role_permissions.createMany({
      data:
        permissions?.map((p) => ({
          role_id: Number(id),
          module_name: p.module_name,
          can_create: !!p.can_create,
          can_view: !!p.can_view,
          can_update: !!p.can_update,
          can_delete: !!p.can_delete,
          full_access: !!p.full_access,
        })) || [],
    });

    const roleWithPermissions = await prisma.userRoles.findUnique({
      where: { id: Number(id) },
      include: { permissions: true },
    });

    res.json({ success: true, message: "Role updated successfully", data: roleWithPermissions });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 🧩 Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // ✅ Update status only
    const updatedRole = await prisma.userRoles.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: "Role status updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Update role status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update role status",
      error: error.message,
    });
  }
};

/**
 * 🔹 DELETE ROLE
 */
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.userRoles.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};