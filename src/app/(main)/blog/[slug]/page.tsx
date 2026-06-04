import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, Newspaper, Tag, User } from "lucide-react";
import BlogService from "@/lib/api/blog.service";
import type { BlogPost } from "@/types/blog.types";
import { buildImageUrl } from "@/lib/utils/imageUrl";
import { formatBlogDate } from "@/lib/utils/date";
import { BlogCard } from "@/components/blog/BlogCard";

export const dynamic = "force-dynamic";

type BlogDetailProps = {
  params: Promise<{ slug: string }>;
};

// React.cache → satu request hanya panggil API sekali (metadata + page)
const getPost = cache((slug: string) => BlogService.getPostBySlug(slug));

export async function generateMetadata({
  params,
}: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;

  let post: BlogPost;
  try {
    post = await getPost(slug);
  } catch {
    return { title: "Artikel Tidak Ditemukan — SneakersFlash" };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const rawImage = post.coverImageUrl || post.thumbnailUrl;
  const ogImage = rawImage ? buildImageUrl(rawImage) : "";
  const url = `https://sneakersflash.com/blog/${post.slug}`;

  return {
    title: `${title} — SneakersFlash`,
    description,
    keywords: post.metaKeywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;

  let post: BlogPost;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }

  // Cerita lain dari kategori yang sama
  let related: BlogPost[] = [];
  try {
    const res = await BlogService.getPosts({
      limit: 4,
      category: post.category?.slug,
    });
    related = res.data.filter((p) => p.slug !== post.slug).slice(0, 3);
  } catch {
    // abaikan — section related cukup disembunyikan
  }

  const rawCover = post.coverImageUrl || post.thumbnailUrl;
  const coverImg = rawCover ? buildImageUrl(rawCover) : null;
  const date = post.publishedAt || post.createdAt;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* ── Hero ── */}
      <header className="relative w-full overflow-hidden">
        <div className="relative h-[360px] w-full md:h-[520px]">
          {coverImg ? (
            <Image
              src={coverImg}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-background">
              <Newspaper className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-black/30" />

          <div className="container-xl absolute inset-x-0 bottom-0">
            <div className="max-w-3xl pb-8 md:pb-12">
              {post.category && (
                <span className="badge-primary">{post.category.name}</span>
              )}
              <h1 className="mt-4 font-display text-3xl font-bold uppercase leading-tight tracking-wide text-foreground md:text-5xl">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} /> {formatBlogDate(date)}
                </span>
                {post.author?.name && (
                  <span className="inline-flex items-center gap-1.5">
                    <User size={13} /> {post.author.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={13} /> {post.viewCount} views
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <article className="container-xl mt-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} /> Kembali ke Journal
          </Link>

          {post.excerpt && (
            <p className="mb-8 border-l-2 border-primary pl-4 font-body text-lg leading-relaxed text-foreground/90">
              {post.excerpt}
            </p>
          )}

          {post.contentHtml ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          ) : (
            <p className="font-body text-sm text-muted-foreground">
              Konten artikel belum tersedia.
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <Tag size={14} className="text-muted-foreground" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-border px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section className="container-2xl mt-16">
          <h2 className="section-heading mb-8">Cerita Lainnya</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <BlogCard key={item.id} post={item} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
