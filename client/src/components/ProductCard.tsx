import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertCircle } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BilliardRentalLocal {
  id: string;
  tableNumber: string;
  hoursRented: number;
  hourlyRate: number;
  totalPrice: number;
  startTime: Date;
  remainingSeconds: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  activeBilliardRentals?: BilliardRentalLocal[];
}

export function ProductCard({ product, onAddToCart, activeBilliardRentals = [] }: ProductCardProps) {
  const isLowStock = product.stock <= 10;
  const isOutOfStock = product.stock === 0;
  
  // Check if this is a billiard meja product and if it's currently rented
  const isBilliardProduct = product.name.toUpperCase().includes("MEJA");
  const tableNumber = isBilliardProduct ? product.name.split("MEJA ")[1]?.split(" ")[0]?.trim() : null;
  const isCurrentlyRented = !!(isBilliardProduct && tableNumber && activeBilliardRentals.some((r) => String(r.tableNumber).trim() === tableNumber));
  
  // EXT products are extension/renewal products - always orderable
  const isExtensionProduct = product.sku.startsWith("EXT");
  const canOrder = !isOutOfStock && (!isBilliardProduct || !isCurrentlyRented || isExtensionProduct);

  return (
    <Card
      className={`hover-elevate active-elevate-2 cursor-pointer transition-all h-full flex flex-col ${isOutOfStock || (isCurrentlyRented && !isExtensionProduct) ? "opacity-60" : ""}`}
      onClick={() => !isOutOfStock && (!isCurrentlyRented || isExtensionProduct) && onAddToCart(product)}
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-2 flex flex-col h-full">
        <div className="w-full h-28 bg-muted rounded-md flex items-center justify-center mb-2 flex-shrink-0">
          <Package className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <h3 className="font-semibold text-xs line-clamp-2 leading-tight" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <div className="mt-1">
            <p className="font-bold text-sm text-primary" data-testid={`text-product-price-${product.id}`}>
              {formatCurrency(product.price)}
            </p>
            {isCurrentlyRented ? (
              <Badge variant="destructive" className="text-xs mt-1">
                Sedang Disewa
              </Badge>
            ) : (
              <Badge
                variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "outline"}
                className="text-xs mt-1"
              >
                {isOutOfStock ? "Habis" : `${product.stock}`}
              </Badge>
            )}
          </div>
        </div>
        {isCurrentlyRented && !isExtensionProduct && (
          <Alert className="mb-2 p-2 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-xs text-red-600 dark:text-red-400 ml-1">
              Meja masih dalam sewa
            </AlertDescription>
          </Alert>
        )}
        <Button
          className="w-full h-8 font-semibold text-xs mt-2 flex-shrink-0"
          disabled={!canOrder}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          {isOutOfStock ? "Habis" : isCurrentlyRented && !isExtensionProduct ? "Tidak Tersedia" : "Tambah"}
        </Button>
      </CardContent>
    </Card>
  );
}
