"use client";

import { useCallback, useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import BlogService from "@/lib/api/blog.service";
import type { BlogCategory, BlogPost } from "@/types/blog.types";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/common/Pagination";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 9;

interface BlogListingClientProps {
  categories: BlogCategory[];
}

function CategoryPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-4 py-2 font-display text-xs uppercase tracking-widest transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-border bg-card">
          <div className="skeleton aspect-[4/3] w-full" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogListingClient({ categories }: BlogListingClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    lastPage: 1,
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await BlogService.getPosts({
        page,
        limit: PAGE_SIZE,
        category: activeCategory ?? undefined,
      });
      setPosts(res.data);
      setMeta(res.meta);
    } catch {
      setPosts([]);
      setMeta({ total: 0, page: 1, limit: PAGE_SIZE, lastPage: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [page, activeCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCategory = (slug: string | null) => {
    setActiveCategory(slug);
    setPage(1);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section>
      {/* Heading + filter */}
      <div className="mb-8 flex flex-col gap-5">
        <h2 className="section-heading">Semua Artikel</h2>
        <div className="flex flex-wrap gap-2">
          <CategoryPill
            active={activeCategory === null}
            onClick={() => handleCategory(null)}
          >
            Semua
          </CategoryPill>
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              active={activeCategory === cat.slug}
              onClick={() => handleCategory(cat.slug)}
            >
              {cat.name}
            </CategoryPill>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <GridSkeleton />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border py-20 text-center">
          <Newspaper className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-lg uppercase tracking-wide text-foreground">
            Belum Ada Artikel
          </p>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Cerita terbaru akan segera hadir di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && meta.lastPage > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.lastPage}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
