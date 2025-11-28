import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { BilliardTable } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface BilliardManagementProps {
  billiardTables: BilliardTable[];
  onAddTable: (data: { tableNumber: string; hourlyRate: number }) => void;
  onUpdateTable: (id: string, data: { tableNumber: string; hourlyRate: number }) => void;
  onDeleteTable: (id: string) => void;
}

export function BilliardManagement({
  billiardTables,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
}: BilliardManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ tableNumber: "", hourlyRate: "" });
  const [activeRentals, setActiveRentals] = useState<any[]>([]);

  const handleAdd = () => {
    if (form.tableNumber && form.hourlyRate) {
      onAddTable({
        tableNumber: form.tableNumber,
        hourlyRate: parseInt(form.hourlyRate),
      });
      setForm({ tableNumber: "", hourlyRate: "" });
      setShowAddDialog(false);
    }
  };

  const handleEdit = (table: BilliardTable) => {
    setEditingId(table.id);
    setForm({ tableNumber: table.tableNumber, hourlyRate: table.hourlyRate.toString() });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingId && form.tableNumber && form.hourlyRate) {
      onUpdateTable(editingId, {
        tableNumber: form.tableNumber,
        hourlyRate: parseInt(form.hourlyRate),
      });
      setForm({ tableNumber: "", hourlyRate: "" });
      setEditingId(null);
      setShowEditDialog(false);
    }
  };

  // Load active rentals from localStorage
  useEffect(() => {
    const loadActiveRentals = () => {
      try {
        const saved = localStorage.getItem("billiardRentals");
        if (saved) {
          setActiveRentals(JSON.parse(saved));
        }
      } catch {
        setActiveRentals([]);
      }
    };

    loadActiveRentals();
    const interval = setInterval(loadActiveRentals, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (startTime: string, hoursRented: number) => {
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const totalSeconds = hoursRented * 3600;
    const remaining = Math.max(0, totalSeconds - elapsed);

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Billiard</h1>
          <p className="text-muted-foreground mt-1">Kelola meja billiard dan pantau sewa aktif</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="lg" data-testid="button-add-billiard-table">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Meja
        </Button>
      </div>

      {/* Sewa Aktif Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sewa Billiard Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRentals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tidak ada sewa billiard aktif saat ini</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meja #</TableHead>
                    <TableHead>Jam Rental</TableHead>
                    <TableHead>Total Harga</TableHead>
                    <TableHead>Mulai</TableHead>
                    <TableHead>Sisa Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRentals.map((rental) => (
                    <TableRow key={rental.id} data-testid={`active-rental-${rental.id}`}>
                      <TableCell className="font-medium">Meja #{rental.tableNumber}</TableCell>
                      <TableCell>{rental.hoursRented} jam</TableCell>
                      <TableCell>{formatCurrency(rental.totalPrice)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(new Date(rental.startTime))}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
                          {getRemainingTime(rental.startTime, rental.hoursRented)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Meja Billiard</CardTitle>
        </CardHeader>
        <CardContent>
          {billiardTables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tidak ada meja billiard</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Meja</TableHead>
                    <TableHead>Harga per Jam</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billiardTables.map((table) => (
                    <TableRow key={table.id} data-testid={`billiard-table-row-${table.id}`}>
                      <TableCell className="font-medium" data-testid={`text-table-number-${table.id}`}>
                        Meja #{table.tableNumber}
                      </TableCell>
                      <TableCell data-testid={`text-hourly-rate-${table.id}`}>
                        {formatCurrency(table.hourlyRate)}/jam
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{table.status === "available" ? "Tersedia" : "Terpakai"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(table)}
                            data-testid={`button-edit-table-${table.id}`}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => onDeleteTable(table.id)}
                            data-testid={`button-delete-table-${table.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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
            <DialogTitle>Tambah Meja Billiard Baru</DialogTitle>
            <DialogDescription>Masukkan informasi meja billiard baru</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nomor Meja</label>
              <Input
                placeholder="Cth: 1, 2, 3..."
                value={form.tableNumber}
                onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                data-testid="input-add-table-number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Harga per Jam (Rp)</label>
              <Input
                type="number"
                placeholder="50000"
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                data-testid="input-add-hourly-rate"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAdd} data-testid="button-save-add-table">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meja Billiard</DialogTitle>
            <DialogDescription>Perbarui informasi meja billiard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nomor Meja</label>
              <Input
                placeholder="Cth: 1, 2, 3..."
                value={form.tableNumber}
                onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                data-testid="input-edit-table-number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Harga per Jam (Rp)</label>
              <Input
                type="number"
                placeholder="50000"
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                data-testid="input-edit-hourly-rate"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} data-testid="button-save-edit-table">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
