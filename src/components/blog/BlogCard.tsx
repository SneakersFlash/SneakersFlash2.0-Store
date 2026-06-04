"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { buildImageUrl } from "@/lib/utils/imageUrl";
import { formatBlogDate } from "@/lib/utils/date";
import type { BlogPost } from "@/types/blog.types";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const rawImage = post.thumbnailUrl || post.coverImageUrl;
  const imageUrl = rawImage ? buildImageUrl(rawImage) : null;
  const date = post.publishedAt || post.createdAt;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden border border-border bg-card transition-colors duration-300 hover:border-primary/60"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Newspaper className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}

          {post.category && (
            <span className="badge-primary absolute left-3 top-3">
              {post.category.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4 md:p-5">
          <p className="label mb-2 text-[10px]">{formatBlogDate(date)}</p>

          <h3 className="font-display text-base font-bold uppercase leading-tight tracking-wide text-foreground line-clamp-2 transition-colors group-hover:text-primary md:text-lg">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-2 font-body text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-foreground">
            Baca Selengkapnya
            <ArrowUpRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
