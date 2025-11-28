import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsCard } from "./StatsCard";
import { DollarSign, ShoppingBag, Package, AlertTriangle, Plus, ArrowRight } from "lucide-react";
import { Product, Transaction, Shift } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Link } from "wouter";

interface AdminDashboardProps {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockProducts: Product[];
  recentTransactions: Transaction[];
  activeShifts: Shift[];
}

export function AdminDashboard({
  todaySales,
  todayTransactions,
  totalProducts,
  lowStockProducts,
  recentTransactions,
  activeShifts,
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan data penjualan hari ini</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Penjualan Hari Ini"
          value={formatCurrency(todaySales)}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Transaksi"
          value={todayTransactions.toString()}
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Produk"
          value={totalProducts.toString()}
          icon={Package}
        />
        <StatsCard
          title="Stok Rendah"
          value={lowStockProducts.length.toString()}
          subtitle="Perlu restok"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">Shift Aktif</CardTitle>
            <Link href="/admin/shifts">
              <Button variant="ghost" size="sm" data-testid="link-view-shifts">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeShifts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada shift aktif
              </p>
            ) : (
              <div className="space-y-3">
                {activeShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    data-testid={`shift-item-${shift.id}`}
                  >
                    <div>
                      <p className="font-medium">{shift.cashierName}</p>
                      <p className="text-sm text-muted-foreground">
                        Mulai: {formatDateTime(shift.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{formatCurrency(shift.totalSales)}</p>
                      <p className="text-sm text-muted-foreground">{shift.totalTransactions} transaksi</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">Stok Rendah</CardTitle>
            <Link href="/admin/stock">
              <Button variant="ghost" size="sm" data-testid="link-view-stock">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Semua stok aman
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    data-testid={`low-stock-item-${product.id}`}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                    <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                      {product.stock === 0 ? "Habis" : `${product.stock} tersisa`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
          <Link href="/admin/reports">
            <Button variant="ghost" size="sm" data-testid="link-view-reports">
              Lihat Semua
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                    <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                    <TableCell>{transaction.cashierName}</TableCell>
                    <TableCell>{transaction.items.length} item</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaction.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(transaction.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
