import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Clock, Eye, LogOut } from "lucide-react";
import { Shift, Transaction } from "@/lib/types";
import { formatCurrency, formatDateTime, formatTime } from "@/lib/utils";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { ShiftCloseReport } from "./ShiftCloseReport";
import { useToast } from "@/hooks/use-toast";

interface ShiftManagementProps {
  shifts: Shift[];
  transactions: Transaction[];
  onViewShiftDetails: (shiftId: string) => void;
  onShiftEnded?: () => void;
}

interface ShiftSummary {
  totalIncome: number;
  billiardIncome: number;
  billiardTransactions: number;
  cafeIncome: number;
  cafeTransactions: number;
  totalTransactions: number;
  expenses: Array<{ description: string; amount: number; recipientName: string }>;
  totalExpenses: number;
  finalTotal: number;
}

export function ShiftManagement({
  shifts,
  transactions,
  onViewShiftDetails,
  onShiftEnded,
}: ShiftManagementProps) {
  const { toast } = useToast();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [closingShiftId, setClosingShiftId] = useState<string | null>(null);

  const activeShifts = shifts.filter((s) => s.status === "active");
  const closedShifts = shifts.filter((s) => s.status === "closed");

  const handleViewDetails = (shift: Shift) => {
    setSelectedShift(shift);
    setShowDetailsDialog(true);
    onViewShiftDetails(shift.id);
  };

  const getShiftTransactions = (shiftId: string) => {
    return transactions.filter((t) => t.shiftId === shiftId);
  };

  const calculateDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  };

  const handleEndShift = async (shift: Shift) => {
    try {
      setClosingShiftId(shift.id);
      const response = await apiRequest("GET", `/api/shifts/${shift.id}/summary`);
      const data = await response.json();
      setSelectedShift(data.shift);
      setShiftSummary(data.summary);
      setShowReportDialog(true);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat summary shift", variant: "destructive" });
    }
  };

  const handleConfirmCloseShift = async () => {
    if (!closingShiftId) return;
    try {
      await apiRequest("PUT", `/api/shifts/${closingShiftId}/end`, { endingCash: 0 });
      setShowReportDialog(false);
      setClosingShiftId(null);
      setShiftSummary(null);
      toast({ title: "Shift ditutup", description: "Shift berhasil ditutup" });
      onShiftEnded?.();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menutup shift", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manajemen Shift</h1>
        <p className="text-muted-foreground">Pantau dan kelola shift kasir</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active-shifts">
            Shift Aktif
            {activeShifts.length > 0 && (
              <Badge variant="default" className="ml-2">{activeShifts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-shift-history">Riwayat Shift</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeShifts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Tidak ada shift aktif saat ini</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeShifts.map((shift) => (
                <Card key={shift.id} data-testid={`active-shift-card-${shift.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{shift.cashierName}</CardTitle>
                      <Badge>Aktif</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mulai</span>
                        <span>{formatDateTime(shift.startTime)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Durasi</span>
                        <span>{calculateDuration(shift.startTime)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Kas Awal</span>
                        <span>{formatCurrency(shift.startingCash)}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Penjualan</span>
                        <span className="font-semibold text-primary">{formatCurrency(shift.totalSales)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaksi</span>
                        <span>{shift.totalTransactions}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(shift)}
                        data-testid={`button-view-shift-${shift.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat Detail
                      </Button>
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleEndShift(shift)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Akhiri Shift
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Shift</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kasir</TableHead>
                      <TableHead>Mulai</TableHead>
                      <TableHead>Selesai</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead className="text-right">Kas Awal</TableHead>
                      <TableHead className="text-right">Total Penjualan</TableHead>
                      <TableHead className="text-center">Transaksi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closedShifts.map((shift) => (
                      <TableRow key={shift.id} data-testid={`shift-history-row-${shift.id}`}>
                        <TableCell className="font-medium">{shift.cashierName}</TableCell>
                        <TableCell>{formatDateTime(shift.startTime)}</TableCell>
                        <TableCell>{shift.endTime ? formatDateTime(shift.endTime) : "-"}</TableCell>
                        <TableCell>{calculateDuration(shift.startTime, shift.endTime)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(shift.startingCash)}</TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(shift.totalSales)}
                        </TableCell>
                        <TableCell className="text-center">{shift.totalTransactions}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleViewDetails(shift)}
                            data-testid={`button-view-history-${shift.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {closedShifts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Belum ada riwayat shift
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Shift</DialogTitle>
            <DialogDescription>
              {selectedShift?.cashierName} - {selectedShift && formatDateTime(selectedShift.startTime)}
            </DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 p-4 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">Kas Awal</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedShift.startingCash)}</p>
                </div>
                <div className="space-y-2 p-4 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">Total Penjualan</p>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(selectedShift.totalSales)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Transaksi dalam Shift</h4>
                <ScrollArea className="max-h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getShiftTransactions(selectedShift.id).map((trx) => (
                        <TableRow key={trx.id}>
                          <TableCell className="font-mono text-sm">{trx.id}</TableCell>
                          <TableCell>{formatTime(trx.createdAt)}</TableCell>
                          <TableCell>{trx.items.length} item</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{trx.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(trx.total)}</TableCell>
                        </TableRow>
                      ))}
                      {getShiftTransactions(selectedShift.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            Belum ada transaksi
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Close Report Dialog */}
      <ShiftCloseReport
        shift={selectedShift}
        summary={shiftSummary}
        open={showReportDialog}
        onConfirm={handleConfirmCloseShift}
        onCancel={() => {
          setShowReportDialog(false);
          setClosingShiftId(null);
          setShiftSummary(null);
        }}
      />
    </div>
  );
}
