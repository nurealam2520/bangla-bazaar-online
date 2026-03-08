import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, Database, Package, ShoppingCart, Users, FileJson, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type DataType = "products" | "orders" | "profiles" | "all";

const DataBackup = () => {
  const [exporting, setExporting] = useState<DataType | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const exportData = async (type: DataType) => {
    setExporting(type);
    try {
      const backup: Record<string, any> = { exportedAt: new Date().toISOString(), version: "1.0" };

      if (type === "products" || type === "all") {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        backup.products = data;
      }

      if (type === "orders" || type === "all") {
        const { data: orders, error: oErr } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (oErr) throw oErr;
        backup.orders = orders;

        // Also get order items
        const { data: items, error: iErr } = await supabase.from("order_items").select("*");
        if (iErr) throw iErr;
        backup.order_items = items;
      }

      if (type === "profiles" || type === "all") {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        backup.profiles = data;
      }

      if (type === "all") {
        const [coupons, shipping, testimonials, blogPosts, roles] = await Promise.all([
          supabase.from("coupons").select("*"),
          supabase.from("shipping_zones").select("*"),
          supabase.from("testimonials").select("*"),
          supabase.from("blog_posts").select("*"),
          supabase.from("user_roles").select("*"),
        ]);
        backup.coupons = coupons.data;
        backup.shipping_zones = shipping.data;
        backup.testimonials = testimonials.data;
        backup.blog_posts = blogPosts.data;
        backup.user_roles = roles.data;
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pawnest-backup-${type}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type === "all" ? "সম্পূর্ণ" : type} ডেটা এক্সপোর্ট সফল!`);
    } catch (err: any) {
      toast.error(`এক্সপোর্ট ব্যর্থ: ${err.message}`);
    }
    setExporting(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      let success = 0;
      let failed = 0;

      // Import products
      if (data.products?.length) {
        for (const p of data.products) {
          const { id, created_at, updated_at, ...rest } = p;
          const { error } = await supabase.from("products").upsert({ id, ...rest }, { onConflict: "id" });
          if (error) failed++;
          else success++;
        }
      }

      // Import orders
      if (data.orders?.length) {
        for (const o of data.orders) {
          const { created_at, updated_at, ...rest } = o;
          const { error } = await supabase.from("orders").upsert({ ...rest }, { onConflict: "id" });
          if (error) failed++;
          else success++;
        }
      }

      // Import order items
      if (data.order_items?.length) {
        for (const item of data.order_items) {
          const { created_at, ...rest } = item;
          const { error } = await supabase.from("order_items").upsert({ ...rest }, { onConflict: "id" });
          if (error) failed++;
          else success++;
        }
      }

      // Import coupons
      if (data.coupons?.length) {
        for (const c of data.coupons) {
          const { created_at, ...rest } = c;
          const { error } = await supabase.from("coupons").upsert({ ...rest }, { onConflict: "id" });
          if (error) failed++;
          else success++;
        }
      }

      // Import shipping zones
      if (data.shipping_zones?.length) {
        for (const sz of data.shipping_zones) {
          const { created_at, updated_at, ...rest } = sz;
          const { error } = await supabase.from("shipping_zones").upsert({ ...rest }, { onConflict: "id" });
          if (error) failed++;
          else success++;
        }
      }

      setImportResult({ success, failed });
      toast.success(`ইম্পোর্ট সম্পন্ন! সফল: ${success}, ব্যর্থ: ${failed}`);
    } catch (err: any) {
      toast.error(`ইম্পোর্ট ব্যর্থ: ${err.message}`);
    }
    setImporting(false);
    e.target.value = "";
  };

  const exportButtons: { type: DataType; label: string; icon: any }[] = [
    { type: "products", label: "প্রোডাক্ট", icon: Package },
    { type: "orders", label: "অর্ডার", icon: ShoppingCart },
    { type: "profiles", label: "ইউজার ডেটা", icon: Users },
    { type: "all", label: "সম্পূর্ণ ব্যাকআপ", icon: Database },
  ];

  return (
    <div className="space-y-5">
      {/* Export Section */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" /> ডেটা এক্সপোর্ট (ব্যাকআপ)
        </h4>
        <p className="text-xs text-muted-foreground">
          JSON ফরম্যাটে ডেটা এক্সপোর্ট করুন। সমস্যা হলে এই ফাইল দিয়ে পুনরুদ্ধার করা যাবে।
        </p>
        <div className="grid grid-cols-2 gap-2">
          {exportButtons.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={type === "all" ? "default" : "outline"}
              size="sm"
              disabled={!!exporting}
              onClick={() => exportData(type)}
              className={`gap-2 ${type === "all" ? "col-span-2 bg-gradient-warm text-primary-foreground" : ""}`}
            >
              {exporting === type ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" /> ডেটা ইম্পোর্ট (পুনরুদ্ধার)
        </h4>
        <p className="text-xs text-muted-foreground">
          আগে এক্সপোর্ট করা JSON ব্যাকআপ ফাইল থেকে ডেটা পুনরুদ্ধার করুন। বিদ্যমান ডেটা আপডেট হবে, নতুন ডেটা যোগ হবে।
        </p>
        <div className="flex items-center gap-3">
          <label className="flex-1">
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
            <Button variant="outline" className="w-full gap-2" disabled={importing} asChild>
              <span>
                {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileJson className="h-3.5 w-3.5" />}
                {importing ? "ইম্পোর্ট হচ্ছে..." : "JSON ফাইল সিলেক্ট করুন"}
              </span>
            </Button>
          </label>
        </div>

        {importResult && (
          <div className="rounded-lg border border-border p-3 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm">সফল: {importResult.success}</span>
            </div>
            {importResult.failed > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">ব্যর্থ: {importResult.failed}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataBackup;
