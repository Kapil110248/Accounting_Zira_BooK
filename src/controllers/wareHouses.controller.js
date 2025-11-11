// import prisma from "../config/db.js";

// // Utility: Convert to number safely (for Decimal/BigInt)
// const toNumber = (val) => {
//   if (val == null) return 0;
//   if (typeof val === 'object' && typeof val.toNumber === 'function') {
//     return val.toNumber();
//   }
//   return Number(val);
// };

// // ✅ Create Warehouse
// export const createWarehouse = async (req, res) => {
//   try {
//     const { company_id, warehouse_name, location } = req.body;

//     // Validate required fields
//     if (!warehouse_name) {
//       return res.status(400).json({ success: false, message: "Warehouse name is required" });
//     }

//     const newWarehouse = await prisma.warehouses.create({
//       data: {
//         company_id: company_id ? toNumber(company_id) : null,
//         warehouse_name,
//         location: location || null,
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Warehouse created successfully",
//       data: {
//         id: toNumber(newWarehouse.id),
//         company_id: newWarehouse.company_id ? toNumber(newWarehouse.company_id) : null,
//         warehouse_name: newWarehouse.warehouse_name,
//         location: newWarehouse.location,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating warehouse:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create warehouse",
//       error: error.message,
//     });
//   }
// };

// // ✅ Get All Warehouses
// export const getAllWarehouses = async (req, res) => {
//   try {
//     const warehouses = await prisma.warehouses.findMany({
//       orderBy: { id: "desc" },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "All warehouses fetched successfully",
//       data: warehouses,
//     });
//   } catch (error) {
//     console.error("Error fetching warehouses:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch warehouses",
//       error: error.message,
//     });
//   }
// };

// export const getWarehousesByCompanyId = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     if (!company_id) {
//       return res.status(400).json({ success: false, message: "Company ID is required" });
//     }

//     const warehouses = await prisma.warehouses.findMany({
//       where: { company_id: toNumber(company_id) },
//       orderBy: { id: "desc" },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Warehouses fetched successfully for the company",
//       data: warehouses,
//     });
//   } catch (error) {
//     console.error("Error fetching warehouses by company:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch warehouses by company",
//       error: error.message,
//     });
//   }
// };

// // export const getAllWarehouses = async (req, res) => {
// //     try {
// //       const warehouses = await prisma.warehouses.findMany();

// //       // Extract unique company IDs
// //       const companyIds = [
// //         ...new Set(
// //           warehouses
// //             .map(w => w.company_id)
// //             .filter(id => id !== null)
// //         )
// //       ];

// //       // Fetch all relevant companies in one query
// //       const companiesMap = {};
// //       if (companyIds.length > 0) {
// //         const companies = await prisma.companies.findMany({
// //           where: { id: { in: companyIds } },
// //           select: { id: true, name: true }
// //         });
// //         companies.forEach(c => {
// //           companiesMap[c.id] = c.name;
// //         });
// //       }

// //       const formattedWarehouses = warehouses.map(w => ({
// //         ...w,
// //         id: toNumber(w.id),
// //         company_id: w.company_id ? toNumber(w.company_id) : null,
// //         company_name: w.company_id ? companiesMap[w.company_id] || null : null,
// //       }));

// //       return res.status(200).json({
// //         success: true,
// //         message: "Warehouses fetched successfully",
// //         data: formattedWarehouses,
// //       });
// //     } catch (error) {
// //       console.error("Error fetching warehouses:", error);
// //       return res.status(500).json({
// //         success: false,
// //         message: "Failed to fetch warehouses",
// //         error: error.message,
// //       });
// //     }
// //   };

// export const getWarehouseById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ success: false, message: "Warehouse ID is required" });
//     }

//     const warehouse = await prisma.warehouses.findUnique({
//       where: { id: toNumber(id) },
//     });

//     if (!warehouse) {
//       return res.status(404).json({
//         success: false,
//         message: "Warehouse not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Warehouse fetched successfully",
//       data: warehouse,
//     });
//   } catch (error) {
//     console.error("Error fetching warehouse by ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch warehouse by ID",
//       error: error.message,
//     });
//   }
// };

//   // export const getWarehouseById = async (req, res) => {
//   //   try {
//   //     const { id } = req.params;
//   //     const warehouseId = parseInt(id);

//   //     if (isNaN(warehouseId)) {
//   //       return res.status(400).json({ success: false, message: "Invalid warehouse ID" });
//   //     }

//   //     const warehouse = await prisma.warehouses.findUnique({
//   //       where: { id: warehouseId },
//   //     });

//   //     if (!warehouse) {
//   //       return res.status(404).json({ success: false, message: "Warehouse not found" });
//   //     }

//   //     let company_name = null;
//   //     if (warehouse.company_id) {
//   //       const company = await prisma.companies.findUnique({
//   //         where: { id: warehouse.company_id },
//   //         select: { name: true }
//   //       });
//   //       company_name = company?.name || null;
//   //     }

//   //     const formattedWarehouse = {
//   //       ...warehouse,
//   //       id: toNumber(warehouse.id),
//   //       company_id: warehouse.company_id ? toNumber(warehouse.company_id) : null,
//   //       company_name,
//   //     };

//   //     return res.status(200).json({
//   //       success: true,
//   //       message: "Warehouse fetched successfully",
//   //       data: formattedWarehouse,
//   //     });
//   //   } catch (error) {
//   //     console.error("Error fetching warehouse by ID:", error);
//   //     return res.status(500).json({
//   //       success: false,
//   //       message: "Failed to fetch warehouse",
//   //       error: error.message,
//   //     });
//   //   }
//   // };

// // ✅ Update Warehouse
// export const updateWarehouse = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { warehouse_name, location } = req.body;

//     if (!id) {
//       return res.status(400).json({ success: false, message: "Warehouse ID is required" });
//     }

//     const warehouseId = parseInt(id);

//     // Check if warehouse exists
//     const existingWarehouse = await prisma.warehouses.findUnique({
//       where: { id: warehouseId },
//     });

//     if (!existingWarehouse) {
//       return res.status(404).json({ success: false, message: "Warehouse not found" });
//     }

//     const updatedWarehouse = await prisma.warehouses.update({
//       where: { id: warehouseId },
//       data: {
//         warehouse_name: warehouse_name || existingWarehouse.warehouse_name,
//         location: location || null,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Warehouse updated successfully",
//       data: {
//         id: toNumber(updatedWarehouse.id),
//         company_id: updatedWarehouse.company_id ? toNumber(updatedWarehouse.company_id) : null,
//         warehouse_name: updatedWarehouse.warehouse_name,
//         location: updatedWarehouse.location,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating warehouse:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update warehouse",
//       error: error.message,
//     });
//   }
// };

// // ✅ Delete Warehouse
// // export const deleteWarehouse = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     if (!id) {
// //       return res.status(400).json({ success: false, message: "Warehouse ID is required" });
// //     }

// //     const warehouseId = parseInt(id);

// //     // Check if warehouse exists
// //     const existingWarehouse = await prisma.warehouses.findUnique({
// //       where: { id: warehouseId },
// //     });

// //     if (!existingWarehouse) {
// //       return res.status(404).json({ success: false, message: "Warehouse not found" });
// //     }

// //     await prisma.warehouses.delete({
// //       where: { id: warehouseId },
// //     });

// //     return res.status(200).json({
// //       success: true,
// //       message: "Warehouse deleted successfully",
// //     });
// //   } catch (error) {
// //     console.error("Error deleting warehouse:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to delete warehouse",
// //       error: error.message,
// //     });
// //   }
// // };

// export const deleteWarehouse = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ success: false, message: "Warehouse ID is required" });
//     }

//     const warehouseId = parseInt(id);

//     // Check if warehouse exists
//     const existingWarehouse = await prisma.warehouses.findUnique({
//       where: { id: warehouseId },
//     });

//     if (!existingWarehouse) {
//       return res.status(404).json({ success: false, message: "Warehouse not found" });
//     }

//     // Delete related records first to avoid FK constraint error
//     await prisma.transfer_items.deleteMany({
//       where: { source_warehouse_id: warehouseId },
//     });

//     await prisma.products.deleteMany({
//       where: { warehouse_id: warehouseId },
//     });

//     // Now safely delete warehouse
//     await prisma.warehouses.delete({
//       where: { id: warehouseId },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Warehouse deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting warehouse:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete warehouse",
//       error: error.message,
//     });
//   }
// };

import prisma from "../config/db.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import * as XLSX from "xlsx";

// Utility: Convert to number safely (for Decimal/BigInt)
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create Warehouse
export const createWarehouse = async (req, res) => {
  try {
    const {
      company_id,
      warehouse_name,
      location,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      country,
    } = req.body;

    // Validate required fields
    if (!warehouse_name) {
      return res
        .status(400)
        .json({ success: false, message: "Warehouse name is required" });
    }

    const newWarehouse = await prisma.warehouses.create({
      data: {
        company_id: company_id ? toNumber(company_id) : null,
        warehouse_name,
        location: location || null,
        address_line1: address_line1 || null,
        address_line2: address_line2 || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        country: country || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: {
        id: toNumber(newWarehouse.id),
        company_id: newWarehouse.company_id
          ? toNumber(newWarehouse.company_id)
          : null,
        warehouse_name: newWarehouse.warehouse_name,
        location: newWarehouse.location,
        address_line1: newWarehouse.address_line1,
        address_line2: newWarehouse.address_line2,
        city: newWarehouse.city,
        state: newWarehouse.state,
        pincode: newWarehouse.pincode,
        country: newWarehouse.country,
        created_at: newWarehouse.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create warehouse",
      error: error.message,
    });
  }
};

// ✅ Get All Warehouses with Total Stocks
export const getAllWarehouses = async (req, res) => {
  try {
    const { company_id, search } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Build where clause
    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (search) {
      where.OR = [
        { warehouse_name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    // Get warehouses with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [warehouses, totalCount] = await Promise.all([
      prisma.warehouses.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.warehouses.count({ where }),
    ]);

    // Calculate total stocks for each warehouse
    const warehousesWithStocks = await Promise.all(
      warehouses.map(async (warehouse) => {
        const totalStocks = await prisma.products.aggregate({
          where: { warehouse_id: warehouse.id },
          _sum: { initial_qty: true },
        });

        return {
          id: toNumber(warehouse.id),
          company_id: warehouse.company_id
            ? toNumber(warehouse.company_id)
            : null,
          warehouse_name: warehouse.warehouse_name,
          location: warehouse.location,
          total_stocks: toNumber(totalStocks._sum.initial_qty || 0),
          created_at: warehouse.created_at,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Warehouses fetched successfully",
      data: warehousesWithStocks,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total_records: totalCount,
        total_pages: Math.ceil(totalCount / limitNum),
        showing_from: totalCount > 0 ? skip + 1 : 0,
        showing_to: Math.min(skip + limitNum, totalCount),
      },
    });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouses",
      error: error.message,
    });
  }
};





export const getWarehousesByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // ✅ Fetch all warehouses for the company
    const warehouses = await prisma.warehouses.findMany({
      where: { company_id: toNumber(company_id) },
      orderBy: { id: "desc" },
    });

    if (warehouses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No warehouses found for this company",
        data: [],
      });
    }

    // ✅ Get total stock per warehouse in one go
    const stockData = await prisma.product_warehouses.groupBy({
      by: ["warehouse_id"],
      _sum: { stock_qty: true },
      where: {
        warehouse_id: { in: warehouses.map((w) => w.id) },
      },
    });

    // Convert grouped results into a map for fast lookup
    const stockMap = stockData.reduce((acc, item) => {
      acc[item.warehouse_id] = item._sum.stock_qty || 0;
      return acc;
    }, {});

    // ✅ Format warehouses with totalStocks key
    const formattedWarehouses = warehouses.map((warehouse) => ({
      id: toNumber(warehouse.id),
      company_id: warehouse.company_id ? toNumber(warehouse.company_id) : null,
      warehouse_name: warehouse.warehouse_name,
      location: warehouse.location,
      address_line1: warehouse.address_line1,
      address_line2: warehouse.address_line2,
      city: warehouse.city,
      state: warehouse.state,
      pincode: warehouse.pincode,
      country: warehouse.country,
      created_at: warehouse.created_at,
      totalStocks: stockMap[warehouse.id] || 0, // ✅ total stock from product_warehouses
    }));

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "Warehouses fetched successfully with total stocks",
      data: formattedWarehouses,
    });
  } catch (error) {
    console.error("❌ Error fetching warehouses by company:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouses by company",
      error: error.message,
    });
  }
};


// export const getAllWarehouses = async (req, res) => {
//     try {
//       const warehouses = await prisma.warehouses.findMany();

//       // Extract unique company IDs
//       const companyIds = [
//         ...new Set(
//           warehouses
//             .map(w => w.company_id)
//             .filter(id => id !== null)
//         )
//       ];

//       // Fetch all relevant companies in one query
//       const companiesMap = {};
//       if (companyIds.length > 0) {
//         const companies = await prisma.companies.findMany({
//           where: { id: { in: companyIds } },
//           select: { id: true, name: true }
//         });
//         companies.forEach(c => {
//           companiesMap[c.id] = c.name;
//         });
//       }

//       const formattedWarehouses = warehouses.map(w => ({
//         ...w,
//         id: toNumber(w.id),
//         company_id: w.company_id ? toNumber(w.company_id) : null,
//         company_name: w.company_id ? companiesMap[w.company_id] || null : null,
//       }));

//       return res.status(200).json({
//         success: true,
//         message: "Warehouses fetched successfully",
//         data: formattedWarehouses,
//       });
//     } catch (error) {
//       console.error("Error fetching warehouses:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch warehouses",
//         error: error.message,
//       });
//     }
//   };

// ✅ Get Warehouse by ID (Basic)
export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Warehouse ID is required" });
    }

    const warehouse = await prisma.warehouses.findUnique({
      where: { id: toNumber(id) },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      data: {
        id: toNumber(warehouse.id),
        company_id: warehouse.company_id
          ? toNumber(warehouse.company_id)
          : null,
        warehouse_name: warehouse.warehouse_name,
        location: warehouse.location,
        address_line1: warehouse.address_line1,
        address_line2: warehouse.address_line2,
        city: warehouse.city,
        state: warehouse.state,
        pincode: warehouse.pincode,
        country: warehouse.country,
        created_at: warehouse.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching warehouse by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse by ID",
      error: error.message,
    });
  }
};

// ✅ Get Warehouse Details with Summary Metrics
export const getWarehouseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Warehouse ID is required" });
    }

    const warehouseId = toNumber(id);

    // Get warehouse
    const warehouse = await prisma.warehouses.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Get all products in this warehouse
    const whereClause = { warehouse_id: warehouseId };
    if (company_id) {
      whereClause.company_id = parseInt(company_id);
    }

    const products = await prisma.products.findMany({
      where: whereClause,
      include: {
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },
      },
    });

    // Calculate summary metrics
    const totalCategories = new Set(
      products.map((p) => p.item_category_id).filter(Boolean)
    ).size;
    const totalProducts = products.length;
    const totalStockUnits = products.reduce(
      (sum, p) => sum + toNumber(p.initial_qty || 0),
      0
    );

    // Find lowest and highest stock products
    let lowestStockProduct = null;
    let highestStockProduct = null;
    let lowestQty = Infinity;
    let highestQty = -Infinity;

    products.forEach((product) => {
      const qty = toNumber(product.initial_qty || 0);
      if (qty < lowestQty && qty > 0) {
        lowestQty = qty;
        lowestStockProduct = {
          name: product.item_name || "N/A",
          quantity: qty,
        };
      }
      if (qty > highestQty) {
        highestQty = qty;
        highestStockProduct = {
          name: product.item_name || "N/A",
          quantity: qty,
        };
      }
    });

    return res.status(200).json({
      success: true,
      message: "Warehouse details fetched successfully",
      data: {
        id: toNumber(warehouse.id),
        company_id: warehouse.company_id
          ? toNumber(warehouse.company_id)
          : null,
        warehouse_name: warehouse.warehouse_name,
        location: warehouse.location,
        address_line1: warehouse.address_line1,
        address_line2: warehouse.address_line2,
        city: warehouse.city,
        state: warehouse.state,
        pincode: warehouse.pincode,
        country: warehouse.country,
        created_at: warehouse.created_at,
        summary: {
          total_categories: totalCategories,
          total_products: totalProducts,
          total_stock_units: totalStockUnits,
          lowest_stock_product: lowestStockProduct || {
            name: "N/A",
            quantity: 0,
          },
          highest_stock_product: highestStockProduct || {
            name: "N/A",
            quantity: 0,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching warehouse details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse details",
      error: error.message,
    });
  }
};

// ✅ Get Warehouse Inventory List
export const getWarehouseInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      category_id,
      stock_level,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Warehouse ID is required" });
    }

    const warehouseId = toNumber(id);

    // Verify warehouse exists
    const warehouse = await prisma.warehouses.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Build where clause
    const where = { warehouse_id: warehouseId };
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (category_id) {
      where.item_category_id = parseInt(category_id);
    }
    if (search) {
      where.OR = [
        { item_name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    // Get all products first to filter by stock level
    let products = await prisma.products.findMany({
      where,
      include: {
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Filter by stock level if provided
    if (stock_level && stock_level !== "all") {
      const stockLevels = {
        low: (qty) => qty > 0 && qty <= 20,
        medium: (qty) => qty > 20 && qty <= 50,
        high: (qty) => qty > 50,
      };

      if (stockLevels[stock_level.toLowerCase()]) {
        products = products.filter((p) =>
          stockLevels[stock_level.toLowerCase()](toNumber(p.initial_qty || 0))
        );
      }
    }

    // Format inventory list
    const inventoryList = products.map((product, index) => ({
      id: index + 1,
      product_id: toNumber(product.id),
      category: product.item_category?.item_category_name || "N/A",
      product: product.item_name || "N/A",
      measurement: "Pieces", // Default, can be enhanced with UOM
      stock: toNumber(product.initial_qty || 0),
    }));

    // Calculate total stock
    const totalStock = inventoryList.reduce((sum, item) => sum + item.stock, 0);

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedList = inventoryList.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: "Warehouse inventory list fetched successfully",
      data: paginatedList,
      total_stock: totalStock,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total_records: inventoryList.length,
        total_pages: Math.ceil(inventoryList.length / limitNum),
        showing_from: inventoryList.length > 0 ? startIndex + 1 : 0,
        showing_to: Math.min(endIndex, inventoryList.length),
      },
    });
  } catch (error) {
    console.error("Error fetching warehouse inventory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse inventory",
      error: error.message,
    });
  }
};

// export const getWarehouseById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const warehouseId = parseInt(id);

//     if (isNaN(warehouseId)) {
//       return res.status(400).json({ success: false, message: "Invalid warehouse ID" });
//     }

//     const warehouse = await prisma.warehouses.findUnique({
//       where: { id: warehouseId },
//     });

//     if (!warehouse) {
//       return res.status(404).json({ success: false, message: "Warehouse not found" });
//     }

//     let company_name = null;
//     if (warehouse.company_id) {
//       const company = await prisma.companies.findUnique({
//         where: { id: warehouse.company_id },
//         select: { name: true }
//       });
//       company_name = company?.name || null;
//     }

//     const formattedWarehouse = {
//       ...warehouse,
//       id: toNumber(warehouse.id),
//       company_id: warehouse.company_id ? toNumber(warehouse.company_id) : null,
//       company_name,
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Warehouse fetched successfully",
//       data: formattedWarehouse,
//     });
//   } catch (error) {
//     console.error("Error fetching warehouse by ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch warehouse",
//       error: error.message,
//     });
//   }
// };

// ✅ Update Warehouse
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      warehouse_name,
      location,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      country,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Warehouse ID is required" });
    }

    const warehouseId = parseInt(id);

    // Check if warehouse exists
    const existingWarehouse = await prisma.warehouses.findUnique({
      where: { id: warehouseId },
    });

    if (!existingWarehouse) {
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not found" });
    }

    // Build update data object (only include fields that are provided)
    const updateData = {};
    if (warehouse_name !== undefined)
      updateData.warehouse_name = warehouse_name;
    if (location !== undefined) updateData.location = location;
    if (address_line1 !== undefined) updateData.address_line1 = address_line1;
    if (address_line2 !== undefined) updateData.address_line2 = address_line2;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (country !== undefined) updateData.country = country;

    const updatedWarehouse = await prisma.warehouses.update({
      where: { id: warehouseId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: {
        id: toNumber(updatedWarehouse.id),
        company_id: updatedWarehouse.company_id
          ? toNumber(updatedWarehouse.company_id)
          : null,
        warehouse_name: updatedWarehouse.warehouse_name,
        location: updatedWarehouse.location,
        address_line1: updatedWarehouse.address_line1,
        address_line2: updatedWarehouse.address_line2,
        city: updatedWarehouse.city,
        state: updatedWarehouse.state,
        pincode: updatedWarehouse.pincode,
        country: updatedWarehouse.country,
        created_at: updatedWarehouse.created_at,
      },
    });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update warehouse",
      error: error.message,
    });
  }
};

// ✅ Delete Warehouse
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Warehouse ID is required" });
    }

    const warehouseId = parseInt(id);

    // Check if warehouse exists
    const existingWarehouse = await prisma.warehouses.findUnique({
      where: { id: warehouseId },
    });

    if (!existingWarehouse) {
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not found" });
    }

    await prisma.warehouses.delete({
      where: { id: warehouseId },
    });

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete warehouse",
      error: error.message,
    });
  }
};

// ✅ Add Stock to Warehouse
export const addStockToWarehouse = async (req, res) => {
  try {
    const { warehouse_id } = req.params;
    const {
      company_id,
      itemName,
      hsn,
      barcode,
      sku,
      description,
      quantity,
      minQty,
      date,
      cost,
      salePriceExclusive,
      salePriceInclusive,
      discount,
      taxAccount,
      remarks,
      itemCategory, // This will be the category name string
    } = req.body;

    // Validate warehouse_id
    if (!warehouse_id) {
      return res.status(400).json({
        success: false,
        message: "Warehouse ID is required",
      });
    }

    const warehouseId = toNumber(warehouse_id);

    // Verify warehouse exists
    const warehouse = await prisma.warehouses.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Validate required fields
    if (!itemName) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, "products");
      } catch (imageError) {
        console.error("Image upload error:", imageError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: imageError.message,
        });
      }
    }

    // Find or create item category
    let itemCategoryId = null;
    if (itemCategory && itemCategory.trim()) {
      const categoryName = itemCategory.trim();
      const companyIdNum = company_id ? toNumber(company_id) : null;

      // Try to find existing category by name (case-sensitive for MySQL)
      let category = await prisma.item_category.findFirst({
        where: {
          item_category_name: categoryName,
          company_id: companyIdNum,
        },
      });

      // If not found, create new category
      if (!category) {
        category = await prisma.item_category.create({
          data: {
            company_id: companyIdNum,
            item_category_name: categoryName,
          },
        });
      }

      itemCategoryId = toNumber(category.id);
    }

    // Create product
    const product = await prisma.products.create({
      data: {
        company_id: company_id ? toNumber(company_id) : null,
        warehouse_id: warehouseId,
        item_category_id: itemCategoryId,
        item_name: itemName,
        hsn: hsn || null,
        barcode: barcode || null,
        sku: sku || null,
        description: description || null,
        initial_qty: quantity ? toNumber(quantity) : 0,
        min_order_qty: minQty ? toNumber(minQty) : null,
        as_of_date: date || null,
        initial_cost: cost ? toNumber(cost) : null,
        sale_price: salePriceExclusive ? toNumber(salePriceExclusive) : null,
        purchase_price: salePriceInclusive
          ? toNumber(salePriceInclusive)
          : null,
        discount: discount ? toNumber(discount) : null,
        tax_account: taxAccount || null,
        remarks: remarks || null,
        image: imageUrl,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            warehouse_name: true,
            location: true,
          },
        },
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Stock added to warehouse successfully",
      data: {
        id: toNumber(product.id),
        company_id: product.company_id ? toNumber(product.company_id) : null,
        warehouse_id: toNumber(product.warehouse_id),
        warehouse_name: product.warehouse?.warehouse_name,
        item_category_id: product.item_category_id
          ? toNumber(product.item_category_id)
          : null,
        item_category_name: product.item_category?.item_category_name,
        item_name: product.item_name,
        hsn: product.hsn,
        barcode: product.barcode,
        sku: product.sku,
        description: product.description,
        initial_qty: toNumber(product.initial_qty || 0),
        min_order_qty: product.min_order_qty
          ? toNumber(product.min_order_qty)
          : null,
        as_of_date: product.as_of_date,
        initial_cost: product.initial_cost
          ? toNumber(product.initial_cost)
          : null,
        sale_price: product.sale_price ? toNumber(product.sale_price) : null,
        purchase_price: product.purchase_price
          ? toNumber(product.purchase_price)
          : null,
        discount: product.discount ? toNumber(product.discount) : null,
        tax_account: product.tax_account,
        remarks: product.remarks,
        image: product.image,
        created_at: product.created_at,
      },
    });
  } catch (error) {
    console.error("Error adding stock to warehouse:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add stock to warehouse",
      error: error.message,
    });
  }
};

// ✅ Import Warehouses from Excel
export const importWarehousesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload an Excel file.",
      });
    }

    const { company_id } = req.body;
    const companyIdNum = company_id ? parseInt(company_id, 10) : null;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file does not contain any data.",
      });
    }

    const results = {
      total_rows: rows.length,
      imported: 0,
      failed: 0,
      errors: [],
      created_ids: [],
    };

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      const warehouseName =
        row["Warehouse Name"] ||
        row["warehouse_name"] ||
        row["Warehouse"] ||
        "";

      if (!warehouseName || String(warehouseName).trim() === "") {
        results.failed += 1;
        results.errors.push({
          row: index + 2,
          error: "Warehouse Name is required.",
        });
        continue;
      }

      const location = row["Location"] || row["location"] || row["City"] || "";

      const data = {
        warehouse_name: String(warehouseName).trim(),
        location: location ? String(location).trim() : null,
        address_line1: row["Address Line 1"] || row["address_line1"] || null,
        address_line2: row["Address Line 2"] || row["address_line2"] || null,
        city: row["City"] || row["city"] || null,
        state: row["State"] || row["state"] || null,
        pincode: row["Pincode"] || row["PIN"] || row["pincode"] || null,
        country: row["Country"] || row["country"] || null,
      };

      try {
        const created = await prisma.warehouses.create({
          data: {
            company_id: row["Company ID"]
              ? parseInt(row["Company ID"], 10)
              : companyIdNum,
            ...data,
          },
        });

        results.imported += 1;
        results.created_ids.push(created.id);
      } catch (error) {
        results.failed += 1;
        results.errors.push({
          row: index + 2,
          error: error.message || "Failed to import row.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse import completed",
      data: results,
    });
  } catch (error) {
    console.error("Error importing warehouses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to import warehouses",
      error: error.message,
    });
  }
};

// ✅ Export Warehouses to Excel
export const exportWarehousesToExcel = async (req, res) => {
  try {
    const { company_id } = req.query;

    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id, 10);
    }

    const warehouses = await prisma.warehouses.findMany({
      where,
      orderBy: { id: "desc" },
    });

    if (!warehouses || warehouses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No warehouses found to export.",
      });
    }

    const exportData = warehouses.map((warehouse) => ({
      "Warehouse ID": warehouse.id,
      "Company ID": warehouse.company_id || "",
      "Warehouse Name": warehouse.warehouse_name || "",
      Location: warehouse.location || "",
      "Address Line 1": warehouse.address_line1 || "",
      "Address Line 2": warehouse.address_line2 || "",
      City: warehouse.city || "",
      State: warehouse.state || "",
      Pincode: warehouse.pincode || "",
      Country: warehouse.country || "",
      "Created At": warehouse.created_at
        ? new Date(warehouse.created_at).toISOString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouses");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `warehouses-export-${timestamp}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error exporting warehouses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export warehouses",
      error: error.message,
    });
  }
};

// ✅ Get stock summary by warehouse

export const getWarehouseStockDetails = async (req, res) => {
  try {
    const { warehouse_id, company_id } = req.params;

    if (!warehouse_id || !company_id) {
      return res.status(400).json({
        success: false,
        message: "warehouse_id and company_id are required",
      });
    }

    // ✅ Fetch warehouse info
    const warehouse = await prisma.warehouses.findUnique({
      where: { id: Number(warehouse_id) },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // ✅ Fetch products + stock data
    const productsInWarehouse = await prisma.product_warehouses.findMany({
      where: { warehouse_id: Number(warehouse_id) },
      include: {
        product: {
          include: {
            item_category: true,
            unit_detail: true,
          },
        },
      },
      orderBy: { product_id: "asc" },
    });

    // ✅ Handle empty warehouse
    if (productsInWarehouse.length === 0) {
      return res.status(200).json({
        success: true,
        warehouse,
        totalStocks: 0,
        summary: {
          totalCategories: 0,
          totalProducts: 0,
          totalStockValue: 0,
        },
        highestStockProduct: null,
        lowestStockProduct: null,
        categoryWiseSummary: [],
        inventoryList: [],
      });
    }

    // ✅ Compute totals
    const totalProducts = productsInWarehouse.length;
    const totalStocks = productsInWarehouse.reduce(
      (sum, p) => sum + (p.stock_qty || 0),
      0
    );

    const totalStockValue = productsInWarehouse.reduce(
      (sum, p) =>
        sum +
        ((p.stock_qty || 0) * (Number(p.product?.purchase_price) || 0)),
      0
    );

    // ✅ Category-wise stock summary
    const categoryMap = {};
    productsInWarehouse.forEach((p) => {
      const categoryName =
        p.product?.item_category?.item_category_name || "Uncategorized";

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { totalItems: 0, totalStock: 0, totalValue: 0 };
      }

      categoryMap[categoryName].totalItems += 1;
      categoryMap[categoryName].totalStock += p.stock_qty || 0;
      categoryMap[categoryName].totalValue +=
        (p.stock_qty || 0) * (Number(p.product?.purchase_price) || 0);
    });

    const categoryWiseSummary = Object.entries(categoryMap).map(
      ([category, data]) => ({
        category,
        totalItems: data.totalItems,
        totalStock: data.totalStock,
        totalValue: data.totalValue.toFixed(2),
      })
    );

    // ✅ Find highest and lowest stock product
    let highestStockProduct = null;
    let lowestStockProduct = null;

    productsInWarehouse.forEach((p) => {
      if (
        !highestStockProduct ||
        (p.stock_qty || 0) > (highestStockProduct.stock_qty || 0)
      ) {
        highestStockProduct = p;
      }
      if (
        !lowestStockProduct ||
        (p.stock_qty || 0) < (lowestStockProduct.stock_qty || 0)
      ) {
        lowestStockProduct = p;
      }
    });

    // ✅ Prepare product list
    const inventoryList = productsInWarehouse.map((p, index) => ({
      index: index + 1,
      category: p.product?.item_category?.item_category_name || "Uncategorized",
      product_name: p.product?.item_name,
      measurement:
        p.product?.unit_detail?.weight_per_unit != null
          ? `${p.product.unit_detail.weight_per_unit} Units`
          : "-",
      stock: p.stock_qty || 0,
      purchase_price: Number(p.product?.purchase_price) || 0,
      total_value: (
        (p.stock_qty || 0) * (Number(p.product?.purchase_price) || 0)
      ).toFixed(2),
    }));

    // ✅ Final Response
    res.status(200).json({
      success: true,
      warehouse: {
        id: warehouse.id,
        warehouse_name: warehouse.warehouse_name,
        location: warehouse.location,
        address_line1: warehouse.address_line1,
        address_line2: warehouse.address_line2,
        city: warehouse.city,
        state: warehouse.state,
        pincode: warehouse.pincode,
        country: warehouse.country,
      },
      totalStocks, // 👈 main key you wanted
      summary: {
        totalCategories: Object.keys(categoryMap).length,
        totalProducts,
        totalStockValue: totalStockValue.toFixed(2),
      },
      highestStockProduct: {
        name: highestStockProduct?.product?.item_name || null,
        qty: highestStockProduct?.stock_qty || 0,
      },
      lowestStockProduct: {
        name: lowestStockProduct?.product?.item_name || null,
        qty: lowestStockProduct?.stock_qty || 0,
      },
      categoryWiseSummary,
      inventoryList,
    });
  } catch (error) {
    console.error("❌ Error fetching warehouse stock:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


