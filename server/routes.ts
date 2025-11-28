import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  insertUserSchema, insertCategorySchema, insertProductSchema,
  insertShiftSchema, insertTransactionSchema, insertTransactionItemSchema,
  insertStockAdjustmentSchema, insertLoanSchema, insertBilliardTableSchema,
  transactionItems, stockAdjustments
} from "@shared/schema";
import { z } from "zod";

// Simple session middleware to track logged in user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "admin" | "cashier";
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ HEALTH CHECK ROUTE (untuk keep-alive) ============
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ============ AUTH ROUTES ============
  const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Username atau password salah" });
      }
      
      // Get active shift if cashier
      let activeShift = null;
      if (user.role === "cashier") {
        activeShift = await storage.getActiveShiftByCashier(user.id);
      }
      
      res.json({
        user: { id: user.id, name: user.name, username: user.username, role: user.role },
        activeShift
      });
    } catch (error) {
      res.status(400).json({ message: "Data login tidak valid" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, name: user.name, username: user.username, role: user.role } });
    } catch (error) {
      res.status(400).json({ message: "Data registrasi tidak valid" });
    }
  });

  // ============ USER ROUTES ============
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ id: u.id, name: u.name, username: u.username, role: u.role })));
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pengguna" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ id: user.id, name: user.name, username: user.username, role: user.role });
    } catch (error) {
      res.status(400).json({ message: "Data pengguna tidak valid" });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }
      
      res.json({ id: user.id, name: user.name, username: user.username, role: user.role });
    } catch (error) {
      res.status(400).json({ message: "Data pengguna tidak valid" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus pengguna" });
    }
  });

  // ============ CATEGORY ROUTES ============
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoriesList = await storage.getAllCategories();
      res.json(categoriesList);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data kategori" });
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Data kategori tidak valid" });
    }
  });

  app.put("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Data kategori tidak valid" });
    }
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus kategori" });
    }
  });

  // ============ PRODUCT ROUTES ============
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const productsList = await storage.getAllProducts();
      const categoriesList = await storage.getAllCategories();
      
      const productsWithCategory = productsList.map(p => {
        const category = categoriesList.find(c => c.id === p.categoryId);
        return { ...p, categoryName: category?.name || "" };
      });
      
      res.json(productsWithCategory);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data produk" });
    }
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      const category = productData.categoryId ? await storage.getCategory(productData.categoryId) : null;
      res.json({ ...product, categoryName: category?.name || "" });
    } catch (error) {
      res.status(400).json({ message: "Data produk tidak valid" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      
      const category = product.categoryId ? await storage.getCategory(product.categoryId) : null;
      res.json({ ...product, categoryName: category?.name || "" });
    } catch (error) {
      res.status(400).json({ message: "Data produk tidak valid" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if product is used in transactions
      const items = await db.select().from(transactionItems).where(eq(transactionItems.productId, id));
      if (items.length > 0) {
        return res.status(400).json({ 
          message: "Tidak dapat menghapus produk karena sudah digunakan dalam transaksi" 
        });
      }
      
      // Check if product is used in stock adjustments
      const adjustments = await db.select().from(stockAdjustments).where(eq(stockAdjustments.productId, id));
      if (adjustments.length > 0) {
        return res.status(400).json({ 
          message: "Tidak dapat menghapus produk karena memiliki riwayat penyesuaian stok" 
        });
      }
      
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus produk";
      res.status(500).json({ message: `Gagal menghapus produk: ${errorMessage}` });
    }
  });

  // ============ SHIFT ROUTES ============
  app.get("/api/shifts", async (req: Request, res: Response) => {
    try {
      const shiftsList = await storage.getAllShifts();
      const users = await storage.getAllUsers();
      
      const shiftsWithCashier = shiftsList.map(s => {
        const cashier = users.find(u => u.id === s.cashierId);
        return { ...s, cashierName: cashier?.name || "" };
      });
      
      res.json(shiftsWithCashier);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data shift" });
    }
  });

  app.get("/api/shifts/active", async (req: Request, res: Response) => {
    try {
      const shiftsList = await storage.getActiveShifts();
      const users = await storage.getAllUsers();
      
      const shiftsWithCashier = shiftsList.map(s => {
        const cashier = users.find(u => u.id === s.cashierId);
        return { ...s, cashierName: cashier?.name || "" };
      });
      
      res.json(shiftsWithCashier);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data shift aktif" });
    }
  });

  app.post("/api/shifts", async (req: Request, res: Response) => {
    try {
      const shiftData = insertShiftSchema.parse(req.body);
      
      // Check if cashier already has an active shift
      const existingShift = await storage.getActiveShiftByCashier(shiftData.cashierId);
      if (existingShift) {
        return res.status(400).json({ message: "Kasir masih memiliki shift aktif" });
      }
      
      const shift = await storage.createShift(shiftData);
      const cashier = await storage.getUser(shift.cashierId);
      res.json({ ...shift, cashierName: cashier?.name || "" });
    } catch (error) {
      res.status(400).json({ message: "Data shift tidak valid" });
    }
  });

  // Get shift summary dengan breakdown billiard vs cafe + expenses
  app.get("/api/shifts/:id/summary", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift tidak ditemukan" });
      }

      const transactions = await storage.getTransactionsByShift(id);
      const loans = await storage.getLoansByShift(id);
      const products = await storage.getAllProducts();
      
      let billiardIncome = 0;
      let cafeIncome = 0;
      let billiardCount = 0;
      let cafeCount = 0;
      let totalExpenses = 0;

      for (const tx of transactions) {
        const items = await storage.getTransactionItems(tx.id);
        for (const item of items) {
          const product = products.find(p => p.id === item.productId);
          if (product?.name?.includes("MEJA")) {
            billiardIncome += item.subtotal;
            billiardCount++;
          } else {
            cafeIncome += item.subtotal;
            cafeCount++;
          }
        }
      }

      for (const loan of loans) {
        totalExpenses += loan.amount;
      }

      const totalIncome = billiardIncome + cafeIncome;
      const finalTotal = totalIncome - totalExpenses;

      res.json({
        shift: { ...shift, cashierName: (await storage.getUser(shift.cashierId))?.name || "" },
        summary: {
          totalIncome,
          billiardIncome,
          billiardTransactions: billiardCount,
          cafeIncome,
          cafeTransactions: cafeCount,
          totalTransactions: transactions.length,
          expenses: loans.map(l => ({ description: l.description, amount: l.amount, recipientName: l.recipientName })),
          totalExpenses,
          finalTotal,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil summary shift" });
    }
  });

  app.put("/api/shifts/:id/end", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { endingCash } = req.body;
      
      const shift = await storage.endShift(id, endingCash || 0);
      if (!shift) {
        return res.status(404).json({ message: "Shift tidak ditemukan" });
      }
      
      const cashier = await storage.getUser(shift.cashierId);
      res.json({ ...shift, cashierName: cashier?.name || "" });
    } catch (error) {
      res.status(500).json({ message: "Gagal mengakhiri shift" });
    }
  });

  // ============ TRANSACTION ROUTES ============
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionsList = await storage.getAllTransactions();
      const users = await storage.getAllUsers();
      
      const transactionsWithDetails = await Promise.all(
        transactionsList.map(async (t) => {
          const cashier = users.find(u => u.id === t.cashierId);
          const items = await storage.getTransactionItems(t.id);
          return { ...t, cashierName: cashier?.name || "", items };
        })
      );
      
      res.json(transactionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data transaksi" });
    }
  });

  app.get("/api/transactions/shift/:shiftId", async (req: Request, res: Response) => {
    try {
      const { shiftId } = req.params;
      const transactionsList = await storage.getTransactionsByShift(shiftId);
      const users = await storage.getAllUsers();
      
      const transactionsWithDetails = await Promise.all(
        transactionsList.map(async (t) => {
          const cashier = users.find(u => u.id === t.cashierId);
          const items = await storage.getTransactionItems(t.id);
          return { ...t, cashierName: cashier?.name || "", items };
        })
      );
      
      res.json(transactionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data transaksi" });
    }
  });

  const createTransactionSchema = z.object({
    shiftId: z.string(),
    cashierId: z.string(),
    customerName: z.string().default(""),
    items: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      price: z.number(),
      quantity: z.number(),
      subtotal: z.number(),
    })),
    subtotal: z.number(),
    tax: z.number().default(0),
    total: z.number(),
    paymentAmount: z.number(),
    change: z.number(),
    paymentMethod: z.enum(["cash", "qris"]),
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const data = createTransactionSchema.parse(req.body);
      const { items, ...transactionData } = data;
      
      // Create transaction
      const transaction = await storage.createTransaction(
        transactionData,
        items.map(item => ({ ...item, transactionId: "" })) // transactionId will be set in storage
      );
      
      // Update product stock
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.updateProductStock(item.productId, product.stock - item.quantity);
        }
      }
      
      const cashier = await storage.getUser(transaction.cashierId);
      const transactionItems = await storage.getTransactionItems(transaction.id);
      
      res.json({ ...transaction, cashierName: cashier?.name || "", items: transactionItems });
    } catch (error) {
      console.error("Transaction error:", error);
      res.status(400).json({ message: "Data transaksi tidak valid" });
    }
  });

  // ============ STOCK ADJUSTMENT ROUTES ============
  app.get("/api/stock-adjustments", async (req: Request, res: Response) => {
    try {
      const adjustmentsList = await storage.getAllStockAdjustments();
      const users = await storage.getAllUsers();
      const productsList = await storage.getAllProducts();
      
      const adjustmentsWithDetails = adjustmentsList.map(a => {
        const adjustedByUser = users.find(u => u.id === a.adjustedBy);
        const product = productsList.find(p => p.id === a.productId);
        return { ...a, adjustedByName: adjustedByUser?.name || "", productName: product?.name || "" };
      });
      
      res.json(adjustmentsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data penyesuaian stok" });
    }
  });

  const createStockAdjustmentSchema = z.object({
    productId: z.string(),
    adjustment: z.number(),
    reason: z.string(),
    adjustedBy: z.string(),
  });

  app.post("/api/stock-adjustments", async (req: Request, res: Response) => {
    try {
      const data = createStockAdjustmentSchema.parse(req.body);
      
      const product = await storage.getProduct(data.productId);
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      
      const previousStock = product.stock;
      const newStock = previousStock + data.adjustment;
      
      if (newStock < 0) {
        return res.status(400).json({ message: "Stok tidak boleh negatif" });
      }
      
      const adjustment = await storage.createStockAdjustment({
        productId: data.productId,
        previousStock,
        newStock,
        adjustment: data.adjustment,
        reason: data.reason,
        adjustedBy: data.adjustedBy,
      });
      
      const adjustedByUser = await storage.getUser(adjustment.adjustedBy);
      res.json({ ...adjustment, adjustedByName: adjustedByUser?.name || "", productName: product.name });
    } catch (error) {
      res.status(400).json({ message: "Data penyesuaian stok tidak valid" });
    }
  });

  // ============ LOANS ROUTES ============
  app.get("/api/loans", async (req: Request, res: Response) => {
    try {
      const allLoans = await storage.getAllLoans();
      res.json(allLoans);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pinjaman" });
    }
  });

  app.get("/api/loans/shift/:shiftId", async (req: Request, res: Response) => {
    try {
      const { shiftId } = req.params;
      const loans = await storage.getLoansByShift(shiftId);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pinjaman" });
    }
  });

  app.post("/api/loans", async (req: Request, res: Response) => {
    try {
      const loanData = insertLoanSchema.parse(req.body);
      const loan = await storage.createLoan(loanData);
      res.json(loan);
    } catch (error) {
      res.status(400).json({ message: "Data pinjaman tidak valid" });
    }
  });

  app.delete("/api/loans/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteLoan(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus pinjaman" });
    }
  });

  // ============ BILLIARD RENTALS ROUTE ============
  app.post("/api/billiard-rentals", async (req: Request, res: Response) => {
    try {
      const { shiftId, tableNumber, hoursRented, hourlyRate, totalPrice } = req.body;
      const rental = await storage.createBilliardRental({
        shiftId,
        tableNumber,
        hoursRented,
        hourlyRate,
        totalPrice,
        endTime: null,
        status: "active"
      });
      res.json(rental);
    } catch (error) {
      res.status(400).json({ message: "Data rental billiard tidak valid" });
    }
  });

  app.get("/api/billiard-rentals/active", async (req: Request, res: Response) => {
    try {
      const rentals = await storage.getActiveBilliardRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data rental aktif" });
    }
  });

  // ============ SEED DATA ROUTE ============
  app.post("/api/seed", async (req: Request, res: Response) => {
    try {
      // Check if users already exist
      const existingUsers = await storage.getAllUsers();
      let isFirstSeed = false;
      
      if (existingUsers.length === 0) {
        isFirstSeed = true;
        // Create default admin
        const admin = await storage.createUser({
          name: "Admin Utama",
          username: "admin",
          password: "admin123",
          role: "admin",
        });

        // Create default cashiers
        const cashier1 = await storage.createUser({
          name: "Kasir Satu",
          username: "kasir1",
          password: "kasir123",
          role: "cashier",
        });

        const cashier2 = await storage.createUser({
          name: "Kasir Dua",
          username: "kasir2",
          password: "kasir123",
          role: "cashier",
        });
      }

      // Get or create categories
      let categories = await storage.getAllCategories();
      let makanan, minuman, snack, rokok, lainnya;
      
      if (categories.length === 0) {
        makanan = await storage.createCategory({ name: "Makanan" });
        minuman = await storage.createCategory({ name: "Minuman" });
        snack = await storage.createCategory({ name: "Snack" });
        rokok = await storage.createCategory({ name: "Rokok" });
        lainnya = await storage.createCategory({ name: "Lainnya" });
      } else {
        makanan = categories.find(c => c.name === "Makanan")!;
        minuman = categories.find(c => c.name === "Minuman")!;
        snack = categories.find(c => c.name === "Snack")!;
        rokok = categories.find(c => c.name === "Rokok")!;
        lainnya = categories.find(c => c.name === "Lainnya")!;
      }

      // Check existing products
      const existingProducts = await storage.getAllProducts();
      
      if (existingProducts.length < 20) {
        const productData = [
          { name: "Nasi Goreng", sku: "MKN001", price: 15000, stock: 50, cat: makanan },
          { name: "Mie Goreng", sku: "MKN002", price: 12000, stock: 45, cat: makanan },
          { name: "Ayam Goreng", sku: "MKN003", price: 18000, stock: 30, cat: makanan },
          { name: "Lumpia", sku: "MKN004", price: 8000, stock: 40, cat: makanan },
          { name: "Soto Ayam", sku: "MKN005", price: 12000, stock: 25, cat: makanan },
          { name: "Es Teh Manis", sku: "MNM001", price: 5000, stock: 100, cat: minuman },
          { name: "Es Jeruk", sku: "MNM002", price: 7000, stock: 80, cat: minuman },
          { name: "Kopi Hitam", sku: "MNM003", price: 8000, stock: 60, cat: minuman },
          { name: "Jus Mangga", sku: "MNM004", price: 10000, stock: 50, cat: minuman },
          { name: "Jus Alpukat", sku: "MNM005", price: 12000, stock: 40, cat: minuman },
          { name: "Chitato", sku: "SNK001", price: 10000, stock: 25, cat: snack },
          { name: "Oreo", sku: "SNK002", price: 8000, stock: 35, cat: snack },
          { name: "Tango", sku: "SNK003", price: 12000, stock: 20, cat: snack },
          { name: "Lays", sku: "SNK004", price: 11000, stock: 30, cat: snack },
          { name: "Pocari Sweat", sku: "SNK005", price: 6000, stock: 45, cat: snack },
          { name: "Gudang Garam", sku: "RKK001", price: 28000, stock: 40, cat: rokok },
          { name: "Sampoerna", sku: "RKK002", price: 32000, stock: 35, cat: rokok },
          { name: "Surya", sku: "RKK003", price: 26000, stock: 30, cat: rokok },
          { name: "Tissue", sku: "LNY001", price: 3000, stock: 5, cat: lainnya },
          { name: "Kertas Tisu 200lbr", sku: "LNY002", price: 15000, stock: 10, cat: lainnya },
        ];
        
        for (const product of productData) {
          const existing = existingProducts.find(p => p.sku === product.sku);
          if (!existing) {
            await storage.createProduct({
              name: product.name,
              sku: product.sku,
              price: product.price,
              stock: product.stock,
              categoryId: product.cat.id
            });
          }
        }
      }

      // Seed billiard products
      const existingBilliard = await storage.getAllProducts();
      if (isFirstSeed || !existingBilliard.some(p => p.sku.startsWith("BLR"))) {
        const billiardCategory = categories.find(c => c.name === "Lainnya") || categories[0];
        for (let i = 1; i <= 10; i++) {
          const billiardSku = `BLR${String(i).padStart(3, '0')}`;
          const existing = existingBilliard.find(p => p.sku === billiardSku);
          if (!existing) {
            await storage.createProduct({
              name: `Billiard Meja ${i} (1 Jam)`,
              sku: billiardSku,
              price: 20000,
              stock: 999,
              categoryId: billiardCategory.id
            });
          }
        }
      }

      res.json({ message: isFirstSeed ? "Data berhasil ditambahkan" : "Produk berhasil ditambahkan", seeded: true });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Gagal menambahkan data awal" });
    }
  });

  return httpServer;
}
