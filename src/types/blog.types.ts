export type BlogPostStatus = "draft" | "published" | "archived";

export interface BlogCategory {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  postCount?: number;
}

export interface BlogAuthor {
  name: string | null;
}

export interface BlogPostCategoryRef {
  id: string | number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string | number;
  categoryId: string | number;
  authorId: string | number;
  title: string;
  slug: string;
  excerpt?: string | null;
  contentHtml?: string;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  status: BlogPostStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: BlogPostCategoryRef | null;
  author?: BlogAuthor | null;
}

export interface BlogListResponse {
  data: BlogPost[];
  meta: { total: number; page: number; limit: number; lastPage: number };
}
