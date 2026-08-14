import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const CONTAINER_ID = "live-chat-embed";
const STYLE_ID = "live-chat-position-style";

const LiveChatWidget = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    let cancelled = false;

    const load = async () => {
      // Force the chat widget to the bottom-left on desktop
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
          @media (min-width: 768px) {
            iframe[title*="chat" i],
            iframe[id*="chat" i],
            iframe[class*="chat" i],
            div[class*="widget"] > iframe,
            .tawk-min-container,
            #tawkchat-container,
            #crisp-chatbox > div,
            #tidio-chat iframe {
              left: 16px !important;
              right: auto !important;
            }
          }
        `;
        document.head.appendChild(style);
      }

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
  }, [isMobile]);

  return null;
};

export default LiveChatWidget;
