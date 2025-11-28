import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { Loan } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface ExpenseManagementProps {
  loans: Loan[];
  onAddLoan: (loanData: { shiftId: string; description: string; amount: number; recipientName: string }) => void;
  onDeleteLoan: (loanId: string) => void;
  currentShiftId: string | null;
}

export function ExpenseManagement({
  loans,
  onAddLoan,
  onDeleteLoan,
  currentShiftId,
}: ExpenseManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", recipientName: "" });

  const shiftLoans = loans.filter((l) => l.shiftId === currentShiftId);
  const totalAmount = shiftLoans.reduce((sum, l) => sum + l.amount, 0);

  const handleAdd = () => {
    if (form.description && form.amount && form.recipientName && currentShiftId) {
      onAddLoan({
        shiftId: currentShiftId,
        description: form.description,
        amount: parseInt(form.amount),
        recipientName: form.recipientName,
      });
      setForm({ description: "", amount: "", recipientName: "" });
      setShowAddDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengeluaran</h1>
          <p className="text-muted-foreground mt-1">Kelola pengeluaran shift (cashbon karyawan, dll)</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="lg" data-testid="button-add-loan">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengeluaran
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{shiftLoans.length} transaksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(shiftLoans.length > 0 ? totalAmount / shiftLoans.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per transaksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shift Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentShiftId ? "Aktif" : "Belum Dimulai"}</div>
            <p className="text-xs text-muted-foreground mt-1">Status</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengeluaran Shift Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {shiftLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tidak ada pengeluaran</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Penerima</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftLoans.map((loan) => (
                    <TableRow key={loan.id} data-testid={`loan-row-${loan.id}`}>
                      <TableCell data-testid={`text-description-${loan.id}`}>{loan.description}</TableCell>
                      <TableCell data-testid={`text-recipient-${loan.id}`}>{loan.recipientName}</TableCell>
                      <TableCell data-testid={`text-amount-${loan.id}`} className="font-medium">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(new Date(loan.createdAt))}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => onDeleteLoan(loan.id)}
                          data-testid={`button-delete-loan-${loan.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengeluaran</DialogTitle>
            <DialogDescription>Catat pengeluaran seperti cashbon karyawan atau biaya operasional</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Deskripsi Pengeluaran</label>
              <Input
                placeholder="Cth: Cashbon, Biaya operasional..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                data-testid="input-description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nama Penerima</label>
              <Input
                placeholder="Nama karyawan atau vendor"
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                data-testid="input-recipient"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Jumlah (Rp)</label>
              <Input
                type="number"
                placeholder="100000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                data-testid="input-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAdd} data-testid="button-save-loan">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
