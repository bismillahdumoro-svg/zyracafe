import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Product, Transaction, TransactionItem, StockAdjustment } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useMemo } from "react";
import { TrendingUp, AlertTriangle, Plus } from "lucide-react";

interface InventoryValuationReportProps {
  products: Product[];
  transactions?: Transaction[];
  transactionItems?: TransactionItem[];
  stockAdjustments?: StockAdjustment[];
}

export function InventoryValuationReport({ products, transactions = [], transactionItems = [], stockAdjustments = [] }: InventoryValuationReportProps) {
  // Hitung valuasi stok (exclude produk billiard/sewa dan minuman)
  const inventory = useMemo(() => {
    return products
      .filter((product) => {
        // Exclude billiard rentals
        if (product.sku.startsWith("BLR")) return false;
        
        // Exclude specific items: meja billiard, esbatu, esteh, kopi cangkir
        const excludeItems = ["MEJA", "esbatu", "esteh", "kopi cangkir"];
        const productNameLower = product.name.toLowerCase();
        
        for (const item of excludeItems) {
          if (productNameLower.includes(item.toLowerCase())) {
            return false;
          }
        }
        
        return true;
      })
      .map((product) => ({
        ...product,
        valuasi: product.stock * product.price,
      }))
      .sort((a, b) => b.valuasi - a.valuasi);
  }, [products]);

  const totalValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.valuasi, 0);
  }, [inventory]);

  const totalStockUnits = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.stock, 0);
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.stock < 5).length;
  }, [inventory]);

  const outOfStockItems = useMemo(() => {
    return inventory.filter((item) => item.stock === 0).length;
  }, [inventory]);

  // Hitung barang yang terjual dan revenue (dari transactions)
  const salesMetrics = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
    const totalSubtotal = transactions.reduce((sum, tx) => sum + tx.subtotal, 0);
    
    return { 
      totalTransactions,
      totalRevenue,
      totalSubtotal
    };
  }, [transactions]);

  // Hitung selisih (discrepancy) antara biaya dan revenue
  const discrepancy = useMemo(() => {
    // Expected cost of items sold (dari subtotal)
    const expectedCostOfSoldItems = transactions.reduce((sum, tx) => sum + tx.subtotal, 0);
    
    // Actual revenue from transactions
    const actualRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
    
    const difference = actualRevenue - expectedCostOfSoldItems;
    
    return {
      expectedCost: expectedCostOfSoldItems,
      actualRevenue,
      difference,
      percentDiff: expectedCostOfSoldItems > 0 ? ((difference / expectedCostOfSoldItems) * 100).toFixed(1) : 0,
    };
  }, [transactions]);

  // Hitung penambahan stok terakhir
  const recentStockAdditions = useMemo(() => {
    const additions = stockAdjustments
      .filter((adj) => adj.adjustment > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    const totalUnitsAdded = additions.reduce((sum, adj) => sum + adj.adjustment, 0);
    const lastAddition = additions[0];
    
    return { additions, totalUnitsAdded, lastAddition };
  }, [stockAdjustments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Valuasi Inventori</h1>
        <p className="text-muted-foreground mt-1">Laporan nilai stok barang di gudang</p>
      </div>

      {/* Summary Cards - Stok Saat Ini */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Stok Saat Ini di Gudang</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Barang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStockUnits}</div>
              <p className="text-xs text-muted-foreground mt-1">Total unit semua barang</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Nilai Stok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Nilai jual semua barang</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status Stok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outOfStockItems} habis, {lowStockItems} terbatas</div>
              <p className="text-xs text-muted-foreground mt-1">Perlu segera reorder</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Cards - Penjualan */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Data Penjualan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesMetrics.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">Total penjualan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Biaya Barang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesMetrics.totalSubtotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">Nilai barang terjual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Uang Didapat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(salesMetrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total dari semua transaksi</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discrepancy Alert */}
      {Math.abs(parseFloat(discrepancy.percentDiff as string)) > 5 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ Ada Selisih Besar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-yellow-900 dark:text-yellow-100">
              <p>
                <strong>Perkiraan Nilai Barang Terjual:</strong> {formatCurrency(discrepancy.expectedCost)}
              </p>
              <p>
                <strong>Total Uang Masuk:</strong> {formatCurrency(discrepancy.actualRevenue)}
              </p>
              <p className={parseFloat(discrepancy.percentDiff as string) > 0 ? "text-green-700 dark:text-green-300 font-semibold" : "text-red-700 dark:text-red-300 font-semibold"}>
                <strong>Selisih:</strong> {formatCurrency(discrepancy.difference)} ({discrepancy.percentDiff}%)
              </p>
              {parseFloat(discrepancy.percentDiff as string) < 0 && (
                <p className="pt-2">⚠️ Ada kemungkinan barang hilang atau rusak</p>
              )}
              {parseFloat(discrepancy.percentDiff as string) > 0 && (
                <p className="pt-2">✓ Penjualan melebihi biaya barang (margin bagus)</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Additions Info */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Informasi Penambahan Stok</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentStockAdditions.lastAddition ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-700">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <Plus className="h-5 w-5" />
                  Penambahan Stok Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-green-900 dark:text-green-100">
                <p>
                  <strong>Barang:</strong> {recentStockAdditions.lastAddition.reason}
                </p>
                <p>
                  <strong>Jumlah:</strong> +{recentStockAdditions.lastAddition.adjustment} unit
                </p>
                <p>
                  <strong>Waktu:</strong> {formatDateTime(new Date(recentStockAdditions.lastAddition.createdAt))}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-600 dark:text-gray-400">Penambahan Stok Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Belum ada penambahan stok</p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Penambahan (5 Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{recentStockAdditions.totalUnitsAdded}</div>
              <p className="text-xs text-muted-foreground mt-1">{recentStockAdditions.additions.length} transaksi penambahan</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Additions Table */}
      {recentStockAdditions.additions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Penambahan Stok (5 Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah Unit</TableHead>
                    <TableHead className="text-right">Stok Awal</TableHead>
                    <TableHead className="text-right">Stok Akhir</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStockAdditions.additions.map((adj) => (
                    <TableRow key={adj.id} data-testid={`stock-addition-${adj.id}`}>
                      <TableCell className="font-medium">{adj.reason}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">+{adj.adjustment}</TableCell>
                      <TableCell className="text-right">{adj.previousStock}</TableCell>
                      <TableCell className="text-right font-medium">{adj.newStock}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(new Date(adj.createdAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Barang (Terurut Nilai Tertinggi)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stok (Unit)</TableHead>
                  <TableHead className="text-right">Harga/Unit</TableHead>
                  <TableHead className="text-right">Total Valuasi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id} data-testid={`inventory-row-${item.id}`}>
                    <TableCell className="font-medium" data-testid={`text-product-name-${item.id}`}>
                      {item.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span data-testid={`text-stock-${item.id}`}>{item.stock}</span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span data-testid={`text-valuasi-${item.id}`}>{formatCurrency(item.valuasi)}</span>
                    </TableCell>
                    <TableCell>
                      {item.stock === 0 ? (
                        <Badge variant="destructive">Habis</Badge>
                      ) : item.stock < 5 ? (
                        <Badge variant="secondary">Terbatas</Badge>
                      ) : (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ringkasan Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Item SKU</p>
              <p className="text-xl font-bold">{inventory.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Unit Stok</p>
              <p className="text-xl font-bold">{inventory.reduce((sum, i) => sum + i.stock, 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nilai Rata-rata per Item</p>
              <p className="text-xl font-bold">{formatCurrency(Math.round(totalValue / inventory.length))}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Item dengan Nilai &gt; Rp 1 Juta</p>
              <p className="text-xl font-bold">{inventory.filter(i => i.valuasi >= 1000000).length}</p>
            </div>
          </div>
          <div className="border-t pt-3 mt-3">
            <p className="text-sm text-muted-foreground mb-2">💡 Tips Manajemen Stok:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Barang dengan nilai tinggi harus dimonitor ketat</li>
              <li>• Segera reorder barang dengan stok &lt; 5 unit</li>
              <li>• Periksa fisik untuk barang yang sering habis tiba-tiba</li>
              <li>• Bandingkan valuasi stok dengan catatan fisik gudang setiap minggu</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
