import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistIds = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user.id);
      return (data || []).map((w) => w.product_id);
    },
    enabled: !!user,
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      const isWished = wishlistIds.includes(productId);
      if (isWished) {
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      }
      return !isWished;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
    },
  });

  return { wishlistIds, isLoading, toggleWishlist };
}
