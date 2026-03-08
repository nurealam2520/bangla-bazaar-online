import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Truck, Plus, Save, Trash2, RefreshCw } from "lucide-react";

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  flat_rate: number;
  free_shipping_threshold: number;
  per_kg_rate: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
}

const ShippingSettings = () => {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchZones = async () => {
    setLoading(true);
    const { data } = await supabase.from("shipping_zones").select("*").order("name");
    if (data) setZones(data as ShippingZone[]);
    setLoading(false);
  };

  useEffect(() => { fetchZones(); }, []);

  const handleSave = async (zone: ShippingZone) => {
    setSaving(true);
    const { error } = await supabase.from("shipping_zones").update({
      name: zone.name,
      countries: zone.countries,
      flat_rate: zone.flat_rate,
      free_shipping_threshold: zone.free_shipping_threshold,
      per_kg_rate: zone.per_kg_rate,
      estimated_days_min: zone.estimated_days_min,
      estimated_days_max: zone.estimated_days_max,
      is_active: zone.is_active,
    }).eq("id", zone.id);
    if (error) toast.error(error.message);
    else toast.success(`${zone.name} zone updated`);
    setSaving(false);
  };

  const handleAdd = async () => {
    const { error } = await supabase.from("shipping_zones").insert({
      name: "New Zone",
      countries: [],
      flat_rate: 5.99,
      free_shipping_threshold: 50,
      per_kg_rate: 2,
      estimated_days_min: 10,
      estimated_days_max: 20,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Zone added");
      fetchZones();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shipping zone?")) return;
    const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Zone deleted");
      fetchZones();
    }
  };

  if (loading) return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" /> Shipping Zones
        </h3>
        <Button size="sm" onClick={handleAdd} className="gap-1.5 bg-gradient-warm text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Zone
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Shipping origin: China (dropshipping). Configure rates per destination zone.
      </p>

      {zones.map((zone, i) => (
        <div key={zone.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Input
              value={zone.name}
              onChange={(e) => {
                const updated = [...zones];
                updated[i] = { ...zone, name: e.target.value };
                setZones(updated);
              }}
              className="font-semibold max-w-[200px]"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={zone.is_active}
                  onChange={(e) => {
                    const updated = [...zones];
                    updated[i] = { ...zone, is_active: e.target.checked };
                    setZones(updated);
                  }}
                  className="rounded"
                />
                Active
              </label>
              <Button size="sm" variant="outline" onClick={() => handleSave(zone)} disabled={saving} className="gap-1">
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(zone.id)} className="text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Countries (comma-sep)</label>
              <Input
                value={zone.countries.join(",")}
                onChange={(e) => {
                  const updated = [...zones];
                  updated[i] = { ...zone, countries: e.target.value.split(",").map(c => c.trim()).filter(Boolean) };
                  setZones(updated);
                }}
                placeholder="US,CA"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Flat Rate ($)</label>
              <Input
                type="number" step="0.01"
                value={zone.flat_rate}
                onChange={(e) => {
                  const updated = [...zones];
                  updated[i] = { ...zone, flat_rate: parseFloat(e.target.value) || 0 };
                  setZones(updated);
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Free Ship Over ($)</label>
              <Input
                type="number" step="0.01"
                value={zone.free_shipping_threshold}
                onChange={(e) => {
                  const updated = [...zones];
                  updated[i] = { ...zone, free_shipping_threshold: parseFloat(e.target.value) || 0 };
                  setZones(updated);
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Per kg Rate ($)</label>
              <Input
                type="number" step="0.01"
                value={zone.per_kg_rate}
                onChange={(e) => {
                  const updated = [...zones];
                  updated[i] = { ...zone, per_kg_rate: parseFloat(e.target.value) || 0 };
                  setZones(updated);
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Est. Days (Min)</label>
              <Input
                type="number"
                value={zone.estimated_days_min}
                onChange={(e) => {
                  const updated = [...zones];
                  updated[i] = { ...zone, estimated_days_min: parseInt(e.target.value) || 0 };
                  setZones(updated);
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Est. Days (Max)</label>
              <Input
                type="number"
                value={zone.estimated_days_max}
                onChange={(e) => {
                  const updated = [...zones];
                  updated[i] = { ...zone, estimated_days_max: parseInt(e.target.value) || 0 };
                  setZones(updated);
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShippingSettings;
