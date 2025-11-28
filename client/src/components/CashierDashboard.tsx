import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, LogOut, Clock, CheckCircle, DollarSign, ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ShoppingCart } from "./ShoppingCart";
import { ThemeToggle } from "./ThemeToggle";
import { StatsCard } from "./StatsCard";
import { Product, CartItem, Category, Shift, Transaction, Loan, BilliardRental } from "@/lib/types";
import { formatCurrency, formatTime, formatDateTime } from "@/lib/utils";
import { Trash2, Plus, X } from "lucide-react";

interface BilliardRentalLocal {
  id: string;
  tableNumber: string;
  hoursRented: number;
  hourlyRate: number;
  totalPrice: number;
  startTime: Date;
  remainingSeconds: number;
}

interface CashierDashboardProps {
  products: Product[];
  categories: Category[];
  currentShift: Shift | null;
  cashierName: string;
  transactions: Transaction[];
  loans: Loan[];
  onLogout: () => void;
  onStartShift: (startingCash: number) => void;
  onEndShift: () => void;
  onCheckout: (items: CartItem[], paymentAmount: number, paymentMethod: "cash" | "card" | "qris", customerName: string) => void;
  onAddLoan: (loanData: { shiftId: string; description: string; amount: number; recipientName: string }) => void;
  onDeleteLoan: (loanId: string) => void;
  isViewOnlyMode?: boolean;
}

export function CashierDashboard({
  products,
  categories,
  currentShift,
  cashierName,
  transactions,
  loans,
  onLogout,
  onStartShift,
  onEndShift,
  onCheckout,
  onAddLoan,
  onDeleteLoan,
  isViewOnlyMode = false,
}: CashierDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showStartShiftDialog, setShowStartShiftDialog] = useState(false);
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [startingCash, setStartingCash] = useState("500000");
  const [activeTab, setActiveTab] = useState("products");
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [loanForm, setLoanForm] = useState({ description: "", amount: "", recipientName: "" });
  // Load billiard rentals from localStorage (persists across shift changes)
  const [billiardRentals, setBilliardRentals] = useState<BilliardRentalLocal[]>(() => {
    try {
      const saved = localStorage.getItem("billiardRentals");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastTransaction, setLastTransaction] = useState<{
    total: number;
    paymentAmount: number;
    change: number;
  } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Save billiard rentals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("billiardRentals", JSON.stringify(billiardRentals));
  }, [billiardRentals]);

  // Countdown timer untuk billiard rentals (tidak reset pada pergantian shift)
  useEffect(() => {
    const interval = setInterval(() => {
      setBilliardRentals((prev) =>
        prev
          .map((rental) => ({
            ...rental,
            remainingSeconds: rental.remainingSeconds - 1,
          }))
          .filter((rental) => rental.remainingSeconds > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show transactions from last 24 hours (for cashier audit)
  const shiftTransactions = useMemo(() => {
    if (!transactions) return [];
    // Already filtered in App.tsx to show only last 24 hours
    return transactions;
  }, [transactions]);

  const shiftSales = useMemo(() => {
    return shiftTransactions.reduce((sum, t) => sum + t.total, 0);
  }, [shiftTransactions]);

  const averageTransaction = useMemo(() => {
    return shiftTransactions.length > 0 ? shiftSales / shiftTransactions.length : 0;
  }, [shiftTransactions, shiftSales]);

  const totalLoans = useMemo(() => {
    return loans.reduce((sum, l) => sum + l.amount, 0);
  }, [loans]);

  const netSales = useMemo(() => {
    return shiftSales - totalLoans;
  }, [shiftSales, totalLoans]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    // Sort billiard products first when in "all" category
    if (selectedCategory === "all") {
      return filtered.sort((a, b) => {
        const aIsBilliard = a.sku.startsWith("BLR") ? 0 : 1;
        const bIsBilliard = b.sku.startsWith("BLR") ? 0 : 1;
        return aIsBilliard - bIsBilliard;
      });
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = (paymentAmount: number, paymentMethod: "cash" | "card" | "qris", customerName: string) => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setLastTransaction({
      total,
      paymentAmount,
      change: paymentAmount - total,
    });
    
    // Auto-create billiard rentals from billiard products in cart
    const billiardMap = new Map<string, { hours: number; hourlyRate: number; totalPrice: number }>();
    
    cart.forEach((item) => {
      if (item.product.name.toUpperCase().includes("MEJA")) {
        const tableNumber = item.product.name.split("MEJA ")[1]?.split(" ")[0] || item.product.name;
        const hoursPerUnit = 1;
        const totalHours = hoursPerUnit * item.quantity;
        
        if (billiardMap.has(tableNumber)) {
          const existing = billiardMap.get(tableNumber)!;
          billiardMap.set(tableNumber, {
            hours: existing.hours + totalHours,
            hourlyRate: item.product.price,
            totalPrice: existing.totalPrice + item.product.price * item.quantity,
          });
        } else {
          billiardMap.set(tableNumber, {
            hours: totalHours,
            hourlyRate: item.product.price,
            totalPrice: item.product.price * item.quantity,
          });
        }
      }
    });
    
    // Create one rental per table with accumulated hours
    billiardMap.forEach((data, tableNumber) => {
      const totalSeconds = data.hours * 3600;
      setBilliardRentals((prev) => [
        ...prev,
        {
          id: `${tableNumber}-${Date.now()}`,
          tableNumber,
          hoursRented: data.hours,
          hourlyRate: data.hourlyRate,
          totalPrice: data.totalPrice,
          startTime: new Date(),
          remainingSeconds: totalSeconds,
        },
      ]);
      
      // Save to database
      if (currentShift?.id) {
        fetch('/api/billiard-rentals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shiftId: currentShift.id,
            tableNumber,
            hoursRented: data.hours,
            hourlyRate: data.hourlyRate,
            totalPrice: data.totalPrice,
            endTime: null,
            status: 'active'
          })
        }).catch(console.error);
      }
    });
    
    onCheckout(cart, paymentAmount, paymentMethod, customerName);
    setCart([]);
    setShowSuccessDialog(true);
  };

  const handleStartShift = () => {
    onStartShift(Number(startingCash));
    setShowStartShiftDialog(false);
  };

  const handleEndShift = () => {
    onEndShift();
    setShowEndShiftDialog(false);
  };

  if (!currentShift && !isViewOnlyMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="font-semibold text-lg">POS App</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={onLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Mulai Shift</h2>
            <p className="text-muted-foreground max-w-md">
              Selamat datang, {cashierName}. Silakan mulai shift untuk memulai transaksi penjualan.
            </p>
            <Button size="lg" onClick={() => setShowStartShiftDialog(true)} data-testid="button-start-shift">
              Mulai Shift Sekarang
            </Button>
          </div>
        </div>

        <Dialog open={showStartShiftDialog} onOpenChange={setShowStartShiftDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mulai Shift Baru</DialogTitle>
              <DialogDescription>
                Masukkan jumlah kas awal untuk memulai shift.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kas Awal</label>
                <Input
                  type="number"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  className="text-lg"
                  data-testid="input-starting-cash"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStartShiftDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleStartShift} data-testid="button-confirm-start-shift">
                Mulai Shift
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">POS App</h1>
          {!isViewOnlyMode && currentShift && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Shift sejak {formatTime(currentShift.startTime)}
            </Badge>
          )}
          {isViewOnlyMode && (
            <Badge variant="secondary">Mode Lihat Saja</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">{cashierName}</span>
          <ThemeToggle />
          {!isViewOnlyMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEndShiftDialog(true)}
                data-testid="button-end-shift"
              >
                Akhiri Shift
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          {isViewOnlyMode && (
            <Button variant="outline" size="sm" onClick={onLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex flex-col min-w-0 ${isViewOnlyMode ? "w-full" : "lg:w-[60%]"}`}>
          <div className="flex-1 flex flex-col overflow-hidden">
            {!isViewOnlyMode ? (
              <div className="w-full justify-start border-b rounded-none bg-background flex gap-2 px-2 py-1 overflow-x-auto">
                <Button
                  variant={activeTab === "products" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("products")}
                  data-testid="tab-products"
                >
                  Produk
                </Button>
                <Button
                  variant={activeTab === "billiard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("billiard")}
                  data-testid="tab-billiard"
                >
                  Sewa Billiard ({billiardRentals.length})
                </Button>
                <Button
                  variant={activeTab === "expenses" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("expenses")}
                  data-testid="tab-expenses"
                >
                  Uang Keluar ({loans.length})
                </Button>
                <Button
                  variant={activeTab === "history" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("history")}
                  data-testid="tab-history"
                >
                  History Penjualan
                </Button>
                <Button
                  variant={activeTab === "report" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("report")}
                  data-testid="tab-report"
                >
                  Laporan Penjualan
                </Button>
              </div>
            ) : (
              <div className="w-full justify-start border-b rounded-none bg-background flex gap-2 px-2 py-1 overflow-x-auto">
                <Button
                  variant={activeTab === "history" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("history")}
                  data-testid="tab-history"
                >
                  History Penjualan
                </Button>
                <Button
                  variant={activeTab === "report" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("report")}
                  data-testid="tab-report"
                >
                  Laporan Penjualan
                </Button>
              </div>
            )}

            {activeTab === "products" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-3 py-2 space-y-2 border-b bg-background flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Cari produk atau SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9"
                      data-testid="input-search-product"
                    />
                  </div>
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="w-full justify-start overflow-x-auto bg-muted">
                      <TabsTrigger value="all" data-testid="tab-category-all">Semua</TabsTrigger>
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          data-testid={`tab-category-${category.id}`}
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "16px",
                    padding: "16px",
                    height: "100%",
                    overflowY: "auto",
                    overflowX: "hidden",
                    alignContent: "start"
                  }}
                >
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      Tidak ada produk ditemukan
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-3 flex-shrink-0 border-b bg-background">
                  <Button
                    size="sm"
                    onClick={() => setShowLoanDialog(true)}
                    className="w-full"
                    data-testid="button-add-expense"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Catat Pengeluaran
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {loans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Belum ada pengeluaran
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loans.map((loan) => (
                        <Card key={loan.id} data-testid={`expense-card-${loan.id}`} className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{loan.recipientName}</h4>
                                <p className="text-xs text-muted-foreground">{loan.description}</p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                                onClick={() => onDeleteLoan(loan.id)}
                                data-testid={`button-delete-expense-${loan.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t">
                              <span className="text-xs text-muted-foreground">{formatDateTime(loan.createdAt)}</span>
                              <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(loan.amount)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "billiard" && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-3">
                  {billiardRentals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Tidak ada sewa billiard aktif
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {billiardRentals.map((rental) => {
                        const hours = Math.floor(rental.remainingSeconds / 3600);
                        const minutes = Math.floor((rental.remainingSeconds % 3600) / 60);
                        const seconds = rental.remainingSeconds % 60;
                        return (
                          <Card key={rental.id} data-testid={`billiard-rental-${rental.id}`} className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-3 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-lg">Meja #{rental.tableNumber}</h4>
                                  <p className="text-xs text-muted-foreground">{formatCurrency(rental.totalPrice)} • {rental.hoursRented} jam</p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setBilliardRentals((prev) => prev.filter((r) => r.id !== rental.id))} data-testid={`button-close-rental-${rental.id}`}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-3 rounded text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                                  {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Sisa waktu</div>
                              </div>
                              <div className="text-xs text-muted-foreground text-center">Mulai: {formatDateTime(new Date(rental.startTime))}</div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  {shiftTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Belum ada transaksi
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Table className="text-xs">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs px-2 py-1">Tanggal</TableHead>
                            <TableHead className="text-xs px-2 py-1">Kasir</TableHead>
                            <TableHead className="text-xs px-2 py-1">Nama Pemesan</TableHead>
                            <TableHead className="text-right text-xs px-2 py-1 cursor-pointer">Pembayaran</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shiftTransactions.map((trx) => (
                            <TableRow 
                              key={trx.id} 
                              data-testid={`shift-transaction-row-${trx.id}`} 
                              className="hover:bg-muted/50 cursor-pointer"
                              onClick={() => {
                                setSelectedTransaction(trx);
                                setShowDetailDialog(true);
                              }}
                            >
                              <TableCell className="text-xs px-2 py-1" data-testid={`text-transaction-date-${trx.id}`}>
                                {new Date(trx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-xs px-2 py-1" data-testid={`text-cashier-name-${trx.id}`}>
                                {(trx as any).cashierName || '-'}
                              </TableCell>
                              <TableCell className="text-xs px-2 py-1" data-testid={`text-customer-name-${trx.id}`}>
                                {trx.customerName || '-'}
                              </TableCell>
                              <TableCell className="text-right text-xs font-semibold px-2 py-1" data-testid={`text-payment-${trx.id}`}>
                                {formatCurrency(trx.paymentAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "report" && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Card className="p-2">
                      <div className="text-xs text-muted-foreground">Total Penjualan</div>
                      <div className="text-sm font-bold text-primary">{formatCurrency(shiftSales)}</div>
                    </Card>
                    <Card className="p-2">
                      <div className="text-xs text-muted-foreground">Transaksi</div>
                      <div className="text-sm font-bold">{shiftTransactions.length}</div>
                    </Card>
                    <Card className="p-2">
                      <div className="text-xs text-muted-foreground">Rata-rata</div>
                      <div className="text-sm font-bold">{formatCurrency(averageTransaction)}</div>
                    </Card>
                  </div>

                  {currentShift && (
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Ringkasan Shift</CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 py-2 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Jam Mulai</span>
                          <span className="font-medium">{formatDateTime(new Date(currentShift.startTime))}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Kas Awal</span>
                          <span className="font-medium">{formatCurrency(currentShift.startingCash)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t text-xs">
                          <span className="font-semibold">Total Penjualan</span>
                          <span className="font-semibold text-primary">{formatCurrency(shiftSales)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-red-600 dark:text-red-400">Uang Keluar</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(totalLoans)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t bg-green-50 dark:bg-green-950 -mx-3 px-3 py-2 rounded text-xs">
                          <span className="font-bold text-green-700 dark:text-green-300">Net Penjualan</span>
                          <span className="font-bold text-green-700 dark:text-green-300">{formatCurrency(netSales)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold">Jumlah Transaksi</span>
                          <span className="font-semibold">{shiftTransactions.length}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isViewOnlyMode && (
          <div className="w-full lg:w-[40%] lg:max-w-md border-l hidden lg:block">
            <ShoppingCart
              items={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
              onClear={() => setCart([])}
            />
          </div>
        )}
      </div>

      {!isViewOnlyMode && (
        <div className="lg:hidden border-t p-4 bg-card">
          <Button
            className="w-full"
            disabled={cart.length === 0}
            data-testid="button-open-cart-mobile"
          >
            Lihat Keranjang ({cart.length} item)
          </Button>
        </div>
      )}


      <Dialog open={showEndShiftDialog && !!currentShift} onOpenChange={setShowEndShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akhiri Shift</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengakhiri shift ini?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kas Awal</span>
              <span className="font-medium">{formatCurrency(currentShift?.startingCash || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Penjualan</span>
              <span className="font-medium">{formatCurrency(currentShift?.totalSales || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Transaksi</span>
              <span className="font-medium">{currentShift?.totalTransactions || 0}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndShiftDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleEndShift} data-testid="button-confirm-end-shift">
              Akhiri Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Transaksi Berhasil
            </DialogTitle>
          </DialogHeader>
          {lastTransaction && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatCurrency(lastTransaction.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibayar</span>
                <span className="font-medium">{formatCurrency(lastTransaction.paymentAmount)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Kembalian</span>
                <span className="font-semibold text-primary">{formatCurrency(lastTransaction.change)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full" data-testid="button-close-success">
              Transaksi Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.customerName && `Nama Pemesan: ${selectedTransaction.customerName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs px-2 py-1">Produk</TableHead>
                    <TableHead className="text-center text-xs px-2 py-1">Qty</TableHead>
                    <TableHead className="text-right text-xs px-2 py-1">Harga</TableHead>
                    <TableHead className="text-right text-xs px-2 py-1">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTransaction.items.map((item) => (
                    <TableRow key={item.productId} data-testid={`detail-item-${item.productId}`}>
                      <TableCell className="text-xs px-2 py-1">{item.productName}</TableCell>
                      <TableCell className="text-center text-xs px-2 py-1">{item.quantity}</TableCell>
                      <TableCell className="text-right text-xs px-2 py-1">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold px-2 py-1">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-2 border-t pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pajak</span>
                  <span>{formatCurrency(selectedTransaction.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-sm border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(selectedTransaction.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pembayaran</span>
                  <span>{formatCurrency(selectedTransaction.paymentAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-green-600 dark:text-green-400">
                  <span>Kembalian</span>
                  <span>{formatCurrency(selectedTransaction.change)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)} className="w-full">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Uang Keluar</DialogTitle>
            <DialogDescription>
              Catat pengeluaran atau pinjaman uang dari kasir
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Penerima</label>
              <Input
                value={loanForm.recipientName}
                onChange={(e) => setLoanForm({ ...loanForm, recipientName: e.target.value })}
                placeholder="Nama karyawan atau keperluan"
                data-testid="input-loan-recipient"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Input
                value={loanForm.description}
                onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
                placeholder="Alasan pengeluaran"
                data-testid="input-loan-description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah</label>
              <Input
                type="number"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                placeholder="Masukkan jumlah"
                data-testid="input-loan-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoanDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (loanForm.recipientName && loanForm.description && loanForm.amount && currentShift) {
                  onAddLoan({
                    shiftId: currentShift.id,
                    description: loanForm.description,
                    amount: Number(loanForm.amount),
                    recipientName: loanForm.recipientName,
                  });
                  setLoanForm({ description: "", amount: "", recipientName: "" });
                  setShowLoanDialog(false);
                }
              }}
              data-testid="button-save-loan"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
