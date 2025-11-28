import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shift } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer, DollarSign } from "lucide-react";

interface ShiftCloseReportProps {
  shift: Shift | null;
  summary: {
    totalIncome: number;
    billiardIncome: number;
    billiardTransactions: number;
    cafeIncome: number;
    cafeTransactions: number;
    totalTransactions: number;
  } | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ShiftCloseReport({ shift, summary, open, onConfirm, onCancel }: ShiftCloseReportProps) {
  if (!shift || !summary) return null;

  const calculateDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Rekap Shift - {shift.cashierName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Info */}
          <Card className="bg-slate-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Waktu Mulai</p>
                  <p className="font-semibold">{formatDateTime(shift.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durasi</p>
                  <p className="font-semibold">{calculateDuration(shift.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kas Awal</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(shift.startingCash)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Transaksi</p>
                  <p className="font-semibold">{summary.totalTransactions} transaksi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billiard Income */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <DollarSign className="h-5 w-5" />
                Pendapatan Sewa Billiard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                  <p className="text-3xl font-bold text-green-700">{formatCurrency(summary.billiardIncome)}</p>
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  {summary.billiardTransactions} transaksi
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cafe Income */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                <DollarSign className="h-5 w-5" />
                Pendapatan Cafe/Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                  <p className="text-3xl font-bold text-orange-700">{formatCurrency(summary.cafeIncome)}</p>
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  {summary.cafeTransactions} transaksi
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">TOTAL PENDAPATAN HARI INI</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(summary.totalIncome)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">
                    {Math.round((summary.billiardIncome / summary.totalIncome) * 100) || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Dari Billiard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Perbandingan Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Billiard</span>
                    <span className="text-sm font-semibold">
                      {Math.round((summary.billiardIncome / summary.totalIncome) * 100) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(summary.billiardIncome / summary.totalIncome) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Cafe/Produk</span>
                    <span className="text-sm font-semibold">
                      {Math.round((summary.cafeIncome / summary.totalIncome) * 100) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(summary.cafeIncome / summary.totalIncome) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Kembali
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            Setujui & Tutup Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
