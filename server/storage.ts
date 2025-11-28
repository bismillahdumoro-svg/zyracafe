import {
  users, categories, products, shifts, transactions, transactionItems, stockAdjustments, expenses, loans, billiardTables,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Shift, type InsertShift,
  type Transaction, type InsertTransaction,
  type TransactionItem, type InsertTransactionItem,
  type StockAdjustment, type InsertStockAdjustment,
  type Expense, type InsertExpense,
  type Loan, type InsertLoan,
  type BilliardTable, type InsertBilliardTable
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getCategory(id: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductStock(id: string, stock: number): Promise<Product | undefined>;

  // Shifts
  getShift(id: string): Promise<Shift | undefined>;
  getActiveShiftByCashier(cashierId: string): Promise<Shift | undefined>;
  getAllShifts(): Promise<Shift[]>;
  getActiveShifts(): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, shift: Partial<Shift>): Promise<Shift | undefined>;
  endShift(id: string, endingCash: number): Promise<Shift | undefined>;

  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByShift(shiftId: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction, items: InsertTransactionItem[]): Promise<Transaction>;
  getTransactionItems(transactionId: string): Promise<TransactionItem[]>;

  // Stock Adjustments
  getStockAdjustment(id: string): Promise<StockAdjustment | undefined>;
  getAllStockAdjustments(): Promise<StockAdjustment[]>;
  getStockAdjustmentsByProduct(productId: string): Promise<StockAdjustment[]>;
  createStockAdjustment(adjustment: InsertStockAdjustment): Promise<StockAdjustment>;

  // Expenses
  getExpensesByShift(shiftId: string): Promise<Expense[]>;
  getAllExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<boolean>;

  // Loans
  getLoansByShift(shiftId: string): Promise<Loan[]>;
  getAllLoans(): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  deleteLoan(id: string): Promise<boolean>;

  // Billiard Tables
  getBilliardTable(id: string): Promise<BilliardTable | undefined>;
  getAllBilliardTables(): Promise<BilliardTable[]>;
  getBilliardTableByNumber(tableNumber: string): Promise<BilliardTable | undefined>;
  createBilliardTable(table: InsertBilliardTable): Promise<BilliardTable>;
  updateBilliardTable(id: string, table: Partial<InsertBilliardTable>): Promise<BilliardTable | undefined>;
  deleteBilliardTable(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Categories
  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  async updateProductStock(id: string, stock: number): Promise<Product | undefined> {
    const [product] = await db.update(products).set({ stock }).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  // Shifts
  async getShift(id: string): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift || undefined;
  }

  async getActiveShiftByCashier(cashierId: string): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts)
      .where(and(eq(shifts.cashierId, cashierId), eq(shifts.status, "active")));
    return shift || undefined;
  }

  async getAllShifts(): Promise<Shift[]> {
    return db.select().from(shifts).orderBy(desc(shifts.startTime));
  }

  async getActiveShifts(): Promise<Shift[]> {
    return db.select().from(shifts).where(eq(shifts.status, "active"));
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const [shift] = await db.insert(shifts).values(insertShift).returning();
    return shift;
  }

  async updateShift(id: string, shiftData: Partial<Shift>): Promise<Shift | undefined> {
    const [shift] = await db.update(shifts).set(shiftData).where(eq(shifts.id, id)).returning();
    return shift || undefined;
  }

  async endShift(id: string, endingCash: number): Promise<Shift | undefined> {
    const [shift] = await db.update(shifts)
      .set({ endTime: new Date(), endingCash, status: "closed" })
      .where(eq(shifts.id, id))
      .returning();
    return shift || undefined;
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionsByShift(shiftId: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(eq(transactions.shiftId, shiftId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(and(gte(transactions.createdAt, startDate), lte(transactions.createdAt, endDate)))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction, items: InsertTransactionItem[]): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    
    if (items.length > 0) {
      const itemsWithTransactionId = items.map(item => ({
        ...item,
        transactionId: transaction.id
      }));
      await db.insert(transactionItems).values(itemsWithTransactionId);
    }

    // Update shift totals
    await db.update(shifts)
      .set({
        totalSales: sql`${shifts.totalSales} + ${insertTransaction.total}`,
        totalTransactions: sql`${shifts.totalTransactions} + 1`
      })
      .where(eq(shifts.id, insertTransaction.shiftId));

    return transaction;
  }

  async getTransactionItems(transactionId: string): Promise<TransactionItem[]> {
    return db.select().from(transactionItems).where(eq(transactionItems.transactionId, transactionId));
  }

  // Stock Adjustments
  async getStockAdjustment(id: string): Promise<StockAdjustment | undefined> {
    const [adjustment] = await db.select().from(stockAdjustments).where(eq(stockAdjustments.id, id));
    return adjustment || undefined;
  }

  async getAllStockAdjustments(): Promise<StockAdjustment[]> {
    return db.select().from(stockAdjustments).orderBy(desc(stockAdjustments.createdAt));
  }

  async getStockAdjustmentsByProduct(productId: string): Promise<StockAdjustment[]> {
    return db.select().from(stockAdjustments)
      .where(eq(stockAdjustments.productId, productId))
      .orderBy(desc(stockAdjustments.createdAt));
  }

  async createStockAdjustment(insertAdjustment: InsertStockAdjustment): Promise<StockAdjustment> {
    const [adjustment] = await db.insert(stockAdjustments).values(insertAdjustment).returning();
    
    // Update product stock
    await db.update(products)
      .set({ stock: insertAdjustment.newStock })
      .where(eq(products.id, insertAdjustment.productId));

    return adjustment;
  }

  // Expenses
  async getExpensesByShift(shiftId: string): Promise<Expense[]> {
    return db.select().from(expenses)
      .where(eq(expenses.shiftId, shiftId))
      .orderBy(desc(expenses.createdAt));
  }

  async getAllExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.createdAt));
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(insertExpense).returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    await db.delete(expenses).where(eq(expenses.id, id));
    return true;
  }

  // Loans
  async getLoansByShift(shiftId: string): Promise<Loan[]> {
    return db.select().from(loans)
      .where(eq(loans.shiftId, shiftId))
      .orderBy(desc(loans.createdAt));
  }

  async getAllLoans(): Promise<Loan[]> {
    return db.select().from(loans).orderBy(desc(loans.createdAt));
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const [loan] = await db.insert(loans).values(insertLoan).returning();
    return loan;
  }

  async deleteLoan(id: string): Promise<boolean> {
    await db.delete(loans).where(eq(loans.id, id));
    return true;
  }

  // Billiard Tables
  async getBilliardTable(id: string): Promise<BilliardTable | undefined> {
    const [table] = await db.select().from(billiardTables).where(eq(billiardTables.id, id));
    return table || undefined;
  }

  async getAllBilliardTables(): Promise<BilliardTable[]> {
    return db.select().from(billiardTables).orderBy(billiardTables.tableNumber);
  }

  async getBilliardTableByNumber(tableNumber: string): Promise<BilliardTable | undefined> {
    const [table] = await db.select().from(billiardTables).where(eq(billiardTables.tableNumber, tableNumber));
    return table || undefined;
  }

  async createBilliardTable(insertTable: InsertBilliardTable): Promise<BilliardTable> {
    const [table] = await db.insert(billiardTables).values(insertTable).returning();
    return table;
  }

  async updateBilliardTable(id: string, tableData: Partial<InsertBilliardTable>): Promise<BilliardTable | undefined> {
    const [table] = await db.update(billiardTables).set(tableData).where(eq(billiardTables.id, id)).returning();
    return table || undefined;
  }

  async deleteBilliardTable(id: string): Promise<boolean> {
    await db.delete(billiardTables).where(eq(billiardTables.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
