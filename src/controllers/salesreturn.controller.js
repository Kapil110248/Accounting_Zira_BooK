// // src/controllers/salesReturn.controller.js

// import prisma from "../config/db.js";
// import { v2 as cloudinary } from 'cloudinary';

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: 'dkqcqrrbp',
//   api_key: '418838712271323',
//   api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
// });

// // Utility: Convert to number safely
// const toNumber = (val) => {
//   if (val == null) return 0;
//   if (typeof val === 'object' && typeof val.toNumber === 'function') {
//     return val.toNumber();
//   }
//   return Number(val);
// };

// // Generate Reference ID (e.g., REF-1006)
// const generateReferenceId = async () => {
//   const year = new Date().getFullYear();
//   const count = await prisma.sales_return.count({
//     where: {
//       created_at: {
//         gte: new Date(`${year}-01-01`),
//         lt: new Date(`${year + 1}-01-01`)
//       }
//     }
//   });
//   const paddedCount = String(count + 1).padStart(4, '0');
//   return `REF-${paddedCount}`;
// };

// // Generate Auto Voucher No (e.g., VR-1001)
// const generateAutoVoucherNo = async () => {
//   const year = new Date().getFullYear();
//   const count = await prisma.sales_return.count({
//     where: {
//       created_at: {
//         gte: new Date(`${year}-01-01`),
//         lt: new Date(`${year + 1}-01-01`)
//       }
//     }
//   });
//   const paddedCount = String(count + 1).padStart(4, '0');
//   return `VR-${paddedCount}`;
// };

// // ✅ Create Sales Return
// export const createSalesReturn = async (req, res) => {
//   try {
//     const data = { ...req.body };

//     // Validate required fields
//     if (!data.company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "company_id is required"
//       });
//     }

//     if (!data.return_no) {
//       return res.status(400).json({
//         success: false,
//         message: "return_no is required"
//       });
//     }

//     if (!data.invoice_no) {
//       return res.status(400).json({
//         success: false,
//         message: "invoice_no is required"
//       });
//     }

//     if (!data.return_date) {
//       return res.status(400).json({
//         success: false,
//         message: "return_date is required"
//       });
//     }

//     if (!data.warehouse_id) {
//       return res.status(400).json({
//         success: false,
//         message: "warehouse_id is required"
//       });
//     }

//     // Generate auto fields if not provided
//     const referenceId = data.reference_id || await generateReferenceId();
//     const autoVoucherNo = data.auto_voucher_no || await generateAutoVoucherNo();

//     // Handle items array
//     const items = data.items || data.sales_return_items || [];
//     let parsedItems = [];
    
//     if (typeof items === 'string') {
//       try {
//         parsedItems = JSON.parse(items);
//       } catch (e) {
//         parsedItems = [];
//       }
//     } else if (Array.isArray(items)) {
//       parsedItems = items;
//     }

//     // Calculate totals from items if not provided
//     let subTotal = toNumber(data.sub_total || 0);
//     let taxTotal = toNumber(data.tax_total || 0);
//     let discountTotal = toNumber(data.discount_total || 0);
//     let grandTotal = toNumber(data.grand_total || 0);

//     if (parsedItems.length > 0 && subTotal === 0) {
//       parsedItems.forEach(item => {
//         const qty = toNumber(item.quantity || item.qty || 0);
//         const rate = toNumber(item.rate || 0);
//         const taxPercent = toNumber(item.tax_percent || item.tax || 0);
//         const discount = toNumber(item.discount || 0);

//         const itemSubTotal = qty * rate;
//         const itemDiscount = (itemSubTotal * discount) / 100;
//         const itemAfterDiscount = itemSubTotal - itemDiscount;
//         const itemTax = (itemAfterDiscount * taxPercent) / 100;
//         const itemAmount = itemAfterDiscount + itemTax;

//         subTotal += itemSubTotal;
//         discountTotal += itemDiscount;
//         taxTotal += itemTax;
//         grandTotal += itemAmount;
//       });
//     }

//     // Create sales return with nested items
//     const createData = {
//       company_id: toNumber(data.company_id),
//       reference_id: referenceId,
//       manual_voucher_no: data.manual_voucher_no || null,
//       auto_voucher_no: autoVoucherNo,
//       customer_id: data.customer_id ? toNumber(data.customer_id) : null,
//       return_no: data.return_no,
//       invoice_no: data.invoice_no,
//       return_date: new Date(data.return_date),
//       return_type: data.return_type || "Sales Return",
//       warehouse_id: toNumber(data.warehouse_id),
//       reason_for_return: data.reason_for_return || null,
//       sub_total: subTotal,
//       tax_total: taxTotal,
//       discount_total: discountTotal,
//       grand_total: grandTotal,
//       status: data.status || "pending",
//       notes: data.notes || null,
//       created_at: new Date(),
//       updated_at: new Date(),
//       sales_return_items: parsedItems.length > 0 ? {
//         create: parsedItems.map(item => ({
//           product_id: item.product_id ? toNumber(item.product_id) : null,
//           item_name: item.item_name || item.name || "",
//           quantity: toNumber(item.quantity || item.qty || 0),
//           rate: toNumber(item.rate || 0),
//           tax_percent: toNumber(item.tax_percent || item.tax || 0),
//           discount: toNumber(item.discount || 0),
//           amount: toNumber(item.amount) || (toNumber(item.quantity || item.qty || 0) * toNumber(item.rate))
//         }))
//       } : undefined
//     };

//     const newReturn = await prisma.sales_return.create({
//       data: createData,
//       include: {
//         sales_return_items: true
//       }
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Sales return created successfully",
//       data: newReturn
//     });
//   } catch (error) {
//     console.error("Error creating sales return:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };

// // ✅ Get All Sales Returns
// export const getAllSalesReturns = async (req, res) => {
//   try {
//     const { company_id, status, start_date, end_date, return_no, invoice_no } = req.query;

//     const where = {};
//     if (company_id) where.company_id = parseInt(company_id);
//     if (status) where.status = status;
//     if (return_no) where.return_no = { contains: return_no };
//     if (invoice_no) where.invoice_no = { contains: invoice_no };
//     if (start_date || end_date) {
//       where.return_date = {};
//       if (start_date) where.return_date.gte = new Date(start_date);
//       if (end_date) where.return_date.lte = new Date(end_date);
//     }

//     const salesReturns = await prisma.sales_return.findMany({
//       where,
//       include: {
//         sales_return_items: true
//       },
//       orderBy: {
//         created_at: 'desc'
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Sales returns fetched successfully",
//       data: salesReturns,
//       count: salesReturns.length
//     });
//   } catch (error) {
//     console.error("Error fetching sales returns:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };

// // ✅ Get Sales Return by ID
// export const getSalesReturnById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!id || isNaN(parseInt(id))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid ID parameter"
//       });
//     }

//     const salesReturn = await prisma.sales_return.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         sales_return_items: true
//       }
//     });

//     if (!salesReturn) {
//       return res.status(404).json({
//         success: false,
//         message: "Sales return not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Sales return fetched successfully",
//       data: salesReturn
//     });
//   } catch (error) {
//     console.error("Error fetching sales return:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };

// // ✅ Update Sales Return
// export const updateSalesReturn = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Validate ID
//     if (!id || isNaN(parseInt(id))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid ID parameter"
//       });
//     }

//     const data = { ...req.body };

//     const existing = await prisma.sales_return.findUnique({
//       where: { id: parseInt(id) },
//       include: { sales_return_items: true }
//     });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Sales return not found"
//       });
//     }

//     // Handle items update if provided
//     const items = data.items || data.sales_return_items || [];
//     let parsedItems = [];
    
//     if (typeof items === 'string') {
//       try {
//         parsedItems = JSON.parse(items);
//       } catch (e) {
//         parsedItems = [];
//       }
//     } else if (Array.isArray(items)) {
//       parsedItems = items;
//     }

//     // Calculate totals if items provided
//     let subTotal = toNumber(data.sub_total || existing.sub_total || 0);
//     let taxTotal = toNumber(data.tax_total || existing.tax_total || 0);
//     let discountTotal = toNumber(data.discount_total || existing.discount_total || 0);
//     let grandTotal = toNumber(data.grand_total || existing.grand_total || 0);

//     if (parsedItems.length > 0) {
//       subTotal = 0;
//       taxTotal = 0;
//       discountTotal = 0;
//       grandTotal = 0;

//       parsedItems.forEach(item => {
//         const qty = toNumber(item.quantity || item.qty || 0);
//         const rate = toNumber(item.rate || 0);
//         const taxPercent = toNumber(item.tax_percent || item.tax || 0);
//         const discount = toNumber(item.discount || 0);

//         const itemSubTotal = qty * rate;
//         const itemDiscount = (itemSubTotal * discount) / 100;
//         const itemAfterDiscount = itemSubTotal - itemDiscount;
//         const itemTax = (itemAfterDiscount * taxPercent) / 100;
//         const itemAmount = itemAfterDiscount + itemTax;

//         subTotal += itemSubTotal;
//         discountTotal += itemDiscount;
//         taxTotal += itemTax;
//         grandTotal += itemAmount;
//       });
//     }

//     // Delete existing items if new items provided
//     if (parsedItems.length > 0) {
//       await prisma.sales_return_items.deleteMany({
//         where: { sales_return_id: parseInt(id) }
//       });
//     }

//     const updateData = {
//       manual_voucher_no: data.manual_voucher_no !== undefined ? data.manual_voucher_no : existing.manual_voucher_no,
//       customer_id: data.customer_id !== undefined ? (data.customer_id ? toNumber(data.customer_id) : null) : existing.customer_id,
//       return_no: data.return_no || existing.return_no,
//       invoice_no: data.invoice_no || existing.invoice_no,
//       return_date: data.return_date ? new Date(data.return_date) : existing.return_date,
//       return_type: data.return_type || existing.return_type,
//       warehouse_id: data.warehouse_id ? toNumber(data.warehouse_id) : existing.warehouse_id,
//       reason_for_return: data.reason_for_return !== undefined ? data.reason_for_return : existing.reason_for_return,
//       sub_total: subTotal,
//       tax_total: taxTotal,
//       discount_total: discountTotal,
//       grand_total: grandTotal,
//       status: data.status || existing.status,
//       notes: data.notes !== undefined ? data.notes : existing.notes,
//       updated_at: new Date(),
//       sales_return_items: parsedItems.length > 0 ? {
//         create: parsedItems.map(item => ({
//           product_id: item.product_id ? toNumber(item.product_id) : null,
//           item_name: item.item_name || item.name || "",
//           quantity: toNumber(item.quantity || item.qty || 0),
//           rate: toNumber(item.rate || 0),
//           tax_percent: toNumber(item.tax_percent || item.tax || 0),
//           discount: toNumber(item.discount || 0),
//           amount: toNumber(item.amount) || (toNumber(item.quantity || item.qty || 0) * toNumber(item.rate))
//         }))
//       } : undefined
//     };

//     const updatedReturn = await prisma.sales_return.update({
//       where: { id: parseInt(id) },
//       data: updateData,
//       include: {
//         sales_return_items: true
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Sales return updated successfully",
//       data: updatedReturn
//     });
//   } catch (error) {
//     console.error("Error updating sales return:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };

// // ✅ Delete Sales Return
// export const deleteSalesReturn = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!id || isNaN(parseInt(id))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid ID parameter"
//       });
//     }

//     const existing = await prisma.sales_return.findUnique({
//       where: { id: parseInt(id) }
//     });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Sales return not found"
//       });
//     }

//     await prisma.sales_return.delete({
//       where: { id: parseInt(id) }
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Sales return deleted successfully"
//     });
//   } catch (error) {
//     console.error("Error deleting sales return:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };

// src/controllers/salesReturn.controller.js

import prisma from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

// Utility: Convert to number safely
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// Generate Reference ID (e.g., REF-1006)
const generateReferenceId = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.sales_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  const paddedCount = String(count + 1).padStart(4, '0');
  return `REF-${paddedCount}`;
};

// Generate Auto Voucher No (e.g., VR-1001)
const generateAutoVoucherNo = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.sales_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  const paddedCount = String(count + 1).padStart(4, '0');
  return `VR-${paddedCount}`;
};

// ✅ Create Sales Return
export const createSalesReturn = async (req, res) => {
  try {
    const data = { ...req.body };

    // Validate required fields
    if (!data.company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required"
      });
    }

    if (!data.return_no) {
      return res.status(400).json({
        success: false,
        message: "return_no is required"
      });
    }

    if (!data.invoice_no) {
      return res.status(400).json({
        success: false,
        message: "invoice_no is required"
      });
    }

    if (!data.return_date) {
      return res.status(400).json({
        success: false,
        message: "return_date is required"
      });
    }

    if (!data.warehouse_id) {
      return res.status(400).json({
        success: false,
        message: "warehouse_id is required"
      });
    }

    // Generate auto fields if not provided
    const referenceId = data.reference_id || await generateReferenceId();
    const autoVoucherNo = data.auto_voucher_no || await generateAutoVoucherNo();

    // Handle items array
    const items = data.items || data.sales_return_items || [];
    let parsedItems = [];
    
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = [];
      }
    } else if (Array.isArray(items)) {
      parsedItems = items;
    }

    // Calculate totals from items if not provided
    let subTotal = toNumber(data.sub_total || 0);
    let taxTotal = toNumber(data.tax_total || 0);
    let discountTotal = toNumber(data.discount_total || 0);
    let grandTotal = toNumber(data.grand_total || 0);

    if (parsedItems.length > 0 && subTotal === 0) {
      parsedItems.forEach(item => {
        const qty = toNumber(item.quantity || item.qty || 0);
        const rate = toNumber(item.rate || 0);
        const taxPercent = toNumber(item.tax_percent || item.tax || 0);
        const discount = toNumber(item.discount || 0);

        const itemSubTotal = qty * rate;
        const itemDiscount = (itemSubTotal * discount) / 100;
        const itemAfterDiscount = itemSubTotal - itemDiscount;
        const itemTax = (itemAfterDiscount * taxPercent) / 100;
        const itemAmount = itemAfterDiscount + itemTax;

        subTotal += itemSubTotal;
        discountTotal += itemDiscount;
        taxTotal += itemTax;
        grandTotal += itemAmount;
      });
    }

    // Create sales return with nested items
    const createData = {
      company_id: toNumber(data.company_id),
      reference_id: referenceId,
      manual_voucher_no: data.manual_voucher_no || null,
      auto_voucher_no: autoVoucherNo,
      customer_id: data.customer_id ? toNumber(data.customer_id) : null,
      return_no: data.return_no,
      invoice_no: data.invoice_no,
      return_date: new Date(data.return_date),
      return_type: data.return_type || "Sales Return",
      warehouse_id: toNumber(data.warehouse_id),
      reason_for_return: data.reason_for_return || null,
      sub_total: subTotal,
      tax_total: taxTotal,
      discount_total: discountTotal,
      grand_total: grandTotal,
      status: data.status || "pending",
      notes: data.notes || null,
      created_at: new Date(),
      updated_at: new Date(),
      sales_return_items: parsedItems.length > 0 ? {
        create: parsedItems.map(item => ({
          product_id: item.product_id ? toNumber(item.product_id) : null,
          item_name: item.item_name || item.name || "",
          quantity: toNumber(item.quantity || item.qty || 0),
          rate: toNumber(item.rate || 0),
          tax_percent: toNumber(item.tax_percent || item.tax || 0),
          discount: toNumber(item.discount || 0),
          amount: toNumber(item.amount) || (toNumber(item.quantity || item.qty || 0) * toNumber(item.rate))
        }))
      } : undefined
    };

    const newReturn = await prisma.sales_return.create({
      data: createData,
      include: {
        sales_return_items: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Sales return created successfully",
      data: newReturn
    });
  } catch (error) {
    console.error("Error creating sales return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Get All Sales Returns
// ✅ Get All Sales Returns (Fixed Version)
export const getAllSalesReturns = async (req, res) => {
  try {
    const { company_id, status, start_date, end_date, return_no, invoice_no } = req.query;

    console.log("🟢 Incoming Query Params:", req.query);

    const where = {};

    if (company_id && !isNaN(parseInt(company_id)) && parseInt(company_id) > 0) {
      where.company_id = parseInt(company_id);
    }

    if (status && status.trim() !== "") where.status = status.trim();
    if (return_no && return_no.trim() !== "") where.return_no = { contains: return_no.trim() };
    if (invoice_no && invoice_no.trim() !== "") where.invoice_no = { contains: invoice_no.trim() };

    if (start_date || end_date) {
      where.return_date = {};
      if (start_date) where.return_date.gte = new Date(start_date);
      if (end_date) where.return_date.lte = new Date(end_date);
    }

    console.log("🟢 Prisma WHERE Object:", where);

    const allData = await prisma.sales_return.findMany();
    console.log("🟢 Total Records In DB:", allData.length);

    const salesReturns = await prisma.sales_return.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: { sales_return_items: true },
      orderBy: { created_at: "desc" },
    });

    console.log("🟢 Matched Records After Filter:", salesReturns.length);

    return res.status(200).json({
      success: true,
      message: "Sales returns fetched successfully",
      total_in_db: allData.length,
      matched: salesReturns.length,
      filter: where,
      data: salesReturns,
    });
  } catch (error) {
    console.error("❌ Error fetching sales returns:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// ✅ Get Sales Return by ID or Company ID
export const getSalesReturnById = async (req, res) => {
  try {
    // Support both path parameter (:id) and query parameter (?id=...)
    const id = req.params.id || req.query.id;
    const companyId = req.query.company_id;

    // Validate: Must provide either 'id' or 'company_id'
    if (!id && !companyId) {
      return res.status(400).json({
        success: false,
        message: "Please provide either 'id' (path or query parameter) or 'company_id' (query parameter)",
        params: req.params,
        query: req.query,
        examples: [
          "GET /get-particular/1",
          "GET /get-particular?id=1",
          "GET /get-particular?company_id=1",
          "GET /get-particular?id=1&company_id=1"
        ]
      });
    }

    // Validate ID if provided
    if (id && isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter. ID must be a valid number",
        provided_id: id
      });
    }

    // Validate company_id if provided
    if (companyId && isNaN(parseInt(companyId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid company_id parameter. company_id must be a valid number",
        provided_company_id: companyId
      });
    }

    // Build where clause
    const where = {};
    
    if (id) {
      where.id = parseInt(id);
      console.log(`Fetching sales return with ID: ${where.id}`);
    }
    
    if (companyId) {
      where.company_id = parseInt(companyId);
      console.log(`Filtering by company_id: ${where.company_id}`);
    }

    const salesReturn = await prisma.sales_return.findFirst({
      where,
      include: {
        sales_return_items: true
      },
      // If fetching by company_id only, get the latest one
      orderBy: id ? undefined : { created_at: 'desc' }
    });

    if (!salesReturn) {
      // Check if any sales returns exist
      const totalCount = await prisma.sales_return.count();
      const countWithCompany = companyId 
        ? await prisma.sales_return.count({ where: { company_id: parseInt(companyId) } })
        : null;
      
      const searchCriteria = id 
        ? `ID ${id}${companyId ? ` and company_id ${companyId}` : ''}`
        : `company_id ${companyId}`;
      
      return res.status(404).json({
        success: false,
        message: `Sales return with ${searchCriteria} not found`,
        requested_id: id ? parseInt(id) : null,
        company_id: companyId ? parseInt(companyId) : null,
        total_sales_returns_in_db: totalCount,
        company_sales_returns_count: countWithCompany,
        suggestion: totalCount === 0 
          ? "No sales returns exist. Please create a sales return first."
          : countWithCompany === 0 && companyId
          ? `No sales returns exist for company_id ${companyId}. Use GET /get-returns?company_id=${companyId} to verify.`
          : "Please check if the ID/company_id exists. Use GET /get-returns to see all sales returns."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sales return fetched successfully",
      data: salesReturn
    });
  } catch (error) {
    console.error("Error fetching sales return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Update Sales Return
export const updateSalesReturn = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter"
      });
    }

    const data = { ...req.body };

    const existing = await prisma.sales_return.findUnique({
      where: { id: parseInt(id) },
      include: { sales_return_items: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Sales return not found"
      });
    }

    // Handle items update if provided
    const items = data.items || data.sales_return_items || [];
    let parsedItems = [];
    
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = [];
      }
    } else if (Array.isArray(items)) {
      parsedItems = items;
    }

    // Calculate totals if items provided
    let subTotal = toNumber(data.sub_total || existing.sub_total || 0);
    let taxTotal = toNumber(data.tax_total || existing.tax_total || 0);
    let discountTotal = toNumber(data.discount_total || existing.discount_total || 0);
    let grandTotal = toNumber(data.grand_total || existing.grand_total || 0);

    if (parsedItems.length > 0) {
      subTotal = 0;
      taxTotal = 0;
      discountTotal = 0;
      grandTotal = 0;

      parsedItems.forEach(item => {
        const qty = toNumber(item.quantity || item.qty || 0);
        const rate = toNumber(item.rate || 0);
        const taxPercent = toNumber(item.tax_percent || item.tax || 0);
        const discount = toNumber(item.discount || 0);

        const itemSubTotal = qty * rate;
        const itemDiscount = (itemSubTotal * discount) / 100;
        const itemAfterDiscount = itemSubTotal - itemDiscount;
        const itemTax = (itemAfterDiscount * taxPercent) / 100;
        const itemAmount = itemAfterDiscount + itemTax;

        subTotal += itemSubTotal;
        discountTotal += itemDiscount;
        taxTotal += itemTax;
        grandTotal += itemAmount;
      });
    }

    // Delete existing items if new items provided
    if (parsedItems.length > 0) {
      await prisma.sales_return_items.deleteMany({
        where: { sales_return_id: parseInt(id) }
      });
    }

    const updateData = {
      manual_voucher_no: data.manual_voucher_no !== undefined ? data.manual_voucher_no : existing.manual_voucher_no,
      customer_id: data.customer_id !== undefined ? (data.customer_id ? toNumber(data.customer_id) : null) : existing.customer_id,
      return_no: data.return_no || existing.return_no,
      invoice_no: data.invoice_no || existing.invoice_no,
      return_date: data.return_date ? new Date(data.return_date) : existing.return_date,
      return_type: data.return_type || existing.return_type,
      warehouse_id: data.warehouse_id ? toNumber(data.warehouse_id) : existing.warehouse_id,
      reason_for_return: data.reason_for_return !== undefined ? data.reason_for_return : existing.reason_for_return,
      sub_total: subTotal,
      tax_total: taxTotal,
      discount_total: discountTotal,
      grand_total: grandTotal,
      status: data.status || existing.status,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      updated_at: new Date(),
      sales_return_items: parsedItems.length > 0 ? {
        create: parsedItems.map(item => ({
          product_id: item.product_id ? toNumber(item.product_id) : null,
          item_name: item.item_name || item.name || "",
          quantity: toNumber(item.quantity || item.qty || 0),
          rate: toNumber(item.rate || 0),
          tax_percent: toNumber(item.tax_percent || item.tax || 0),
          discount: toNumber(item.discount || 0),
          amount: toNumber(item.amount) || (toNumber(item.quantity || item.qty || 0) * toNumber(item.rate))
        }))
      } : undefined
    };

    const updatedReturn = await prisma.sales_return.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        sales_return_items: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Sales return updated successfully",
      data: updatedReturn
    });
  } catch (error) {
    console.error("Error updating sales return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Delete Sales Return
export const deleteSalesReturn = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter"
      });
    }

    const existing = await prisma.sales_return.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Sales return not found"
      });
    }

    await prisma.sales_return.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: "Sales return deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting sales return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};



