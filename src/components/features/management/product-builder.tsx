"use client";

import { useEffect, useState, useTransition } from "react";
import { getCategories } from "@/actions/category-actions";
import { getRawMaterials } from "@/actions/inventory-actions";
import { createProductWithRecipe, getProductsWithDetails, updateProductWithRecipe, deleteProduct } from "@/actions/menu-actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { Loader2, Plus, X, UtensilsCrossed, Image as ImageIcon, UploadCloud, Edit, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface RecipeRow {
  raw_material_id: string;
  quantity_required: number;
}

export function ProductBuilder() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [recipeItems, setRecipeItems] = useState<RecipeRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // New CRUD states
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoadingProducts(true);
    const [cats, mats, prods] = await Promise.all([
      getCategories(),
      getRawMaterials(),
      getProductsWithDetails()
    ]);
    setCategories(cats);
    setMaterials(mats);
    setProducts(prods);
    if (cats.length > 0 && !editingId) setCategoryId(cats[0].id);
    setIsLoadingProducts(false);
  };

  const refreshProducts = async () => {
    const prods = await getProductsWithDetails();
    setProducts(prods);
  };

  const addRecipeRow = () => {
    if (materials.length > 0) {
      setRecipeItems([...recipeItems, { raw_material_id: materials[0].id, quantity_required: 1 }]);
    }
  };

  const removeRecipeRow = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateRecipeRow = (index: number, field: keyof RecipeRow, value: any) => {
    const newItems = [...recipeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRecipeItems(newItems);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas toBlob failed"));
          }, "image/jpeg", 0.7);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    setIsUploading(true);
    try {
      const compressedBlob = await compressImage(imageFile);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `p-${crypto.randomUUID()}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(filePath, compressedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Gagal unggah gambar: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !categoryId) return;
    
    let uploadedImageUrl = imagePreview?.startsWith("http") ? imagePreview : null;
    
    if (imageFile) {
      const newUrl = await uploadImage();
      if (!newUrl) return; 
      uploadedImageUrl = newUrl;
    }

    startTransition(async () => {
      let result;
      if (editingId) {
        result = await updateProductWithRecipe(
          editingId,
          { name, price: parseFloat(price), category_id: categoryId, image_url: uploadedImageUrl || undefined },
          recipeItems,
          oldImageUrl
        );
      } else {
        result = await createProductWithRecipe(
          { name, price: parseFloat(price), category_id: categoryId, image_url: uploadedImageUrl || undefined },
          recipeItems
        );
      }

      if (result.success) {
        toast.success(editingId ? "Menu berhasil diperbarui" : "Menu berhasil dibuat");
        resetForm();
        refreshProducts();
      } else {
        toast.error(result.error);
      }
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategoryId(categories.length > 0 ? categories[0].id : "");
    setRecipeItems([]);
    setImageFile(null);
    setImagePreview(null);
    setOldImageUrl(null);
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategoryId(product.category_id);
    setOldImageUrl(product.image_url);
    setImagePreview(product.image_url);
    
    // Map recipe items for the builder
    const mapped = product.recipes.map((r: any) => ({
      raw_material_id: r.raw_material_id,
      quantity_required: r.quantity_required
    }));
    setRecipeItems(mapped);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId: string, imageUrl?: string | null) => {
    const confirm = window.confirm("Apakah Anda yakin ingin menghapus menu ini? Data resep terkait juga akan terhapus.");
    if (!confirm) return;

    const result = await deleteProduct(productId, imageUrl);
    if (result.success) {
      toast.success("Menu berhasil dihapus");
      refreshProducts();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 space-y-6">
          <div className="px-2">
             <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Arsitektur Produk</h3>
             <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Susun penawaran menu baru dan tautkan komponen resep</p>
          </div>

          <div className="bg-white p-10 rounded-card shadow-xl border border-outline/10 grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Left Column: Basic Info */}
             <div className="space-y-8 pr-10 border-r border-outline/10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Nama Menu</label>
                   <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Wagyu Beef Burger"
                      className="w-full bg-surface-variant/10 border border-outline/5 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-tight italic transition-all focus:bg-white focus:shadow-xl focus:border-primary/20 outline-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Harga (Rp)</label>
                      <input 
                         type="number" 
                         value={price}
                         onChange={(e) => setPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full bg-surface-variant/10 border border-outline/5 rounded-2xl px-6 py-4 text-sm font-black transition-all focus:bg-white focus:shadow-xl focus:border-primary/20 outline-none tabular-nums"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Kategori</label>
                      <select 
                         value={categoryId}
                         onChange={(e) => setCategoryId(e.target.value)}
                         className="w-full bg-surface-variant/10 border border-outline/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all focus:bg-white focus:shadow-xl focus:border-primary/20 outline-none appearance-none"
                      >
                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                </div>
                
                <div className="pt-10 flex gap-4">
                   <button 
                     onClick={handleSubmit}
                     disabled={isPending || isUploading || !name || !price || !categoryId}
                     className={cn(
                        "flex-1 bg-primary text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all",
                        (isPending || isUploading || !name || !price || !categoryId) && "opacity-50 grayscale"
                     )}
                   >
                     {(isPending || isUploading) ? <Loader2 className="size-4 animate-spin" /> : (editingId ? <CheckCircle2 className="size-4" /> : <Plus className="size-4" />)}
                     {isUploading ? "Mengunggah..." : (editingId ? "Simpan Perubahan" : "Tambahkan Menu")}
                   </button>
                   
                   {editingId && (
                     <button 
                       onClick={resetForm}
                       className="px-8 bg-surface-variant/10 text-on-surface-variant font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-surface-variant/20 transition-all"
                     >
                       Batal
                     </button>
                   )}
                </div>
             </div>

             {/* Right Column: Image & Recipe */}
             <div className="space-y-10">
                {/* Image Input UI */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Visual Produk (Foto)</label>
                   <div className="relative group overflow-hidden rounded-3xl border-2 border-dashed border-outline/20 aspect-video flex flex-col items-center justify-center gap-4 transition-all hover:bg-primary/5 hover:border-primary/40 bg-surface-variant/5">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <button 
                               onClick={() => { setImageFile(null); setImagePreview(null); }}
                               className="bg-white/20 p-4 rounded-full text-white hover:bg-red-500 transition-colors"
                             >
                                <X className="size-6" />
                             </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                           <div className="size-16 bg-white/50 rounded-2xl flex items-center justify-center shadow-sm">
                              <UploadCloud className="size-8 text-primary" />
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest">Klik untuk pilih gambar</p>
                              <p className="text-[8px] font-bold text-on-surface-variant mt-1">PNG, JPG (Auto-Compress)</p>
                           </div>
                        </div>
                      )}
                      <input 
                         type="file" 
                         accept="image/*"
                         onChange={handleImageChange}
                         className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                   </div>
                </div>

                {/* Recipe Builder */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <UtensilsCrossed className="size-5 text-primary" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Komponen Resep</label>
                     </div>
                     <button 
                        onClick={addRecipeRow}
                        className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                     >
                        + Tambah baris
                     </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                     {recipeItems.length === 0 ? (
                        <div className="h-32 border-2 border-dashed border-outline/20 rounded-3xl flex flex-col items-center justify-center gap-2 grayscale opacity-40">
                           <span className="text-[10px] font-black uppercase tracking-widest">Tidak ada komponen tertaut</span>
                           <span className="text-[8px] font-bold">Direkomendasikan untuk pelacakan stok</span>
                        </div>
                     ) : (
                        recipeItems.map((item, index) => (
                           <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                              <select 
                                 value={item.raw_material_id}
                                 onChange={(e) => updateRecipeRow(index, 'raw_material_id', e.target.value)}
                                 className="flex-1 bg-surface-variant/5 border border-outline/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase transition-all"
                              >
                                 {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                              </select>
                              <input 
                                 type="number"
                                 value={item.quantity_required}
                                 onChange={(e) => updateRecipeRow(index, 'quantity_required', parseFloat(e.target.value))}
                                 className="w-20 bg-surface-variant/5 border border-outline/10 rounded-xl px-4 py-3 text-[10px] font-black transition-all"
                              />
                              <button onClick={() => removeRecipeRow(index)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg opacity-20 hover:opacity-100 transition-all">
                                 <X className="size-4" />
                              </button>
                           </div>
                        ))
                     )}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Product List Table Section */}
      <div className="mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <div className="flex items-center justify-between px-2">
             <div className="space-y-2">
                <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Daftar Menu Aktif</h3>
                <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-60">Klik 'Ubah' untuk memodifikasi detail atau 'Hapus' untuk eliminasi permanen</p>
             </div>
             <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
                 <span className="text-primary font-black text-xs uppercase tracking-widest">{products.length} Menu Terdaftar</span>
             </div>
          </div>

          <div className="bg-white rounded-card shadow-sm border border-outline/10 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/5 border-b border-outline/10">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Visual</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Nama Menu</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Kategori</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 text-right">Harga Jual</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 text-center">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingProducts ? (
                     <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                           <Loader2 className="size-8 animate-spin mx-auto text-primary opacity-20" />
                        </td>
                     </tr>
                  ) : products.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="px-8 py-20 text-center space-y-4">
                           <AlertCircle className="size-12 mx-auto text-on-surface-variant/10" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Belum ada menu yang terdaftar</p>
                        </td>
                     </tr>
                  ) : products.map((product) => (
                    <tr key={product.id} className={cn(
                      "border-b border-outline/5 transition-colors group hover:bg-surface-variant/5",
                      editingId === product.id && "bg-primary/5"
                    )}>
                      <td className="px-8 py-5">
                        <div className="w-16 h-12 rounded-xl bg-surface-variant/10 overflow-hidden flex items-center justify-center border border-outline/5 group-hover:scale-110 transition-transform">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UtensilsCrossed className="size-5 opacity-20" />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-black uppercase tracking-tighter italic text-on-surface">{product.name}</div>
                        <div className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">ID: {product.id.split('-')[0]}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-surface-variant/10 rounded-lg opacity-60">
                          {product.category_data?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-sm text-primary tabular-nums">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                           {product.is_active ? (
                             <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                               <div className="size-1.5 bg-green-500 rounded-full animate-pulse"></div>
                               Tersedia
                             </span>
                           ) : (
                             <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                               <div className="size-1.5 bg-red-500 rounded-full"></div>
                               Nonaktif
                             </span>
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => handleEdit(product)}
                             className="p-3 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all active:scale-90"
                             title="Edit Produk"
                           >
                             <Edit className="size-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(product.id, product.image_url)}
                             className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                             title="Hapus Produk"
                           >
                             <Trash2 className="size-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </>
  );
}
