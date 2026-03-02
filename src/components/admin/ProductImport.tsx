import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileJson, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateProduct, type ProductInsert } from "@/hooks/useProducts";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const ProductImport = () => {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ProductInsert[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createProduct = useCreateProduct();

  const parseCSV = (text: string): ProductInsert[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    
    return lines.slice(1).map((line) => {
      const values = line.match(/(".*?"|[^,]+)/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) || [];
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = values[i] || ""));

      return {
        name: row.name || row.title || row.product_name || "",
        price: parseFloat(row.price || row.selling_price || "0"),
        original_price: row.original_price ? parseFloat(row.original_price) : null,
        image: row.image || row.image_url || row.img || "",
        category: (row.category || "dogs") as "dogs" | "cats",
        subcategory: row.subcategory || row.sub_category || "",
        description: row.description || "",
        badge: row.badge || null,
        rating: parseFloat(row.rating || "4.5"),
        reviews: parseInt(row.reviews || "0"),
        supplier_name: row.supplier_name || row.supplier || "",
        supplier_url: row.supplier_url || row.source_url || row.aliexpress_url || row.cj_url || "",
        supplier_price: row.supplier_price ? parseFloat(row.supplier_price) : undefined,
      } as any;
    }).filter((p) => p.name && p.price > 0);
  };

  const parseJSON = (text: string): ProductInsert[] => {
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : data.products || data.items || [];
    
    return items.map((item: any) => ({
      name: item.name || item.title || item.product_name || "",
      price: parseFloat(item.price || item.selling_price || "0"),
      original_price: item.original_price ? parseFloat(item.original_price) : null,
      image: item.image || item.image_url || item.img || "",
      category: (item.category || "dogs") as "dogs" | "cats",
      subcategory: item.subcategory || item.sub_category || "",
      description: item.description || "",
      badge: item.badge || null,
      rating: parseFloat(item.rating || "4.5"),
      reviews: parseInt(item.reviews || "0"),
      supplier_name: item.supplier_name || item.supplier || "",
      supplier_url: item.supplier_url || item.source_url || item.aliexpress_url || item.cj_url || "",
      supplier_price: item.supplier_price ? parseFloat(item.supplier_price) : undefined,
    } as any)).filter((p: any) => p.name && p.price > 0);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const products = file.name.endsWith(".json") ? parseJSON(text) : parseCSV(text);
        if (products.length === 0) {
          toast.error("কোনো ভ্যালিড প্রোডাক্ট পাওয়া যায়নি");
          return;
        }
        setPreview(products);
        toast.success(`${products.length}টি প্রোডাক্ট পাওয়া গেছে`);
      } catch {
        toast.error("ফাইল পার্স করতে সমস্যা হয়েছে");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    const res: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const product of preview) {
      try {
        await createProduct.mutateAsync(product);
        res.success++;
      } catch (err: any) {
        res.failed++;
        res.errors.push(`${product.name}: ${err.message}`);
      }
    }

    setResult(res);
    setPreview([]);
    setImporting(false);
    if (res.success > 0) toast.success(`${res.success}টি প্রোডাক্ট ইম্পোর্ট হয়েছে!`);
    if (res.failed > 0) toast.error(`${res.failed}টি ব্যর্থ হয়েছে`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Upload className="h-4 w-4" /> বাল্ক প্রোডাক্ট ইম্পোর্ট (CSV / JSON)
      </h4>
      <p className="text-xs text-muted-foreground">
        AliExpress / CJ Dropshipping থেকে প্রোডাক্ট ডেটা CSV বা JSON ফাইলে ইম্পোর্ট করুন।
        <br />
        প্রয়োজনীয় ফিল্ড: <code className="text-primary">name, price, image</code>
        <br />
        ঐচ্ছিক: <code className="text-primary">category, subcategory, description, badge, supplier_name, supplier_url, supplier_price, original_price</code>
      </p>

      <input ref={fileRef} type="file" accept=".csv,.json" onChange={handleFile} className="hidden" />
      <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
        <FileJson className="h-4 w-4" /> ফাইল সিলেক্ট করুন
      </Button>

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{preview.length}টি প্রোডাক্ট প্রিভিউ</p>
            <Button variant="ghost" size="sm" onClick={() => setPreview([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {preview.slice(0, 10).map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-secondary/50">
                {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} • ${p.price}</p>
                </div>
              </div>
            ))}
            {preview.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">...এবং আরো {preview.length - 10}টি</p>
            )}
          </div>
          <Button onClick={handleImport} disabled={importing} className="w-full gap-2 bg-gradient-warm text-primary-foreground">
            <Upload className="h-4 w-4" />
            {importing ? "ইম্পোর্ট হচ্ছে..." : `${preview.length}টি প্রোডাক্ট ইম্পোর্ট করুন`}
          </Button>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">সফল: {result.success}</span>
          </div>
          {result.failed > 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <span className="text-sm font-medium text-destructive">ব্যর্থ: {result.failed}</span>
                {result.errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{e}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImport;
