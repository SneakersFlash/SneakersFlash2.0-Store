import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import BlogService from "@/lib/api/blog.service";
import type { BlogCategory, BlogPost } from "@/types/blog.types";
import { buildImageUrl } from "@/lib/utils/imageUrl";
import { formatBlogDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { BlogListingClient } from "./BlogListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal — SneakersFlash",
  description:
    "Berita rilis, kolaborasi, interview, dan cerita terbaru dari dunia sneakers bersama SneakersFlash.",
  alternates: { canonical: "https://sneakersflash.com/blog" },
  openGraph: {
    title: "Journal — SneakersFlash",
    description:
      "Berita rilis, kolaborasi, interview, dan cerita terbaru dari dunia sneakers.",
    url: "https://sneakersflash.com/blog",
    type: "website",
  },
};

function postImage(post: BlogPost, preferCover = false): string | null {
  const raw = preferCover
    ? post.coverImageUrl || post.thumbnailUrl
    : post.thumbnailUrl || post.coverImageUrl;
  return raw ? buildImageUrl(raw) : null;
}

// ─── Hero "Latest News" ───────────────────────────────────────────────────────
function FeaturedHero({
  hero,
  secondary,
}: {
  hero: BlogPost;
  secondary: BlogPost[];
}) {
  const heroImg = postImage(hero, true);

  return (
    <section className="container-2xl">
      <div className="mb-6 flex items-center gap-2">
        <span className="h-2 w-2 animate-bolt-pulse bg-primary" />
        <p className="label">Latest News</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Big hero */}
        <Link
          href={`/blog/${hero.slug}`}
          className={cn(
            "group relative block overflow-hidden border border-border bg-card",
            secondary.length > 0 ? "lg:col-span-2" : "lg:col-span-3",
          )}
        >
          <div className="relative min-h-[380px] w-full md:min-h-[480px]">
            {heroImg ? (
              <Image
                src={heroImg}
                alt={hero.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Newspaper className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="mb-3 flex items-center gap-3">
                {hero.category && (
                  <span className="badge-primary">{hero.category.name}</span>
                )}
                <span className="text-[11px] uppercase tracking-widest text-white/70">
                  {formatBlogDate(hero.publishedAt || hero.createdAt)}
                </span>
              </div>
              <h2 className="max-w-2xl font-display text-2xl font-bold uppercase leading-tight tracking-wide text-white line-clamp-3 md:text-4xl">
                {hero.title}
              </h2>
              {hero.excerpt && (
                <p className="mt-3 max-w-xl font-body text-sm text-white/70 line-clamp-2 md:text-base">
                  {hero.excerpt}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                Baca Cerita
                <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        </Link>

        {/* Secondary list */}
        {secondary.length > 0 && (
          <div className="flex flex-col gap-4">
            {secondary.map((post) => {
              const img = postImage(post);
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-1 gap-4 border border-border bg-card p-3 transition-colors hover:border-primary/60"
                >
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-muted">
                    {img ? (
                      <Image
                        src={img}
                        alt={post.title}
                        fill
                        sizes="128px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Newspaper className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    {post.category && (
                      <p className="label mb-1 text-[10px]">
                        {post.category.name}
                      </p>
                    )}
                    <h3 className="font-display text-sm font-bold uppercase leading-tight tracking-wide text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {formatBlogDate(post.publishedAt || post.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function BlogPage() {
  let featured: BlogPost[] = [];
  let categories: BlogCategory[] = [];

  try {
    [featured, categories] = await Promise.all([
      BlogService.getFeatured(4),
      BlogService.getCategories(),
    ]);
  } catch {
    // Biarkan kosong — halaman tetap tampil dengan empty state
  }

  const hero = featured[0] ?? null;
  const secondary = featured.slice(1, 4);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Page header */}
      <div className="container-2xl pt-8 md:pt-12">
        <div className="mb-3 h-1 w-12 bg-primary" />
        <p className="label mb-2">SneakersFlash</p>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-6xl">
          The Journal
        </h1>
        <p className="mt-3 max-w-xl font-body text-muted-foreground">
          Berita rilis, kolaborasi, interview, dan cerita dari dunia sneakers.
        </p>
      </div>

      {/* Hero featured */}
      {hero && (
        <div className="mt-8 md:mt-10">
          <FeaturedHero hero={hero} secondary={secondary} />
        </div>
      )}

      {/* All articles */}
      <div className="container-2xl mt-14">
        <BlogListingClient categories={categories} />
      </div>
    </div>
  );
}
