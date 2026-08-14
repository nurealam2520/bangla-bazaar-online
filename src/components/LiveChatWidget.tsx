import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CONTAINER_ID = "live-chat-embed";

const LiveChatWidget = () => {
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "live_chat_script")
        .maybeSingle();

      const raw = data?.value?.trim();
      if (!raw || cancelled) return;
      if (document.getElementById(CONTAINER_ID)) return;

      const container = document.createElement("div");
      container.id = CONTAINER_ID;
      document.body.appendChild(container);

      // Parse the embed code and re-create scripts so the browser executes them
      const parsed = new DOMParser().parseFromString(raw, "text/html");
      parsed.head.childNodes.forEach((n) => container.appendChild(n.cloneNode(true)));
      parsed.body.childNodes.forEach((n) => container.appendChild(n.cloneNode(true)));

      container.querySelectorAll("script").forEach((oldScript) => {
        const s = document.createElement("script");
        Array.from(oldScript.attributes).forEach((a) => s.setAttribute(a.name, a.value));
        s.text = oldScript.textContent ?? "";
        oldScript.replaceWith(s);
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default LiveChatWidget;
