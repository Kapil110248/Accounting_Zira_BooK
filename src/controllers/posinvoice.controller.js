import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * 🧾 CREATE POS INVOICE
 */
export const createposinvoice = async (req, res) => {
  try {
    const {
      company_id,
      customer_id,
      tax_id,
      subtotal,
      total,
      payment_status,
      products,
      symbol,
      currency,
    } = req.body;

    // ✅ Validate required fields
    if (!company_id || !customer_id || !products?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ Create invoice and related products within a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create the invoice
      const newInvoice = await tx.pos_invoices.create({
        data: {
          company_id: Number(company_id),
          customer_id: Number(customer_id),
          tax_id: tax_id ? Number(tax_id) : null,
          subtotal: Number(subtotal),
          total: Number(total),
          payment_status,
          symbol: symbol || null,
          currency: currency || null,
        },
      });

      // 2️⃣ Prepare invoice products including warehouse_id
      const invoiceProducts = products.map((item) => ({
        invoice_id: newInvoice.id,
        product_id: Number(item.product_id),
        warehouse_id: item.warehouse_id ? Number(item.warehouse_id) : null,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      // 3️⃣ Save all invoice products
      await tx.pos_invoice_products.createMany({ data: invoiceProducts });

      // 4️⃣ Fetch full invoice details including warehouse & product
      const fullInvoice = await tx.pos_invoices.findUnique({
        where: { id: newInvoice.id },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  item_name: true,
                },
              },
              warehouse: {
                select: {
                  id: true,
                  warehouse_name: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name_english: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          tax_class: {
            select: {
              tax_class: true,
              tax_value: true,
            },
          },
        },
      });

      return fullInvoice;
    });

    // ✅ Cleaned response structure
    return res.status(201).json({
      success: true,
      message: "✅ Invoice created successfully with warehouse mapping",
      data: {
        id: invoice.id,
        company_id: invoice.company_id,
        customer_id: invoice.customer_id,
        tax_id: invoice.tax_id,
        subtotal: invoice.subtotal,
        total: invoice.total,
        payment_status: invoice.payment_status,
        symbol: invoice.symbol,
        currency: invoice.currency,
        created_at: invoice.created_at,
        customer: invoice.customer,
        tax: invoice.tax_class
          ? {
              tax_class: invoice.tax_class.tax_class,
              tax_value: invoice.tax_class.tax_value,
            }
          : null,
        products: invoice.products.map((p) => ({
          product_id: p.product_id,
          item_name: p.product?.item_name || null,
          warehouse_id: p.warehouse?.id || null,
          warehouse_name: p.warehouse?.warehouse_name || null,
        })),
      },
    });
  } catch (error) {
    console.error("❌ createposinvoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};


// 📌 Get All Invoices by Company
export const getAllinvoice = async (req, res) => {
  try {
    const { company_id } = req.params;

    // ✅ Validate company_id
    if (!company_id || isNaN(company_id)) {
      return res.status(400).json({
        success: false,
        message: "Valid company_id is required",
      });
    }

    // ✅ Fetch all invoices with related data
    const invoices = await prisma.pos_invoices.findMany({
      where: { company_id: Number(company_id) },
      orderBy: { created_at: "desc" },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                item_name: true,
              },
            },
            warehouse: {
              select: {
                warehouse_name: true, // ✅ Only warehouse name
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name_english: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        tax_class: {
          select: {
            tax_class: true,
            tax_value: true,
          },
        },
      },
    });

    // ✅ Handle no invoices found
    if (!invoices.length) {
      return res.status(404).json({
        success: false,
        message: "No invoices found for this company",
      });
    }

    // ✅ Format response
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      company_id: invoice.company_id,
      subtotal: invoice.subtotal,
      total: invoice.total,
      payment_status: invoice.payment_status,
      created_at: invoice.created_at,

      customer: invoice.customer
        ? {
            id: invoice.customer.id,
            name_english: invoice.customer.name_english,
            email: invoice.customer.email,
            phone: invoice.customer.phone,
            address: invoice.customer.address,
          }
        : null,

      tax: invoice.tax_class
        ? {
            tax_class: invoice.tax_class.tax_class,
            tax_value: invoice.tax_class.tax_value,
          }
        : null,

      products:
        invoice.products?.map((p) => ({
          product_id: p.product_id,
          item_name: p.product?.item_name || null,
          warehouse_name: p.warehouse?.warehouse_name || null, // ✅ only warehouse name
        })) || [],
    }));

    // ✅ Send final structured response
    return res.status(200).json({
      success: true,
      message: "✅ Invoices fetched successfully",
      count: formattedInvoices.length,
      data: formattedInvoices,
    });
  } catch (error) {
    console.error("❌ getAllinvoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};



// 📌 Get Single Invoice by ID (same structure)
export const getinvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.pos_invoices.findUnique({
      where: { id: Number(id) },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                item_name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name_english: true,
            email: true,
            phone: true,
            address: true, // ✅ Added field
          },
        },
        tax: {
          select: {
            tax_class: true,
            tax_value: true,
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const formattedInvoice = {
      ...invoice,
      products: invoice.products.map((p) => ({
        id: p.id,
        product_id: p.product_id,
        item_name: p.product?.item_name || null,
        quantity: p.quantity,
        price: p.price,
      })),
      tax: invoice.tax
        ? {
            tax_class: invoice.tax.tax_class,
            tax_value: invoice.tax.tax_value,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data: formattedInvoice,
    });
  } catch (error) {
    console.error("❌ getinvoiceById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get invoice",
      error: error.message,
    });
  }
};

/**
 * ✏️ UPDATE POS INVOICE
 */
export const updateposinvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { subtotal, total, products } = req.body;

    // ✅ Check if invoice exists
    const existingInvoice = await prisma.pos_invoices.findUnique({
      where: { id: Number(id) },
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // ✅ Transaction — update invoice + products safely
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // 🧾 1️⃣ Update subtotal & total if provided
      const invoice = await tx.pos_invoices.update({
        where: { id: Number(id) },
        data: {
          subtotal:
            subtotal !== undefined
              ? Number(subtotal)
              : existingInvoice.subtotal,
          total: total !== undefined ? Number(total) : existingInvoice.total,
        },
      });

      // 🛒 2️⃣ Update Products (remove old and add new)
      if (products && Array.isArray(products)) {
        await tx.pos_invoice_products.deleteMany({
          where: { invoice_id: Number(id) },
        });

        const newProducts = products.map((item) => ({
          invoice_id: Number(id),
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        }));

        await tx.pos_invoice_products.createMany({ data: newProducts });
      }

      return invoice;
    });

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("❌ updateposinvoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};

/**
 * 🗑️ DELETE INVOICE
 */
export const deleteinvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete child records first (pos_invoice_products)
    await prisma.pos_invoice_products.deleteMany({
      where: { invoice_id: Number(id) },
    });

    // Delete parent invoice
    const deletedInvoice = await prisma.pos_invoices.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
      data: deletedInvoice,
    });
  } catch (error) {
    console.error("❌ deleteinvoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};

/**
 * 📊 SUMMARY DASHBOARD
 * → Total sales, total invoices, total tax collected, partial/full counts
 */
export const summarydahboard = async (req, res) => {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    // Fetch all invoices for this company
    const invoices = await prisma.pos_invoices.findMany({
      where: { company_id: Number(company_id) },
    });

    const totalInvoices = invoices.length;
    const totalSales = invoices.reduce((sum, i) => sum + Number(i.total), 0);
    const partialCount = invoices.filter(
      (i) => i.payment_status === "partial"
    ).length;
    const paidCount = invoices.filter(
      (i) => i.payment_status === "paid"
    ).length;
    const unpaidCount = invoices.filter(
      (i) => i.payment_status === "unpaid"
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        totalInvoices,
        totalSales,
        partialCount,
        paidCount,
        unpaidCount,
      },
    });
  } catch (error) {
    console.error("❌ summarydahboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
      error: error.message,
    });
  }
};
