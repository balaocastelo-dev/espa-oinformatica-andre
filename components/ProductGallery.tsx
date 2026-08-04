"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/format";

export default function ProductGallery({ product }: { product: Product }) {
  const images = (product.image_urls?.length ? product.image_urls : [product.image])
    .map((src) => src.trim())
    .filter(Boolean);
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)] ?? product.image;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <Image
          key={current}
          src={current}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4 sm:p-6"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1} de ${images.length}`}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition sm:h-16 sm:w-16 ${
                i === active
                  ? "border-[#E60012]"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
