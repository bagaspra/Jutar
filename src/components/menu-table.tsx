"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleProductStatus, updateProductPrice } from "@/actions/menu-actions";
import { toast } from "sonner";
import { Loader2, Save, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
}

interface MenuManagementTableProps {
  products: Product[];
}

export function MenuManagementTable({ products }: MenuManagementTableProps) {
  return (
    <Card className="shadow-2xl border-none overflow-hidden col-span-full">
      <CardHeader className="bg-primary/10 border-b border-primary/10 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-black flex items-center gap-3">
          <ShoppingBag className="size-6 text-primary" />
          Menu Management
        </CardTitle>
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 uppercase tracking-widest text-[10px]">Active Products</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold pl-8">Product Name</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="font-bold text-right pr-8">Price ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const [price, setPrice] = useState(product.price.toString());

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleProductStatus(product.id, product.is_active);
      if (result.error) {
        toast.error("Update Failed", { description: result.error });
      } else {
        toast.success(`${product.name} is now ${!product.is_active ? "Visible" : "Hidden"}`);
      }
    });
  };

  const handlePriceUpdate = () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Invalid Price", { description: "Price must be a positive number." });
      setPrice(product.price.toString());
      return;
    }

    startTransition(async () => {
      const result = await updateProductPrice(product.id, newPrice);
      if (result.error) {
        toast.error("Update Failed", { description: result.error });
      } else {
        toast.success(`Price updated for ${product.name}`);
      }
    });
  };

  return (
    <TableRow className="group hover:bg-muted/30 transition-colors h-20">
      <TableCell className="font-black text-foreground pl-8 text-lg">{product.name}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold uppercase text-[10px] tabular-nums">
          {product.category}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-3">
          <span className={`text-[10px] font-black uppercase tracking-tighter ${product.is_active ? "text-green-600" : "text-muted-foreground/40"}`}>
            {product.is_active ? "Active" : "Hidden"}
          </span>
          <Switch
            checked={product.is_active}
            onCheckedChange={handleToggle}
            disabled={isPending}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </TableCell>
      <TableCell className="text-right pr-8">
        <div className="flex items-center justify-end gap-2 group-hover:translate-x-[-4px] transition-transform">
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isPending}
            className="w-24 h-10 rounded-xl bg-muted/50 border-none font-black text-right pr-3 focus-visible:ring-primary"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePriceUpdate}
            disabled={isPending || parseFloat(price) === product.price}
            className="size-10 rounded-xl hover:bg-primary/10 text-primary transition-all duration-300"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
