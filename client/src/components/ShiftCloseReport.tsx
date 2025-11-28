import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shift } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer, Share2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface ShiftCloseReportProps {
  shift: Shift | null;
  summary: {
    totalIncome: number;
    billiardIncome: number;
    billiardTransactions: number;
    cafeIncome: number;
    cafeTransactions: number;
    totalTransactions: number;
    expenses: Array<{ description: string; amount: number; recipientName: string }>;
    totalExpenses: number;
    finalTotal: number;
  } | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ShiftCloseReport({ shift, summary, open, onConfirm, onCancel }: ShiftCloseReportProps) {
  const [shareMethod, setShareMethod] = useState<"whatsapp" | "print">("print");

  if (!shift || !summary) return null;

  const calculateDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  };

  const generateReport = () => {
    const report = `
REKAP SHIFT KASIR
════════════════════════════
Nama Kasir: ${shift.cashierName}
Waktu Mulai: ${formatDateTime(shift.startTime)}
Durasi: ${calculateDuration(shift.startTime)}

📊 PENJUALAN
────────────────────────────
💚 Sewa Billiard:
   ${formatCurrency(summary.billiardIncome)} (${summary.billiardTransactions} transaksi)

🧡 Cafe/Produk:
   ${formatCurrency(summary.cafeIncome)} (${summary.cafeTransactions} transaksi)

💰 TOTAL PENJUALAN:
   ${formatCurrency(summary.totalIncome)}

${summary.totalExpenses > 0 ? `
🔴 PENGELUARAN
────────────────────────────
${summary.expenses.map(e => `${e.description} (${e.recipientName}): ${formatCurrency(e.amount)}`).join("\n")}

💸 TOTAL PENGELUARAN:
   ${formatCurrency(summary.totalExpenses)}
` : ""}

✅ TOTAL AKHIR (Pendapatan - Pengeluaran):
════════════════════════════
${formatCurrency(summary.finalTotal)}
════════════════════════════
    `;
    return report;
  };

  const handleWhatsAppShare = () => {
    const report = generateReport();
    const encoded = encodeURIComponent(report);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📋 REKAP SHIFT - {shift.cashierName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Header Info */}
          <Card className="bg-blue-50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Waktu Mulai</p>
                  <p className="font-semibold text-sm">{formatDateTime(shift.startTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Durasi</p>
                  <p className="font-semibold text-sm">{calculateDuration(shift.startTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billiard Income */}
          <Card className="border-green-300 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-green-700">
                <TrendingUp className="h-4 w-4" />
                💚 Penjualan Sewa Billiard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.billiardIncome)}</p>
              <p className="text-xs text-muted-foreground">{summary.billiardTransactions} transaksi</p>
            </CardContent>
          </Card>

          {/* Cafe Income */}
          <Card className="border-orange-300 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                <TrendingUp className="h-4 w-4" />
                🧡 Penjualan Cafe/Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(summary.cafeIncome)}</p>
              <p className="text-xs text-muted-foreground">{summary.cafeTransactions} transaksi</p>
            </CardContent>
          </Card>

          {/* Total Income */}
          <Card className="border-blue-400 bg-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                <DollarSign className="h-4 w-4" />
                📊 Total Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">{formatCurrency(summary.totalIncome)}</p>
            </CardContent>
          </Card>

          {/* Expenses */}
          {summary.totalExpenses > 0 && (
            <>
              <Card className="border-red-300 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-red-700">
                    <TrendingDown className="h-4 w-4" />
                    🔴 Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {summary.expenses.map((exp, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {exp.description} ({exp.recipientName})
                      </span>
                      <span className="font-semibold text-red-700">{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold text-red-700">
                    <span>Total Pengeluaran:</span>
                    <span>{formatCurrency(summary.totalExpenses)}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Final Total */}
          <Card className="border-4 border-green-500 bg-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-green-800">✅ TOTAL AKHIR (Pendapatan - Pengeluaran)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-800">{formatCurrency(summary.finalTotal)}</p>
              <p className="text-xs text-green-700 mt-1">
                {summary.totalIncome > 0 ? `Billiard: ${Math.round((summary.billiardIncome / summary.totalIncome) * 100)}% | Cafe: ${Math.round((summary.cafeIncome / summary.totalIncome) * 100)}%` : ""}
              </p>
            </CardContent>
          </Card>

          {/* Share Method */}
          <div className="flex gap-2 p-3 bg-gray-50 rounded-md">
            <Button
              size="sm"
              variant={shareMethod === "whatsapp" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setShareMethod("whatsapp")}
            >
              <Share2 className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant={shareMethod === "print" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setShareMethod("print")}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {shareMethod === "whatsapp" ? (
            <Button onClick={handleWhatsAppShare} className="flex-1 bg-green-600 hover:bg-green-700">
              <Share2 className="h-4 w-4 mr-2" />
              Kirim ke WhatsApp
            </Button>
          ) : (
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
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
