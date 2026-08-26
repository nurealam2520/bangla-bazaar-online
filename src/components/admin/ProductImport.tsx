import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileJson, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useCreateProduct, useAllProducts, type ProductInsert } from "@/hooks/useProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const PLACEHOLDER_IMAGE = "/placeholder.svg";

const norm = (s: unknown) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  const cleaned = String(v ?? "").replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

const clean = (v: unknown) => String(v ?? "").trim();

// Header aliases -> internal keys (covers CJDropshipping + standard exports)
const HEADER_MAP: Record<string, string> = {
  // name
  product_title: "name",
  product_name: "name",
  title: "name",
  name: "name",
  // price
  product_base_price: "price",
  base_price: "price",
  total_cost: "price",
  selling_price: "price",
  price: "price",
  // supplier price
  supplier_price: "supplier_price",
  cost: "supplier_price",
  product_cost: "supplier_price",
  // original price
  original_price: "original_price",
  compare_at_price: "original_price",
  // image
  product_image: "image",
  image_url: "image",
  main_image: "image",
  img: "image",
  image: "image",
  // CJ variant id
  variant_id: "cj_variant_id",
  cj_variant_id: "cj_variant_id",
  product_variant_id: "cj_variant_id",
  vid: "cj_variant_id",
  // sku
  sku: "cj_sku",
  cj_sku: "cj_sku",
  product_sku: "cj_sku",
  variant_sku: "cj_sku",
  cj_product_sku: "cj_sku",
  // specification / subcategory
  specification: "subcategory",
  variant: "subcategory",
  sub_category: "subcategory",
  subcategory: "subcategory",
  // status
  product_status: "status",
  status: "status",
  // inventory
  available_inventory: "inventory",
  inventory: "inventory",
  stock: "inventory",
  quantity: "inventory",
  // misc
  category: "category",
  description: "description",
  product_description: "description",
  badge: "badge",
  rating: "rating",
  reviews: "reviews",
  supplier_name: "supplier_name",
  supplier: "supplier_name",
  supplier_url: "supplier_url",
  source_url: "supplier_url",
  aliexpress_url: "supplier_url",
  cj_url: "supplier_url",
  product_url: "supplier_url",
};

const HEADER_HINTS = ["product_title", "sku", "product_base_price", "name", "price", "title"];

/** Find the true header row, skipping CJ metadata/disclaimer rows. */
const findHeaderRow = (rows: unknown[][]): number => {
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const keys = (rows[i] || []).map(norm).filter(Boolean);
    if (keys.length < 2) continue;
    const hits = keys.filter((k) => HEADER_HINTS.includes(k) || HEADER_MAP[k]).length;
    if (hits >= 2) return i;
  }
  return 0;
};

const rowToProduct = (row: Record<string, string>): (ProductInsert & { sku?: string }) | null => {
  const name = clean(row.name);
  const cost = toNumber(row.supplier_price ?? row.price) || toNumber(row.price);
  if (!name || cost <= 0) return null;
  // 40% mark-up over the supplier/base price
  const price = Math.round(cost * 1.4 * 100) / 100;

  // CJ status filter: only import items that are on sale, when a status column exists
  const status = clean(row.status).toLowerCase();
  if (status && !status.includes("on sale") && !status.includes("active")) return null;

  const image = clean(row.image) || PLACEHOLDER_IMAGE;
  const sku = clean(row.cj_sku);
  const variantId = clean(row.cj_variant_id);
  const spec = clean(row.subcategory);
  const description = clean(row.description) || [spec && `Specification: ${spec}`, sku && `SKU: ${sku}`].filter(Boolean).join(" • ");
  const category = clean(row.category).toLowerCase() === "cats" ? "cats" : "dogs";

  return {
    name,
    price,
    original_price: row.original_price ? toNumber(row.original_price) : null,
    image,
    category,
    subcategory: spec,
    description,
    badge: clean(row.badge) || null,
    rating: row.rating ? toNumber(row.rating) : 4.5,
    reviews: row.reviews ? Math.round(toNumber(row.reviews)) : 0,
    supplier_name: clean(row.supplier_name) || undefined,
    supplier_url: clean(row.supplier_url) || undefined,
    supplier_price: cost,
    cj_variant_id: variantId || undefined,
    cj_sku: sku || undefined,
  } as any;
};

const rowsToProducts = (rows: unknown[][]) => {
  if (rows.length < 2) return { products: [], isCJ: false };
  const headerIdx = findHeaderRow(rows);
  const rawHeaders = (rows[headerIdx] || []).map(norm);
  const isCJ = rawHeaders.includes("product_title") || rawHeaders.includes("product_base_price");

  const products = rows
    .slice(headerIdx + 1)
    .map((values) => {
      const row: Record<string, string> = {};
      rawHeaders.forEach((h, i) => {
        const key = HEADER_MAP[h];
        if (key && row[key] === undefined) row[key] = clean(values?.[i]);
      });
      return rowToProduct(row);
    })
    .filter(Boolean) as ProductInsert[];

  return { products, isCJ };
};

const parseCSVRows = (text: string): unknown[][] => {
  const rows: unknown[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ""));
};

const parseJSON = (text: string): ProductInsert[] => {
  const data = JSON.parse(text);
  const items = Array.isArray(data) ? data : data.products || data.items || [];
  return items
    .map((item: any) => {
      const row: Record<string, string> = {};
      Object.entries(item || {}).forEach(([k, v]) => {
        const key = HEADER_MAP[norm(k)];
        if (key && row[key] === undefined) row[key] = clean(v);
      });
      return rowToProduct(row);
    })
    .filter(Boolean) as ProductInsert[];
};

const ProductImport = () => {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ProductInsert[]>([]);
  const [isCJFile, setIsCJFile] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const createProduct = useCreateProduct();
  const { data: allProducts } = useAllProducts();

  const categories = useMemo(() => {
    const set = new Set<string>(["dogs", "cats"]);
    (allProducts || []).forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [allProducts]);

  const subcategories = useMemo(() => {
    const base = category === "__new__" ? newCategory.trim().toLowerCase() : category;
    const set = new Set<string>();
    (allProducts || []).forEach((p) => {
      if (p.subcategory && (!base || p.category === base)) set.add(p.subcategory);
    });
    return Array.from(set).sort();
  }, [allProducts, category, newCategory]);

  const finalCategory = (category === "__new__" ? newCategory.trim().toLowerCase() : category).trim();
  const finalSubcategory = (subcategory === "__new__" ? newSubcategory.trim() : subcategory).trim();

  const applyParsed = (products: ProductInsert[], isCJ: boolean) => {
    if (products.length === 0) {
      toast.error("No valid products found in this file");
      return;
    }
    setPreview(products);
    setIsCJFile(isCJ);
    toast.success(`${products.length} products parsed${isCJ ? " from CJDropshipping file" : ""}`);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const lower = file.name.toLowerCase();
    const reader = new FileReader();

    reader.onload = (ev) => {
      try {
        if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
          const wb = XLSX.read(ev.target?.result, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });
          const { products, isCJ } = rowsToProducts(rows as unknown[][]);
          applyParsed(products, isCJ);
        } else if (lower.endsWith(".json")) {
          applyParsed(parseJSON(ev.target?.result as string), false);
        } else {
          const { products, isCJ } = rowsToProducts(parseCSVRows(ev.target?.result as string));
          applyParsed(products, isCJ);
        }
      } catch (err: any) {
        toast.error(`Could not parse file: ${err?.message || "unknown error"}`);
      }
    };

    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!finalCategory) {
      toast.error("Please select or enter a category");
      return;
    }
    setImporting(true);
    const res: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const product of preview) {
      try {
        await createProduct.mutateAsync({ ...product, category: finalCategory as any, subcategory: finalSubcategory || product.subcategory || "" });
        res.success++;
      } catch (err: any) {
        res.failed++;
        res.errors.push(`${product.name}: ${err.message}`);
      }
    }

    setResult(res);
    setPreview([]);
    setImporting(false);
    setCategoryOpen(false);
    if (res.success > 0)
      toast.success(
        `Successfully imported ${res.success} products into "${finalCategory}${finalSubcategory ? ` / ${finalSubcategory}` : ""}"${isCJFile ? " from CJDropshipping file" : ""}`,
      );
    if (res.failed > 0) toast.error(`${res.failed} products failed to import`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Upload className="h-4 w-4" /> Bulk Product Import (CSV / XLSX / JSON)
      </h4>
      <p className="text-xs text-muted-foreground">
        CJDropshipping export files (.csv / .xlsx) are supported directly — no manual editing needed. Metadata rows on top
        are skipped automatically and only items marked <span className="text-primary">On Sale</span> are imported.
        Selling price is calculated automatically with a <span className="text-primary">40% mark-up</span> over the
        supplier price, and you pick the category/subcategory for the whole batch before saving.
        <br />
        Required fields: <code className="text-primary">Product Title, Product Base Price ($), Product Image</code>
        <br />
        Also supported: <code className="text-primary">name, price, image, category, subcategory, description, badge, supplier_name, supplier_url, supplier_price, original_price</code>
      </p>

      <input ref={fileRef} type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFile} className="hidden" />
      <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
        <FileJson className="h-4 w-4" /> Select file
      </Button>

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {preview.length} products ready {isCJFile && <span className="text-primary">(CJDropshipping)</span>}
            </p>
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
              <p className="text-xs text-muted-foreground text-center">...and {preview.length - 10} more</p>
            )}
          </div>
          <Button onClick={() => setCategoryOpen(true)} className="w-full gap-2 bg-gradient-warm text-primary-foreground">
            <Upload className="h-4 w-4" />
            {`Continue — choose category for ${preview.length} products`}
          </Button>
        </div>
      )}

      <Dialog open={categoryOpen} onOpenChange={(o) => !importing && setCategoryOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select category for this batch</DialogTitle>
            <DialogDescription>
              The chosen category and subcategory will be applied to all {preview.length} products.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(""); }}>
                <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value="__new__">+ New category…</SelectItem>
                </SelectContent>
              </Select>
              {category === "__new__" && (
                <Input placeholder="New category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              )}
            </div>

            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger><SelectValue placeholder="Choose a subcategory (optional)" /></SelectTrigger>
                <SelectContent>
                  {subcategories.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                  <SelectItem value="__new__">+ New subcategory…</SelectItem>
                </SelectContent>
              </Select>
              {subcategory === "__new__" && (
                <Input placeholder="New subcategory name" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCategoryOpen(false)} disabled={importing}>Cancel</Button>
            <Button onClick={handleImport} disabled={importing || !finalCategory} className="gap-2 bg-gradient-warm text-primary-foreground">
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : `Confirm & Import Products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {result && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Imported: {result.success}</span>
          </div>
          {result.failed > 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <span className="text-sm font-medium text-destructive">Failed: {result.failed}</span>
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
