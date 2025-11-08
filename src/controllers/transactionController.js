// // src/controllers/transactionController.js
// import * as prismaClient from "@prisma/client";
// const { PrismaClient } = prismaClient;
// const prisma = new PrismaClient();

import prisma from "../config/db.js";


// ✅ Create Transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      date,
      company_id,
      balance_type,
      voucher_type,
      voucher_no,
      amount,
      from_type,
      from_id,
      account_type,
      note
    } = req.body;

    const transaction_id = "TXN" + Date.now();

    const newTransaction = await prisma.transactions.create({
      data: {
        date: date || null,
        company_id: company_id ? parseInt(company_id) : null,
        transaction_id,
        balance_type: balance_type || null,
        voucher_type: voucher_type || null,
        voucher_no: voucher_no || null,
        amount: amount ? parseFloat(amount) : 0,
        from_type: from_type || null,
        from_id: from_id ? parseInt(from_id) : null,
        account_type: account_type || null,
        note: note || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: { transaction_id: newTransaction.transaction_id },
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};


export const getTransactionsByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required in params",
      });
    }

    const cId = parseInt(company_id);

    // 1️⃣ Fetch all transactions for this company
    const transactions = await prisma.transactions.findMany({
      where: { company_id: cId },
      orderBy: { created_at: "desc" },
    });

    if (!transactions.length) {
      return res.status(200).json({
        success: true,
        message: "No transactions found for this company",
        data: [],
      });
    }

    // 2️⃣ Collect all vendor/customer IDs
    const vendorCustomerIds = [
      ...new Set(
        transactions
          .filter((t) =>
            ["vender", "vendor", "customer"].includes(
              String(t.from_type).toLowerCase()
            )
          )
          .map((t) => t.from_id)
      ),
    ];

    // 3️⃣ Fetch all vendor/customer details
    const vendorCustomers = await prisma.vendorsCustomer.findMany({
      where: { id: { in: vendorCustomerIds } },
      select: {
        id: true,
        type: true,
        name_english: true,
        name_arabic: true,
        company_name: true,
      },
    });

    // Create lookup map for quick access
    const vendorMap = {};
    vendorCustomers.forEach((vc) => {
      vendorMap[vc.id] = vc;
    });

    // 4️⃣ Attach vendor/customer info to each transaction
    const result = transactions.map((tx) => ({
      ...tx,
      from_entity:
        vendorMap[tx.from_id] &&
        ["vender", "vendor", "customer"].includes(
          String(tx.from_type).toLowerCase()
        )
          ? {
              id: vendorMap[tx.from_id].id,
              type: vendorMap[tx.from_id].type,
              name_english: vendorMap[tx.from_id].name_english,
              name_arabic: vendorMap[tx.from_id].name_arabic,
              company_name: vendorMap[tx.from_id].company_name,
            }
          : null,
    }));

    // 5️⃣ Return response
    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};


export const getAllTransactions = async (req, res) => {
  try {
    // 1️⃣ Fetch all transactions
    const transactions = await prisma.transactions.findMany({
      orderBy: { created_at: "desc" },
    });

    if (!transactions.length) {
      return res.status(200).json({
        success: true,
        message: "No transactions found",
        data: [],
      });
    }

    // 2️⃣ Get all vendor/customer IDs from transactions
    const vendorCustomerIds = [
      ...new Set(
        transactions
          .filter((t) =>
            ["vender", "vendor", "customer"].includes(
              String(t.from_type).toLowerCase()
            )
          )
          .map((t) => t.from_id)
      ),
    ];

    // 3️⃣ Fetch their details
    const vendorCustomers = await prisma.vendorsCustomer.findMany({
      where: { id: { in: vendorCustomerIds } },
      select: {
        id: true,
        type: true,
        name_english: true,
        name_arabic: true,
        company_name: true,
      },
    });

    // 4️⃣ Map for quick lookup
    const vendorMap = {};
    vendorCustomers.forEach((vc) => {
      vendorMap[vc.id] = vc;
    });

    // 5️⃣ Attach vendor/customer info to each transaction
    const result = transactions.map((tx) => ({
      ...tx,
      from_entity:
        vendorMap[tx.from_id] &&
        ["vender", "vendor", "customer"].includes(
          String(tx.from_type).toLowerCase()
        )
          ? vendorMap[tx.from_id]
          : null,
    }));

    // ✅ Send final response
    res.status(200).json({
      success: true,
      message: "All transactions fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

// ✅ Get All Transactions
// export const getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await prisma.transactions.findMany({
//       include: {
//         company: { select: { name: true } },
//       },
//     });

//     const enriched = await enrichTransactions(transactions);

//     return res.status(200).json({
//       success: true,
//       message: "Transactions fetched successfully",
//       data: enriched,
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch transactions",
//       error: error.message,
//     });
//   }
// };

// ✅ Get Transaction By ID
// export const getTransactionById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const txnId = parseInt(id);

//     const transaction = await prisma.transactions.findUnique({
//       where: { id: txnId },
//       include: {
//         company: { select: { name: true } },
//       },
//     });

//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: "Transaction not found",
//       });
//     }

//     const [enriched] = await enrichTransactions([transaction]);

//     return res.status(200).json({
//       success: true,
//       message: "Transaction fetched successfully",
//       data: enriched,
//     });
//   } catch (error) {
//     console.error("Error fetching transaction by ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch transaction",
//       error: error.message,
//     });
//   }
// };

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const txId = parseInt(id);

    // 1️⃣ Find the transaction
    const transaction = await prisma.transactions.findUnique({
      where: { id: txId },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // 2️⃣ If from_type is vendor/customer, fetch its details
    const fType = String(transaction.from_type).toLowerCase();
    let fromEntity = null;

    if (["vender", "vendor", "customer"].includes(fType)) {
      fromEntity = await prisma.vendorsCustomer.findUnique({
        where: { id: transaction.from_id },
        select: {
          id: true,
          type: true,
          name_english: true,
          name_arabic: true,
          company_name: true,
        },
      });
    }

    // 3️⃣ Return response
    res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: {
        ...transaction,
        from_entity: fromEntity,
      },
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};



// ✅ Update Transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const txnId = parseInt(id);
    const data = { ...req.body };

    if (data.amount !== undefined) data.amount = parseFloat(data.amount);
    if (data.company_id !== undefined) data.company_id = parseInt(data.company_id) || null;
    if (data.from_id !== undefined) data.from_id = parseInt(data.from_id) || null;

    const existing = await prisma.transactions.findUnique({ where: { id: txnId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const updated = await prisma.transactions.update({
      where: { id: txnId },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};

// ✅ Delete Transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const txnId = parseInt(id);

    const existing = await prisma.transactions.findUnique({ where: { id: txnId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await prisma.transactions.delete({ where: { id: txnId } });

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};