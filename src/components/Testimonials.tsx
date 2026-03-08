import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import EditableText from "@/components/EditableText";

const fallbackTestimonials = [
  { id: "f1", user_name: "Sarah M.", location: "New York, USA", comment: "Pawnest has been a game-changer for my two golden retrievers. The quality of food and toys is unmatched!", rating: 5, pet_info: "2 Dogs", user_avatar: "" },
  { id: "f2", user_name: "James L.", location: "Melbourne, Australia", comment: "Fast shipping to Australia and my cats absolutely love the scratching tower. Will definitely order again.", rating: 5, pet_info: "3 Cats", user_avatar: "" },
  { id: "f3", user_name: "Emma K.", location: "Toronto, Canada", comment: "The orthopedic dog bed is incredible. My senior lab sleeps so much better now. Thank you Pawnest!", rating: 5, pet_info: "1 Dog", user_avatar: "" },
  { id: "f4", user_name: "Aisha R.", location: "London, UK", comment: "Best pet store online! My parrot loves the new toys and the delivery was super fast.", rating: 5, pet_info: "1 Parrot", user_avatar: "" },
  { id: "f5", user_name: "David W.", location: "Auckland, NZ", comment: "Great selection of premium cat food. My fussy eater finally found something she loves!", rating: 4, pet_info: "2 Cats", user_avatar: "" },
  { id: "f6", user_name: "Maria S.", location: "Vancouver, Canada", comment: "The customer service is fantastic. They helped me pick the right harness for my puppy!", rating: 5, pet_info: "1 Dog", user_avatar: "" },
];

const Testimonials = () => {
  const { data: dbTestimonials = [] } = useQuery({
    queryKey: ["approved-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const testimonials = dbTestimonials.length > 0
    ? dbTestimonials
    : fallbackTestimonials;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <EditableText contentKey="testimonials_label" fallback="Testimonials" as="p" className="text-primary font-medium tracking-widest uppercase text-sm mb-3" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <EditableText contentKey="testimonials_title_1" fallback="What Pet Parents" as="span" />{" "}
            <EditableText contentKey="testimonials_title_2" fallback="Say" as="span" className="text-gradient-green" />
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((t, i) => (
                <CarouselItem key={t.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col"
                  >
                    <Quote className="h-6 w-6 text-primary/20 mb-3" />

                    {/* Rating with number */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-4 w-4 ${j < t.rating ? "fill-primary text-primary" : "text-muted"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-primary">{t.rating}.0</span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                      "{t.comment}"
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <Avatar className="h-10 w-10">
                        {t.user_avatar ? (
                          <AvatarImage src={t.user_avatar} alt={t.user_name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(t.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{t.user_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.location}</p>
                      </div>
                      {t.pet_info && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full whitespace-nowrap">
                          {t.pet_info}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 hidden md:flex" />
            <CarouselNext className="-right-4 hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
