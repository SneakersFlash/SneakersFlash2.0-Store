"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Truck, ShieldCheck, RotateCcw, CreditCard } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over Rp 500.000",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Every product is legit verified",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Encrypted & protected checkout",
  },
];

export function TrustBar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="container-2xl py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        {TRUST_ITEMS.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="bg-brand-gray-900 flex flex-col items-center text-center p-6 md:p-8 gap-3"
          >
            <div className="w-10 h-10 flex items-center justify-center border border-primary/30 bg-primary/5">
              <Icon size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-display text-sm uppercase tracking-wider font-bold">
                {title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
