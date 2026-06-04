import apiClient from "./client";
import type {
  BlogCategory,
  BlogListResponse,
  BlogPost,
} from "@/types/blog.types";

interface GetPostsParams {
  page?: number;
  limit?: number;
  category?: string;
}

const BlogService = {
  /** Daftar artikel published (pagination + filter kategori). */
  async getPosts(params: GetPostsParams = {}): Promise<BlogListResponse> {
    const { data } = await apiClient.get<BlogListResponse>("/blog/posts", {
      params,
    });
    return data;
  },

  /** Artikel unggulan untuk hero "Latest News". */
  async getFeatured(limit = 5): Promise<BlogPost[]> {
    const { data } = await apiClient.get<BlogPost[]>("/blog/posts/featured", {
      params: { limit },
    });
    return data;
  },

  /** Detail satu artikel (sekaligus menambah view count di backend). */
  async getPostBySlug(slug: string): Promise<BlogPost> {
    const { data } = await apiClient.get<BlogPost>(`/blog/posts/${slug}`);
    return data;
  },

  /** Kategori blog aktif. */
  async getCategories(): Promise<BlogCategory[]> {
    const { data } = await apiClient.get<BlogCategory[]>("/blog/categories");
    return data;
  },
};

export default BlogService;
