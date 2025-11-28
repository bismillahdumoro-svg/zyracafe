import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Search, History, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Product, StockAdjustment } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface StockManagementProps {
  products: Product[];
  adjustments: StockAdjustment[];
  onAdjustStock: (productId: string, adjustment: number, reason: string) => void;
}

export function StockManagement({
  products,
  adjustments,
  onAdjustStock,
}: StockManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const filteredProducts = products
    .filter((product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.stock - b.stock);

  const handleAdjust = (product: Product, type: "add" | "subtract") => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentAmount("");
    setAdjustmentReason("");
    setShowAdjustDialog(true);
  };

  const handleConfirmAdjust = () => {
    if (selectedProduct && adjustmentAmount) {
      const amount = adjustmentType === "add" ? Number(adjustmentAmount) : -Number(adjustmentAmount);
      onAdjustStock(selectedProduct.id, amount, adjustmentReason);
      setShowAdjustDialog(false);
    }
  };

  const lowStockProducts = products
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock);

  // Calculate stock additions in last 30 days
  const last30DaysInfo = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const additionsLast30Days = adjustments
      .filter((adj) => adj.adjustment > 0 && new Date(adj.createdAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const totalUnitsAdded = additionsLast30Days.reduce((sum, adj) => sum + adj.adjustment, 0);
    
    // Calculate value based on product price
    const totalValueAdded = additionsLast30Days.reduce((sum, adj) => {
      const product = products.find(p => p.id === adj.productId);
      return sum + (adj.adjustment * (product?.price || 0));
    }, 0);
    
    // Group by product for top additions
    const productAdditions = new Map<string, { productName: string; units: number; value: number }>();
    additionsLast30Days.forEach((adj) => {
      const product = products.find(p => p.id === adj.productId);
      if (!product) return;
      
      const key = adj.productId;
      const existing = productAdditions.get(key) || { productName: product.name, units: 0, value: 0 };
      existing.units += adj.adjustment;
      existing.value += adj.adjustment * product.price;
      productAdditions.set(key, existing);
    });
    
    const topAdditions = Array.from(productAdditions.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    const daysInPeriod = 30;
    const avgPerDay = totalUnitsAdded / daysInPeriod;
    
    return {
      totalUnitsAdded,
      totalValueAdded,
      avgPerDay: avgPerDay.toFixed(1),
      additionsCount: additionsLast30Days.length,
      topAdditions,
    };
  }, [adjustments, products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manajemen Stok</h1>
        <p className="text-muted-foreground">Kelola dan pantau stok produk</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products" data-testid="tab-products">Daftar Produk</TabsTrigger>
          <TabsTrigger value="low-stock" data-testid="tab-low-stock">
            Stok Rendah
            {lowStockProducts.length > 0 && (
              <Badge variant="destructive" className="ml-2">{lowStockProducts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="info" data-testid="tab-info">Informasi Penambahan</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-stock"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">Stok Saat Ini</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`stock-row-${product.id}`}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-lg font-semibold">{product.stock}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.stock === 0 ? "destructive" : product.stock <= 10 ? "secondary" : "outline"}
                          >
                            {product.stock === 0 ? "Habis" : product.stock <= 10 ? "Rendah" : "Tersedia"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjust(product, "add")}
                              data-testid={`button-add-stock-${product.id}`}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Tambah
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjust(product, "subtract")}
                              disabled={product.stock === 0}
                              data-testid={`button-subtract-stock-${product.id}`}
                            >
                              <Minus className="h-4 w-4 mr-1" />
                              Kurangi
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produk dengan Stok Rendah</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-center">Stok</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>{product.categoryName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleAdjust(product, "add")}
                            data-testid={`button-restock-${product.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Restok
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {lowStockProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Semua stok dalam kondisi aman
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Informasi Penambahan Stok (30 Hari Terakhir)</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Unit Ditambahkan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{last30DaysInfo.totalUnitsAdded}</div>
                    <p className="text-xs text-muted-foreground mt-1">unit dalam 30 hari</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Nilai Penambahan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(last30DaysInfo.totalValueAdded)}</div>
                    <p className="text-xs text-muted-foreground mt-1">investasi stok</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Per Hari</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{last30DaysInfo.avgPerDay}</div>
                    <p className="text-xs text-muted-foreground mt-1">unit/hari</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{last30DaysInfo.additionsCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">penambahan stok</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products Added */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Produk Dengan Penambahan Terbanyak
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-center">Unit Ditambahkan</TableHead>
                          <TableHead className="text-right">Total Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {last30DaysInfo.topAdditions.length > 0 ? (
                          last30DaysInfo.topAdditions.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{item.units}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(item.value)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              Belum ada penambahan stok dalam 30 hari terakhir
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Riwayat Perubahan Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-center">Perubahan</TableHead>
                      <TableHead className="text-center">Sebelum</TableHead>
                      <TableHead className="text-center">Sesudah</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Oleh</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adj) => (
                      <TableRow key={adj.id} data-testid={`adjustment-row-${adj.id}`}>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(adj.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">{adj.productName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={adj.adjustment > 0 ? "default" : "destructive"}>
                            {adj.adjustment > 0 ? `+${adj.adjustment}` : adj.adjustment}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{adj.previousStock}</TableCell>
                        <TableCell className="text-center">{adj.newStock}</TableCell>
                        <TableCell>{adj.reason}</TableCell>
                        <TableCell>{adj.adjustedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === "add" ? "Tambah Stok" : "Kurangi Stok"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} - Stok saat ini: {selectedProduct?.stock}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={adjustmentType === "subtract" ? selectedProduct?.stock : undefined}
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="Masukkan jumlah"
                data-testid="input-adjustment-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan</Label>
              <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                <SelectTrigger data-testid="select-adjustment-reason">
                  <SelectValue placeholder="Pilih alasan" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentType === "add" ? (
                    <>
                      <SelectItem value="Restok dari supplier">Restok dari supplier</SelectItem>
                      <SelectItem value="Koreksi stok">Koreksi stok</SelectItem>
                      <SelectItem value="Return pelanggan">Return pelanggan</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Produk rusak/kadaluarsa">Produk rusak/kadaluarsa</SelectItem>
                      <SelectItem value="Koreksi stok">Koreksi stok</SelectItem>
                      <SelectItem value="Penyesuaian inventaris">Penyesuaian inventaris</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleConfirmAdjust}
              disabled={!adjustmentAmount || !adjustmentReason}
              data-testid="button-confirm-adjustment"
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
