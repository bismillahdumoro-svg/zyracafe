import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { LoginPage } from "@/components/LoginPage";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminDashboard } from "@/components/AdminDashboard";
import { CashierDashboard } from "@/components/CashierDashboard";
import { ProductManagement } from "@/components/ProductManagement";
import { StockManagement } from "@/components/StockManagement";
import { ShiftManagement } from "@/components/ShiftManagement";
import { SalesReport } from "@/components/SalesReport";
import { UserManagement } from "@/components/UserManagement";
import { ExpenseManagement } from "@/components/ExpenseManagement";
import { BilliardManagement } from "@/components/BilliardManagement";
import { InventoryValuationReport } from "@/components/InventoryValuationReport";
import { User, UserRole, Product, Shift, Transaction, StockAdjustment, CartItem, Category, Loan, BilliardRental } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { saveSession, loadSession, clearSession, updateSessionShift } from "@/lib/session";
import NotFound from "@/pages/not-found";

function AppContent() {
  // Lazy init: restore session IMMEDIATELY dari localStorage, bukan dalam useEffect
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = loadSession();
    return stored?.user || null;
  });
  
  const [currentShift, setCurrentShift] = useState<Shift | null>(() => {
    const stored = loadSession();
    return stored?.shift || null;
  });
  
  const { toast } = useToast();

  // Update queries saat session di-restore
  useEffect(() => {
    if (currentUser) {
      console.log("[App] Session loaded untuk", currentUser.username);
    }
  }, [currentUser]);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!currentUser,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!currentUser,
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
    enabled: !!currentUser,
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!currentUser,
  });

  const { data: stockAdjustments = [] } = useQuery<StockAdjustment[]>({
    queryKey: ["/api/stock-adjustments"],
    enabled: !!currentUser,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!currentUser,
  });

  const { data: loans = [] } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
    enabled: !!currentUser,
  });

  const { data: billiardRentals = [] } = useQuery<BilliardRental[]>({
    queryKey: ["/api/billiard-rentals/active"],
    enabled: !!currentUser,
    refetchInterval: 5000,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentUser(data.user);
      const shift = data.activeShift ? {
        ...data.activeShift,
        startTime: new Date(data.activeShift.startTime),
        endTime: data.activeShift.endTime ? new Date(data.activeShift.endTime) : undefined,
      } : null;
      if (shift) {
        setCurrentShift(shift);
      }
      // Save session ke localStorage untuk persist across minimize/lock
      saveSession(data.user, shift || null);
      queryClient.invalidateQueries();
      toast({ title: "Berhasil masuk", description: `Selamat datang, ${data.user.name}!` });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal masuk", description: error.message, variant: "destructive" });
    },
  });

  const handleLogin = (username: string, password: string, _role: UserRole) => {
    loginMutation.mutate({ username, password });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentShift(null);
    clearSession(); // Clear session dari localStorage
    queryClient.clear();
    toast({ title: "Berhasil keluar" });
  };

  const startShiftMutation = useMutation({
    mutationFn: async (startingCash: number) => {
      const res = await apiRequest("POST", "/api/shifts", {
        cashierId: currentUser?.id,
        startingCash,
        status: "active",
      });
      return res.json();
    },
    onSuccess: (data) => {
      const shift = {
        ...data,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      };
      setCurrentShift(shift);
      // Update shift di session localStorage
      if (currentUser) {
        updateSessionShift(shift);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({ title: "Shift dimulai", description: "Selamat bekerja!" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal memulai shift", description: error.message, variant: "destructive" });
    },
  });

  const handleStartShift = (startingCash: number) => {
    startShiftMutation.mutate(startingCash);
  };

  const endShiftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/shifts/${currentShift?.id}/end`, {
        endingCash: (currentShift?.startingCash || 0) + (currentShift?.totalSales || 0),
      });
      return res.json();
    },
    onSuccess: () => {
      setCurrentShift(null);
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({ title: "Shift selesai", description: "Terima kasih!" });
      // Logout automatically after shift ends
      setTimeout(() => {
        handleLogout();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({ title: "Gagal mengakhiri shift", description: error.message, variant: "destructive" });
    },
  });

  const handleEndShift = () => {
    endShiftMutation.mutate();
  };

  const checkoutMutation = useMutation({
    mutationFn: async ({ items, paymentAmount, paymentMethod, customerName }: {
      items: CartItem[];
      paymentAmount: number;
      paymentMethod: "cash" | "qris";
      customerName: string;
    }) => {
      const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const res = await apiRequest("POST", "/api/transactions", {
        shiftId: currentShift?.id,
        cashierId: currentUser?.id,
        customerName,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
        subtotal,
        tax: 0,
        total: subtotal,
        paymentAmount,
        change: paymentAmount - subtotal,
        paymentMethod,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (currentShift) {
        setCurrentShift({
          ...currentShift,
          totalSales: currentShift.totalSales + data.total,
          totalTransactions: currentShift.totalTransactions + 1,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal memproses transaksi", description: error.message, variant: "destructive" });
    },
  });

  const handleCheckout = (items: CartItem[], paymentAmount: number, paymentMethod: "cash" | "qris", customerName: string) => {
    checkoutMutation.mutate({ items, paymentAmount, paymentMethod, customerName });
  };

  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<Product, "id">) => {
      const res = await apiRequest("POST", "/api/products", product);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Produk ditambahkan", description: data.name });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menambahkan produk", description: error.message, variant: "destructive" });
    },
  });

  const handleAddProduct = (product: Omit<Product, "id">) => {
    addProductMutation.mutate(product);
  };

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Produk diperbarui" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal memperbarui produk", description: error.message, variant: "destructive" });
    },
  });

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    updateProductMutation.mutate({ id, updates });
  };

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Produk dihapus" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menghapus produk", description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/categories", { name });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategori ditambahkan", description: data.name });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menambahkan kategori", description: error.message, variant: "destructive" });
    },
  });

  const handleAddCategory = (name: string) => {
    addCategoryMutation.mutate(name);
  };

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Kategori dihapus" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menghapus kategori", description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  const adjustStockMutation = useMutation({
    mutationFn: async ({ productId, adjustment, reason }: { productId: string; adjustment: number; reason: string }) => {
      const res = await apiRequest("POST", "/api/stock-adjustments", {
        productId,
        adjustment,
        reason,
        adjustedBy: currentUser?.id,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock-adjustments"] });
      toast({ title: "Stok diperbarui", description: `${data.productName}: ${data.adjustment > 0 ? "+" : ""}${data.adjustment}` });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal memperbarui stok", description: error.message, variant: "destructive" });
    },
  });

  const handleAdjustStock = (productId: string, adjustment: number, reason: string) => {
    adjustStockMutation.mutate({ productId, adjustment, reason });
  };

  const addUserMutation = useMutation({
    mutationFn: async (user: Omit<User, "id"> & { password: string }) => {
      const res = await apiRequest("POST", "/api/users", user);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Pengguna ditambahkan", description: data.name });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menambahkan pengguna", description: error.message, variant: "destructive" });
    },
  });

  const handleAddUser = (user: Omit<User, "id"> & { password?: string }) => {
    addUserMutation.mutate({ ...user, password: user.password || "password123" });
  };

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Pengguna diperbarui" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal memperbarui pengguna", description: error.message, variant: "destructive" });
    },
  });

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    updateUserMutation.mutate({ id, updates });
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Pengguna dihapus" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menghapus pengguna", description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteUser = (id: string) => {
    deleteUserMutation.mutate(id);
  };

  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, oldPassword, newPassword }: { id: string; oldPassword: string; newPassword: string }) => {
      const res = await apiRequest("PUT", `/api/users/${id}/change-password`, { oldPassword, newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password berhasil diubah" });
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const handleChangePassword = async (id: string, oldPassword: string, newPassword: string) => {
    return new Promise((resolve, reject) => {
      changePasswordMutation.mutate(
        { id, oldPassword, newPassword },
        {
          onSuccess: () => resolve(undefined),
          onError: (error: Error) => reject(error),
        }
      );
    });
  };

  const addLoanMutation = useMutation({
    mutationFn: async (loanData: { shiftId: string; description: string; amount: number; recipientName: string }) => {
      const res = await apiRequest("POST", "/api/loans", loanData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({ title: "Pinjaman dicatat" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menyimpan pinjaman", description: error.message, variant: "destructive" });
    },
  });

  const handleAddLoan = (loanData: { shiftId: string; description: string; amount: number; recipientName: string }) => {
    addLoanMutation.mutate(loanData);
  };

  const deleteLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      await apiRequest("DELETE", `/api/loans/${loanId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({ title: "Pinjaman dihapus" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menghapus pinjaman", description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteLoan = (loanId: string) => {
    deleteLoanMutation.mutate(loanId);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === "cashier") {
    const shiftLoans = currentShift ? loans.filter(l => l.shiftId === currentShift.id) : [];
    
    // Filter transactions: last 24 hours based on shop opening time (7 AM)
    // Shop opens at 7 AM and closes next day at 7 AM
    const OPENING_HOUR = 7;
    const now = new Date();
    
    // Calculate the last opening time (7 AM)
    const todayOpeningTime = new Date(now);
    todayOpeningTime.setHours(OPENING_HOUR, 0, 0, 0);
    
    // If current time is before 7 AM, the opening time was yesterday
    const lastOpeningTime = now < todayOpeningTime 
      ? new Date(todayOpeningTime.getTime() - 24 * 60 * 60 * 1000)
      : todayOpeningTime;
    
    const cashierTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= lastOpeningTime;
    }).map(t => ({
      ...t,
      createdAt: new Date(t.createdAt),
    }));
    
    return (
      <CashierDashboard
        products={products}
        categories={categories}
        currentShift={currentShift}
        cashierName={currentUser.name}
        transactions={cashierTransactions}
        loans={shiftLoans.map(l => ({
          ...l,
          createdAt: new Date(l.createdAt),
        }))}
        onLogout={handleLogout}
        onStartShift={handleStartShift}
        onEndShift={handleEndShift}
        onCheckout={handleCheckout}
        onAddLoan={(loanData) => {
          apiRequest("POST", "/api/loans", loanData).then(() => {
            queryClient.refetchQueries({ queryKey: ["/api/loans"] });
            toast({ title: "Pinjaman dicatat" });
          }).catch((error) => {
            toast({ title: "Gagal menyimpan pinjaman", description: error.message, variant: "destructive" });
          });
        }}
        onDeleteLoan={(loanId) => {
          apiRequest("DELETE", `/api/loans/${loanId}`).then(() => {
            queryClient.refetchQueries({ queryKey: ["/api/loans"] });
            toast({ title: "Pinjaman dihapus" });
          }).catch((error) => {
            toast({ title: "Gagal menghapus pinjaman", description: error.message, variant: "destructive" });
          });
        }}
      />
    );
  }

  const lowStockProducts = products.filter((p) => p.stock <= 10);
  const activeShifts = shifts.filter((s) => s.status === "active").map(s => ({
    ...s,
    startTime: new Date(s.startTime),
    endTime: s.endTime ? new Date(s.endTime) : undefined,
  }));
  const todayTransactions = transactions.filter((t) => {
    const today = new Date();
    const transactionDate = new Date(t.createdAt);
    return transactionDate.toDateString() === today.toDateString();
  }).map(t => ({ ...t, createdAt: new Date(t.createdAt) }));
  const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);

  const formattedTransactions = transactions.map(t => ({
    ...t,
    createdAt: new Date(t.createdAt),
  }));

  const formattedShifts = shifts.map(s => ({
    ...s,
    startTime: new Date(s.startTime),
    endTime: s.endTime ? new Date(s.endTime) : undefined,
  }));

  const formattedAdjustments = stockAdjustments.map(a => ({
    ...a,
    createdAt: new Date(a.createdAt),
  }));

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar userName={currentUser.name} onLogout={handleLogout} />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/admin">
                <AdminDashboard
                  todaySales={todaySales}
                  todayTransactions={todayTransactions.length}
                  totalProducts={products.length}
                  lowStockProducts={lowStockProducts}
                  recentTransactions={formattedTransactions.slice(0, 10)}
                  activeShifts={activeShifts}
                />
              </Route>
              <Route path="/admin/products">
                <ProductManagement
                  products={products}
                  categories={categories}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              </Route>
              <Route path="/admin/stock">
                <StockManagement
                  products={products}
                  adjustments={formattedAdjustments}
                  onAdjustStock={handleAdjustStock}
                />
              </Route>
              <Route path="/admin/inventory-valuation">
                <InventoryValuationReport 
                  products={products}
                  transactions={transactions}
                  transactionItems={[]}
                  stockAdjustments={stockAdjustments}
                />
              </Route>
              <Route path="/admin/billiard">
                <BilliardManagement
                  billiardTables={[]}
                  onAddTable={() => {}}
                  onUpdateTable={() => {}}
                  onDeleteTable={() => {}}
                  activeRentals={billiardRentals}
                />
              </Route>
              <Route path="/admin/shifts">
                <ShiftManagement
                  shifts={formattedShifts}
                  transactions={formattedTransactions}
                  onViewShiftDetails={(id) => console.log("View shift:", id)}
                />
              </Route>
              <Route path="/admin/reports">
                <SalesReport transactions={formattedTransactions} shifts={formattedShifts} loans={loans} />
              </Route>
              <Route path="/admin/expenses">
                <ExpenseManagement
                  loans={loans}
                  onAddLoan={handleAddLoan}
                  onDeleteLoan={handleDeleteLoan}
                  currentShiftId={currentUser?.role === "cashier" ? currentShift?.id || null : 
                    shifts.find(s => s.status === "active")?.id || null}
                />
              </Route>
              <Route path="/admin/cashier-portal">
                <CashierDashboard
                  products={products}
                  categories={categories}
                  currentShift={null}
                  cashierName="Portal Kasir"
                  transactions={formattedTransactions}
                  loans={loans}
                  onLogout={handleLogout}
                  onStartShift={() => {}}
                  onEndShift={() => {}}
                  onCheckout={() => {}}
                  onAddLoan={() => {}}
                  onDeleteLoan={() => {}}
                  isViewOnlyMode={true}
                />
              </Route>
              <Route path="/admin/users">
                <UserManagement
                  users={users}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onChangePassword={handleChangePassword}
                />
              </Route>
              <Route path="/">
                <Redirect to="/admin" />
              </Route>
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <OfflineIndicator />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
