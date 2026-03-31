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
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category_id: string;
  categories?: {
    name: string;
  };
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
        <CardTitle className="text-2xl font-black flex items-center gap-3 font-heading">
          <ShoppingBag className="size-6 text-primary" />
          Manajemen Menu
        </CardTitle>
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 uppercase tracking-widest text-[10px]">Produk Aktif</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold pl-8">Nama Produk</TableHead>
              <TableHead className="font-bold">Kategori</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="font-bold text-right pr-8">Harga</TableHead>
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
        toast.error("Gagal Memperbarui", { description: result.error });
      } else {
        toast.success(`${product.name} sekarang ${!product.is_active ? "Terlihat" : "Tersembunyi"}`);
      }
    });
  };

  const handlePriceUpdate = () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Harga Tidak Valid", { description: "Harga harus berupa angka positif." });
      setPrice(product.price.toString());
      return;
    }

    startTransition(async () => {
      const result = await updateProductPrice(product.id, newPrice);
      if (result.error) {
        toast.error("Gagal Memperbarui", { description: result.error });
      } else {
        toast.success(`Harga diperbarui untuk ${product.name}`);
      }
    });
  };

  return (
    <TableRow className="group hover:bg-muted/30 transition-colors h-20">
      <TableCell className="font-black text-foreground pl-8 text-lg">{product.name}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold uppercase text-[10px] tabular-nums">
          {product.categories?.name || "Lainnya"}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-3">
          <span className={`text-[10px] font-black uppercase tracking-tighter ${product.is_active ? "text-green-600" : "text-muted-foreground/40"}`}>
            {product.is_active ? "Aktif" : "Sembunyi"}
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
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40">Rp</span>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isPending}
              className="w-32 h-10 rounded-xl bg-muted/50 border-none font-black text-right pr-3 pl-8 focus-visible:ring-primary"
            />
          </div>
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
