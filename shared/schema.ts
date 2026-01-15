import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export auth models
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  authorId: text("author_id").references(() => users.id).notNull(),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));


// === SCHEMAS ===

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true, views: true });

// === TYPES ===

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Request Types
export type CreateArticleRequest = InsertArticle;
export type UpdateArticleRequest = Partial<InsertArticle>;

// Response Types
// We might want to include category name and author name in responses often
export type ArticleResponse = Article & {
  category?: Category;
  author?: { firstName: string | null; lastName: string | null; profileImageUrl: string | null };
};

export interface PaginatedArticles {
  items: ArticleResponse[];
  total: number;
  page: number;
  limit: number;
}
