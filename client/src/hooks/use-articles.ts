import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateArticleRequest, type UpdateArticleRequest } from "@shared/routes";

// List Articles
export function useArticles(filters?: { categorySlug?: string; isFeatured?: boolean; limit?: number; page?: number }) {
  // Construct query key including filters to ensure caching works correctly
  const queryKey = [api.articles.list.path, filters];
  
  // Construct URL with query params
  const params: Record<string, string | number> = {};
  if (filters?.categorySlug) params.categorySlug = filters.categorySlug;
  if (filters?.isFeatured !== undefined) params.isFeatured = String(filters.isFeatured);
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.page) params.page = filters.page;
  
  const queryString = new URLSearchParams(params as any).toString();
  const url = `${api.articles.list.path}?${queryString}`;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      return api.articles.list.responses[200].parse(await res.json());
    },
  });
}

// Get Single Article
export function useArticle(id: number) {
  return useQuery({
    queryKey: [api.articles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.articles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch article");
      return api.articles.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Create Article
export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateArticleRequest) => {
      const res = await fetch(api.articles.create.path, {
        method: api.articles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
           const err = await res.json();
           throw new Error(err.message || "Validation failed");
        }
        throw new Error("Failed to create article");
      }
      return api.articles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
    },
  });
}

// Update Article
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateArticleRequest) => {
      const url = buildUrl(api.articles.update.path, { id });
      const res = await fetch(url, {
        method: api.articles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update article");
      return api.articles.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.articles.get.path, data.id] });
    },
  });
}

// Delete Article
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.articles.delete.path, { id });
      const res = await fetch(url, { 
        method: api.articles.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
    },
  });
}

// Increment View
export function useIncrementView() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.articles.incrementView.path, { id });
      await fetch(url, { method: api.articles.incrementView.method });
    }
  });
}
