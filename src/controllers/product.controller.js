import { uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/db.js";

const toNumber = (val) => (val == null ? null : Number(val));

// export const createProduct = async (req, res) => {
//   try {
//     const {
//       company_id,
//       warehouse_id,
//       item_category_id,
//       item_name,
//       unit_id,
//       hsn,
//       barcode,
//       sku,
//       description,
//       initial_qty,
//       min_order_qty,
//       as_of_date,
//       initial_cost,
//       sale_price,
//       purchase_price,
//       discount,
//       tax_account,
//       remarks,
//     } = req.body;

//     let imageUrl = null;
//     if (req.file) {
//       imageUrl = await uploadToCloudinary(req.file.buffer, "products");
//     }

//     const product = await prisma.products.create({
//       data: {
//         company_id: toNumber(company_id),
//         warehouse_id: toNumber(warehouse_id),
//         item_category_id: toNumber(item_category_id),
//         item_name,
//         hsn,
//         barcode,
//         sku,
//         description,
//         initial_qty: toNumber(initial_qty),
//         min_order_qty: toNumber(min_order_qty),
//         as_of_date,
//         initial_cost: toNumber(initial_cost),
//         sale_price: toNumber(sale_price),
//         purchase_price: toNumber(purchase_price),
//         discount: toNumber(discount),
//         tax_account,
//         remarks,
//         image: imageUrl,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       data: product,
//     });
//   } catch (error) {
//     console.error("Create product error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const createProduct = async (req, res) => {
  try {
    const {
      company_id,
      item_category_id,
      unit_detail_id,
      item_name,
      hsn,
      barcode,
      sku,
      description,
      initial_qty,
      min_order_qty,
      as_of_date,
      initial_cost,
      sale_price,
      purchase_price,
      discount,
      tax_account,
      remarks,
      warehouses, // ✅ array or JSON string [{ warehouse_id, stock_qty }]
    } = req.body;

    // ✅ Upload image if provided
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "products");
    }

    // ✅ Parse warehouses (handle JSON string case)
    let parsedWarehouses = [];
    if (typeof warehouses === "string") {
      try {
        parsedWarehouses = JSON.parse(warehouses);
      } catch (err) {
        console.warn("⚠️ Invalid warehouses JSON, skipping");
        parsedWarehouses = [];
      }
    } else if (Array.isArray(warehouses)) {
      parsedWarehouses = warehouses;
    }

    // ✅ Calculate total stock
    const totalStock = parsedWarehouses.reduce(
      (sum, w) => sum + (toNumber(w.stock_qty) || 0),
      0
    );

    // ✅ Create Product
    const product = await prisma.products.create({
      data: {
        company_id: toNumber(company_id),
        item_category_id: toNumber(item_category_id),
        unit_detail_id: toNumber(unit_detail_id),
        item_name,
        hsn,
        barcode,
        sku,
        description,
        initial_qty: toNumber(initial_qty),
        min_order_qty: toNumber(min_order_qty),
        as_of_date,
        initial_cost: toNumber(initial_cost),
        sale_price: toNumber(sale_price),
        purchase_price: toNumber(purchase_price),
        discount: toNumber(discount),
        tax_account,
        remarks,
        image: imageUrl,
        total_stock: totalStock, // ✅ Save total stock

        // ✅ Many-to-many relation for warehouses
        product_warehouses: {
          create: parsedWarehouses.map((w) => ({
            warehouse_id: toNumber(w.warehouse_id),
            stock_qty: toNumber(w.stock_qty) || 0,
          })),
        },
      },

      include: {
        product_warehouses: {
          include: {
            warehouse: {
              select: { id: true, warehouse_name: true, location: true },
            },
          },
        },
        item_category: { select: { id: true, item_category_name: true } },
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_id: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "✅ Product created successfully with warehouse mapping",
      data: product,
    });
  } catch (error) {
    console.error("❌ Create product error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await prisma.products.findMany({
//       include: {
//         warehouse: { select: { id: true, warehouse_name: true, location: true } },
//         item_category: { select: { id: true, item_category_name: true } },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     res.json({ success: true, data: products });
//   } catch (error) {
//     console.error("Get all products error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        // ✅ Include all linked warehouses with stock details
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
              },
            },
          },
        },

        // ✅ Include category info
        item_category: {
          select: { id: true, item_category_name: true },
        },

        // ✅ Include unit details
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_id: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // ✅ Optionally, compute total stock dynamically if not stored (safe fallback)
    const formattedProducts = products.map((p) => ({
      ...p,
      total_stock:
        p.total_stock ??
        p.product_warehouses.reduce((sum, pw) => sum + (pw.stock_qty || 0), 0),
    }));

    res.status(200).json({
      success: true,
      message: "✅ Products fetched successfully",
      total: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("❌ Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getProductsByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    // ✅ Validate company_id
    const companyId = Number(company_id);
    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing company_id parameter",
      });
    }

    // ✅ Fetch products belonging to the company
    const products = await prisma.products.findMany({
      where: { company_id: companyId },
      include: {
        // ✅ Include all linked warehouses via product_warehouses
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },

        // ✅ Include item category
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },

        // ✅ Include unit details
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_id: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // ✅ Fallback: dynamically compute total_stock if missing
    const formattedProducts = products.map((product) => {
      const totalStock =
        product.total_stock ??
        product.product_warehouses.reduce(
          (sum, pw) => sum + (pw.stock_qty || 0),
          0
        );

      return { ...product, total_stock: totalStock };
    });

    // ✅ Handle empty case
    if (formattedProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found for company_id ${companyId}`,
      });
    }

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: `✅ Products fetched successfully for company_id ${companyId}`,
      total_products: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("❌ Get products by company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getProductsByCompanyAndWarehouse = async (req, res) => {
  try {
    const { company_id, warehouse_id } = req.params;

    // ✅ Validate params
    const companyId = Number(company_id);
    const warehouseId = Number(warehouse_id);

    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing company_id parameter",
      });
    }

    if (!warehouseId || isNaN(warehouseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing warehouse_id parameter",
      });
    }

    // ✅ Fetch products linked to the company AND the specified warehouse
    const products = await prisma.products.findMany({
      where: {
        company_id: companyId,
        product_warehouses: {
          some: {
            warehouse_id: warehouseId,
          },
        },
      },
      include: {
        // ✅ Include linked warehouses with stock details
        product_warehouses: {
          where: { warehouse_id: warehouseId }, // only include the selected warehouse
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },

        // ✅ Include item category
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },

        // ✅ Include unit details
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_id: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // ✅ Calculate total stock dynamically
    const formattedProducts = products.map((product) => {
      const totalStock =
        product.total_stock ??
        product.product_warehouses.reduce(
          (sum, pw) => sum + (pw.stock_qty || 0),
          0
        );

      return { ...product, total_stock: totalStock };
    });

    // ✅ If no products found
    if (formattedProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found for company_id ${companyId} in warehouse_id ${warehouseId}`,
      });
    }

    // ✅ Success response
    res.status(200).json({
      success: true,
      message: `✅ Products fetched successfully for company_id ${companyId} in warehouse_id ${warehouseId}`,
      total_products: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("❌ Get by company and warehouse error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * 🟢 GET PRODUCT BY ID
 */

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    const productId = Number(id);
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product ID",
      });
    }

    // ✅ Fetch product by ID with related data
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        // ✅ Include all linked warehouses via product_warehouses
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },

        // ✅ Include category info
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },

        // ✅ Include unit details info
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_id: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
    });

    // ✅ If no product found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Calculate total_stock dynamically (if not already stored)
    const totalStock =
      product.total_stock ??
      product.product_warehouses.reduce(
        (sum, pw) => sum + (pw.stock_qty || 0),
        0
      );

    // ✅ Return formatted response
    return res.status(200).json({
      success: true,
      message: "✅ Product fetched successfully",
      data: {
        ...product,
        total_stock: totalStock,
      },
    });
  } catch (error) {
    console.error("❌ Get product by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * 🟠 UPDATE PRODUCT
 */


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      item_category_id,
      unit_detail_id,
      item_name,
      hsn,
      barcode,
      sku,
      description,
      initial_qty,
      min_order_qty,
      as_of_date,
      initial_cost,
      sale_price,
      purchase_price,
      discount,
      tax_account,
      remarks,
      warehouses // ✅ Expected: [{ warehouse_id, stock_qty }]
    } = req.body;

    const productId = Number(id);
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product ID"
      });
    }

    // ✅ Check if product exists
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
      include: { product_warehouses: true }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // ✅ Handle new image upload (optional)
    let imageUrl = existingProduct.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "products");
    }

    // ✅ Parse warehouses input (can come as JSON string in form-data)
    let parsedWarehouses = [];
    if (typeof warehouses === "string") {
      try {
        parsedWarehouses = JSON.parse(warehouses);
      } catch {
        parsedWarehouses = [];
      }
    } else if (Array.isArray(warehouses)) {
      parsedWarehouses = warehouses;
    }

    // ✅ Calculate total stock
    let totalStock = parsedWarehouses.length
      ? parsedWarehouses.reduce((sum, w) => sum + (Number(w.stock_qty) || 0), 0)
      : existingProduct.total_stock;

    // ✅ Update product_warehouses mapping (replace all for simplicity)
    if (parsedWarehouses.length > 0) {
      await prisma.product_warehouses.deleteMany({
        where: { product_id: productId }
      });

      await prisma.product_warehouses.createMany({
        data: parsedWarehouses.map((w) => ({
          product_id: productId,
          warehouse_id: Number(w.warehouse_id),
          stock_qty: Number(w.stock_qty) || 0
        }))
      });
    }

    // ✅ Prepare update data
    const updateData = {
      company_id: company_id ? Number(company_id) : existingProduct.company_id,
      item_name: item_name ?? existingProduct.item_name,
      hsn: hsn ?? existingProduct.hsn,
      barcode: barcode ?? existingProduct.barcode,
      sku: sku ?? existingProduct.sku,
      description: description ?? existingProduct.description,
      initial_qty: initial_qty ? Number(initial_qty) : existingProduct.initial_qty,
      min_order_qty: min_order_qty
        ? Number(min_order_qty)
        : existingProduct.min_order_qty,
      as_of_date: as_of_date ?? existingProduct.as_of_date,
      initial_cost: initial_cost ? Number(initial_cost) : existingProduct.initial_cost,
      sale_price: sale_price ? Number(sale_price) : existingProduct.sale_price,
      purchase_price: purchase_price
        ? Number(purchase_price)
        : existingProduct.purchase_price,
      discount: discount ? Number(discount) : existingProduct.discount,
      tax_account: tax_account ?? existingProduct.tax_account,
      remarks: remarks ?? existingProduct.remarks,
      image: imageUrl,
      total_stock: totalStock,
      updated_at: new Date()
    };

    // ✅ Handle relational updates properly
    if (item_category_id) {
      updateData.item_category = { connect: { id: Number(item_category_id) } };
    }
    if (unit_detail_id) {
      updateData.unit_detail = { connect: { id: Number(unit_detail_id) } };
    }

    // ✅ Update product
    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: updateData,
      include: {
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
                country: true
              }
            }
          }
        },
        item_category: { select: { id: true, item_category_name: true } },
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_id: true,
            weight_per_unit: true,
            created_at: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    console.error("❌ Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};



/**
 * 🔴 DELETE PRODUCT
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.products.findUnique({
      where: { id: toNumber(id) },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    await prisma.products.delete({ where: { id: toNumber(id) } });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
