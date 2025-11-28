import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { StatsCard } from "./StatsCard";
import { DollarSign, ShoppingBag, TrendingUp, FileDown, Eye, Calendar, Gamepad2, Coffee } from "lucide-react";
import { Transaction, Shift, Loan } from "@/lib/types";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
import { TrendingDown } from "lucide-react";

interface SalesReportProps {
  transactions: Transaction[];
  shifts: Shift[];
  loans?: Loan[];
}

export function SalesReport({ transactions, shifts, loans = [] }: SalesReportProps) {
  const [period, setPeriod] = useState("today");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("billiard");

  // Calculate expenses stats
  const totalExpenses = loans.reduce((sum, l) => sum + l.amount, 0);
  const expensesByRecipient = loans.reduce((acc, loan) => {
    const existing = acc.find(e => e.recipient === loan.recipientName);
    if (existing) {
      existing.amount += loan.amount;
      existing.count += 1;
    } else {
      acc.push({ recipient: loan.recipientName, amount: loan.amount, count: 1 });
    }
    return acc;
  }, [] as Array<{ recipient: string; amount: number; count: number }>);

  // Separate billiard and cafe transactions
  const isBilliardTransaction = (transaction: Transaction) => {
    return transaction.items.some(item => item.productName && item.productName.includes("Meja"));
  };

  const billiardTransactions = transactions.filter(isBilliardTransaction);
  const cafeTransactions = transactions.filter(t => !isBilliardTransaction(t));

  // Calculate stats for each category
  const calculateStats = (txns: Transaction[]) => {
    const total = txns.reduce((sum, t) => sum + t.total, 0);
    const count = txns.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  };

  const billiardStats = calculateStats(billiardTransactions);
  const cafeStats = calculateStats(cafeTransactions);
  const totalStats = calculateStats(transactions);

  // Mock chart data
  const chartData = [
    { name: "Sen", billiard: 450000, cafe: 800000 },
    { name: "Sel", billiard: 520000, cafe: 930000 },
    { name: "Rab", billiard: 380000, cafe: 720000 },
    { name: "Kam", billiard: 640000, cafe: 1040000 },
    { name: "Jum", billiard: 750000, cafe: 1170000 },
    { name: "Sab", billiard: 920000, cafe: 1180000 },
    { name: "Min", billiard: 680000, cafe: 1170000 },
  ];

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Laporan Penjualan</h1>
          <p className="text-muted-foreground">Analisis dan riwayat penjualan billiard dan cafe</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]" data-testid="select-period">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-full grid-cols-4">
          <TabsTrigger value="billiard" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Billiard
          </TabsTrigger>
          <TabsTrigger value="cafe" className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Cafe
          </TabsTrigger>
          <TabsTrigger value="total">Total</TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        {/* BILLIARD TAB */}
        <TabsContent value="billiard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Penjualan Billiard"
              value={formatCurrency(billiardStats.total)}
              icon={DollarSign}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Transaksi Billiard"
              value={billiardStats.count.toString()}
              icon={ShoppingBag}
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Rata-rata Transaksi"
              value={formatCurrency(billiardStats.average)}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grafik Penjualan Billiard</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`} className="text-xs" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.375rem" }} />
                    <Bar dataKey="billiard" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaksi Billiard</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.375rem" }} />
                    <Line type="monotone" dataKey="billiard" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Transaksi Billiard</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Kasir</TableHead>
                      <TableHead>Meja</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billiardTransactions.map((transaction) => (
                      <TableRow key={transaction.id} data-testid={`billiard-transaction-row-${transaction.id}`}>
                        <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                        <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                        <TableCell>{transaction.cashierName}</TableCell>
                        <TableCell>{transaction.items.map(i => i.productName).join(", ")}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(transaction.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => handleViewDetail(transaction)} data-testid={`button-view-billiard-${transaction.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {billiardTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Tidak ada transaksi billiard
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CAFE TAB */}
        <TabsContent value="cafe" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Penjualan Cafe"
              value={formatCurrency(cafeStats.total)}
              icon={DollarSign}
              trend={{ value: 18, isPositive: true }}
            />
            <StatsCard
              title="Transaksi Cafe"
              value={cafeStats.count.toString()}
              icon={ShoppingBag}
              trend={{ value: 10, isPositive: true }}
            />
            <StatsCard
              title="Rata-rata Transaksi"
              value={formatCurrency(cafeStats.average)}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grafik Penjualan Cafe</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`} className="text-xs" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.375rem" }} />
                    <Bar dataKey="cafe" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaksi Cafe</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.375rem" }} />
                    <Line type="monotone" dataKey="cafe" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Transaksi Cafe</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Kasir</TableHead>
                      <TableHead className="text-center">Item</TableHead>
                      <TableHead>Metode Bayar</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cafeTransactions.map((transaction) => (
                      <TableRow key={transaction.id} data-testid={`cafe-transaction-row-${transaction.id}`}>
                        <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                        <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                        <TableCell>{transaction.cashierName}</TableCell>
                        <TableCell className="text-center">{transaction.items.length}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(transaction.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => handleViewDetail(transaction)} data-testid={`button-view-cafe-${transaction.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {cafeTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Tidak ada transaksi cafe
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOTAL TAB */}
        <TabsContent value="total" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Penjualan"
              value={formatCurrency(totalStats.total)}
              icon={DollarSign}
              trend={{ value: 20, isPositive: true }}
            />
            <StatsCard
              title="Total Transaksi"
              value={totalStats.count.toString()}
              icon={ShoppingBag}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Rata-rata Transaksi"
              value={formatCurrency(totalStats.average)}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grafik Penjualan Gabungan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`} className="text-xs" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.375rem" }} />
                    <Bar dataKey="billiard" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cafe" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Komparasi Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.375rem" }} />
                    <Line type="monotone" dataKey="billiard" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                    <Line type="monotone" dataKey="cafe" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Semua Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Kasir</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-center">Item</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id} data-testid={`total-transaction-row-${transaction.id}`}>
                        <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                        <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                        <TableCell>{transaction.cashierName}</TableCell>
                        <TableCell>
                          <Badge variant={isBilliardTransaction(transaction) ? "default" : "outline"}>
                            {isBilliardTransaction(transaction) ? "Billiard" : "Cafe"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{transaction.items.length}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(transaction.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => handleViewDetail(transaction)} data-testid={`button-view-total-${transaction.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPENSES TAB */}
        <TabsContent value="expenses" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Pengeluaran"
              value={formatCurrency(totalExpenses)}
              icon={TrendingDown}
              trend={{ value: totalExpenses > 0 ? 5 : 0, isPositive: false }}
            />
            <StatsCard
              title="Jumlah Transaksi Pengeluaran"
              value={loans.length.toString()}
              icon={ShoppingBag}
            />
            <StatsCard
              title="Rata-rata Pengeluaran"
              value={formatCurrency(loans.length > 0 ? totalExpenses / loans.length : 0)}
              icon={DollarSign}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pengeluaran Per Penerima</CardTitle>
              </CardHeader>
              <CardContent>
                {expensesByRecipient.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada pengeluaran</div>
                ) : (
                  <div className="space-y-4">
                    {expensesByRecipient.sort((a, b) => b.amount - a.amount).map((expense) => (
                      <div key={expense.recipient} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{expense.recipient}</p>
                          <p className="text-sm text-muted-foreground">{expense.count} transaksi</p>
                        </div>
                        <p className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perbandingan Pengeluaran vs Penjualan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Billiard", sales: billiardStats.total, expenses: totalExpenses },
                    { name: "Cafe", sales: cafeStats.total, expenses: totalExpenses },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`} className="text-xs" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.375rem" }} />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detail Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Tidak ada pengeluaran
                        </TableCell>
                      </TableRow>
                    ) : (
                      loans.map((loan) => (
                        <TableRow key={loan.id} data-testid={`expense-row-${loan.id}`}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(new Date(loan.createdAt))}
                          </TableCell>
                          <TableCell className="font-medium">{loan.description}</TableCell>
                          <TableCell>{loan.recipientName}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(loan.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.id} - {selectedTransaction && formatDateTime(selectedTransaction.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kasir</span>
                  <span>{selectedTransaction.cashierName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipe</span>
                  <Badge variant={isBilliardTransaction(selectedTransaction) ? "default" : "outline"}>
                    {isBilliardTransaction(selectedTransaction) ? "Billiard" : "Cafe"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Metode Pembayaran</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedTransaction.paymentMethod}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pajak</span>
                  <span>{formatCurrency(selectedTransaction.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(selectedTransaction.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dibayar</span>
                  <span>{formatCurrency(selectedTransaction.paymentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kembalian</span>
                  <span>{formatCurrency(selectedTransaction.change)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
