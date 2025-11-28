import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isLowStock = product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <Card
      className={`hover-elevate active-elevate-2 cursor-pointer transition-all h-full flex flex-col ${isOutOfStock ? "opacity-60" : ""}`}
      onClick={() => !isOutOfStock && onAddToCart(product)}
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
            <Badge
              variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "outline"}
              className="text-xs mt-1"
            >
              {isOutOfStock ? "Habis" : `${product.stock}`}
            </Badge>
          </div>
        </div>
        <Button
          className="w-full h-8 font-semibold text-xs mt-2 flex-shrink-0"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          Tambah
        </Button>
      </CardContent>
    </Card>
  );
}
