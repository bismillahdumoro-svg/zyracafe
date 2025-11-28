import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart as CartIcon, CreditCard, Smartphone, Banknote } from "lucide-react";
import { CartItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (paymentAmount: number, paymentMethod: "cash" | "card" | "qris", customerName: string) => void;
  onClear: () => void;
}

export function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClear,
}: ShoppingCartProps) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qris">("cash");
  const [customerName, setCustomerName] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = 0;
  const total = subtotal + tax;
  const change = Number(paymentAmount) - total;

  const quickAmounts = [50000, 100000, 150000, 200000];

  const handleCheckout = () => {
    if (!customerName.trim()) {
      alert("Nama pemesan wajib diisi");
      return;
    }
    if (paymentMethod === "cash" && Number(paymentAmount) < total) {
      alert("Jumlah bayar tidak cukup");
      return;
    }
    onCheckout(Number(paymentAmount), paymentMethod, customerName);
    setPaymentAmount("");
    setCustomerName("");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CartIcon className="h-5 w-5" />
          Keranjang
        </CardTitle>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            data-testid="button-clear-cart"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Hapus
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <CartIcon className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Keranjang kosong</p>
          </div>
        ) : (
          <ScrollArea className="h-full px-6">
            <div className="space-y-3 pb-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-md"
                  data-testid={`cart-item-${item.product.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      data-testid={`button-decrease-${item.product.id}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      data-testid={`button-increase-${item.product.id}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => onRemoveItem(item.product.id)}
                      data-testid={`button-remove-${item.product.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium text-sm w-20 text-right">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {items.length > 0 && (
        <CardFooter className="flex-col gap-4 border-t pt-4">
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pajak</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary" data-testid="text-cart-total">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="flex gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setPaymentMethod("cash")}
                data-testid="button-payment-cash"
              >
                <Banknote className="h-4 w-4 mr-1" />
                Tunai
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setPaymentMethod("card")}
                data-testid="button-payment-card"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Kartu
              </Button>
              <Button
                variant={paymentMethod === "qris" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setPaymentMethod("qris")}
                data-testid="button-payment-qris"
              >
                <Smartphone className="h-4 w-4 mr-1" />
                QRIS
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Pemesan</label>
              <Input
                type="text"
                placeholder="Nama pelanggan (opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                data-testid="input-customer-name"
              />
            </div>

            {paymentMethod === "cash" && (
              <>
                <Input
                  type="number"
                  placeholder="Jumlah bayar"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="text-lg font-medium"
                  data-testid="input-payment-amount"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">UANG PAS</label>
                  <div className="grid grid-cols-5 gap-2">
                    <Button
                      variant={paymentAmount === total.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentAmount(total.toString())}
                      data-testid="button-exact-payment"
                      className="col-span-1"
                    >
                      Pas
                    </Button>
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentAmount(amount.toString())}
                        data-testid={`button-quick-${amount}`}
                      >
                        {(amount / 1000)}K
                      </Button>
                    ))}
                  </div>
                </div>
                {Number(paymentAmount) >= total && (
                  <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950 rounded-md">
                    <span className="text-green-700 dark:text-green-300 font-medium">Kembalian</span>
                    <span className="text-green-700 dark:text-green-300 font-semibold" data-testid="text-change">
                      {formatCurrency(change)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            className="w-full py-6 text-lg"
            disabled={
              !customerName.trim() ||
              (paymentMethod === "cash" && Number(paymentAmount) < total)
            }
            onClick={handleCheckout}
            data-testid="button-checkout"
          >
            Bayar {formatCurrency(total)}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
