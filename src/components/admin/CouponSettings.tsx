import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tag, Plus, Save, Trash2, RefreshCw } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

const CouponSettings = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("percentage");
  const [newValue, setNewValue] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(0);
  const [newMaxUses, setNewMaxUses] = useState(0);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data as Coupon[]);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    if (!newCode.trim()) { toast.error("Enter a coupon code"); return; }
    const { error } = await supabase.from("coupons").insert({
      code: newCode.toUpperCase().trim(),
      type: newType,
      value: newValue,
      min_order: newMinOrder,
      max_uses: newMaxUses,
    });
    if (error) {
      if (error.code === "23505") toast.error("Code already exists");
      else toast.error(error.message);
    } else {
      toast.success("Coupon created!");
      setNewCode("");
      fetchCoupons();
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id);
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Coupon deleted");
    fetchCoupons();
  };

  if (loading) return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" /> Coupons & Discounts
      </h3>

      {/* Create Coupon */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h4 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> New Coupon</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Code</label>
            <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="SAVE10" className="h-8 text-xs uppercase" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Type</label>
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full h-8 px-2 rounded-lg border border-input bg-background text-xs">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Value</label>
            <Input type="number" value={newValue} onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Min Order ($)</label>
            <Input type="number" value={newMinOrder} onChange={(e) => setNewMinOrder(parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
          </div>
          <div className="flex items-end">
            <Button size="sm" onClick={handleCreate} className="w-full gap-1 bg-gradient-warm text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> Create
            </Button>
          </div>
        </div>
      </div>

      {/* Coupon List */}
      {coupons.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No coupons yet</p>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <code className="font-mono font-bold text-primary">{coupon.code}</code>
                <span className="text-sm">
                  {coupon.type === "percentage" ? `${coupon.value}% off` : `$${coupon.value} off`}
                </span>
                {coupon.min_order > 0 && <span className="text-xs text-muted-foreground">Min: ${coupon.min_order}</span>}
                <span className="text-xs text-muted-foreground">Used: {coupon.used_count}{coupon.max_uses > 0 ? `/${coupon.max_uses}` : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(coupon)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${coupon.is_active ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${coupon.is_active ? "left-[22px]" : "left-0.5"}`} />
                </button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(coupon.id)} className="h-7 w-7 p-0 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponSettings;
