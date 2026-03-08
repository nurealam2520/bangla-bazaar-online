import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ContentMap = Record<string, string>;

let globalCache: ContentMap = {};
let listeners: Array<() => void> = [];
let fetched = false;

const notifyListeners = () => listeners.forEach((l) => l());

export const useSiteContent = () => {
  const [content, setContent] = useState<ContentMap>(globalCache);
  const [loading, setLoading] = useState(!fetched);

  useEffect(() => {
    const listener = () => setContent({ ...globalCache });
    listeners.push(listener);

    if (!fetched) {
      supabase
        .from("site_content")
        .select("key, value")
        .then(({ data }) => {
          if (data) {
            globalCache = {};
            data.forEach((row: { key: string; value: string }) => {
              globalCache[row.key] = row.value;
            });
            fetched = true;
            setLoading(false);
            notifyListeners();
          }
        });
    }

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const get = useCallback(
    (key: string, fallback: string = "") => content[key] ?? fallback,
    [content]
  );

  const update = useCallback(async (key: string, value: string) => {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value }, { onConflict: "key" });

    if (!error) {
      globalCache[key] = value;
      notifyListeners();
    }
    return !error;
  }, []);

  return { get, update, loading };
};
