import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth"; // For seed data if needed
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertCategorySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Categories ===
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get(api.categories.get.path, async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  });

  // === Articles ===
  app.get(api.articles.list.path, async (req, res) => {
    const { categorySlug, isFeatured, limit, page } = req.query;
    
    let categoryId: number | undefined;
    if (categorySlug) {
        const cat = await storage.getCategoryBySlug(String(categorySlug));
        if (cat) categoryId = cat.id;
        else return res.json({ items: [], total: 0, page: 1, limit: 10 }); // Return empty if cat not found
    }

    const limitNum = Number(limit) || 10;
    const pageNum = Number(page) || 1;
    const offset = (pageNum - 1) * limitNum;

    const result = await storage.getArticles({
        categoryId,
        isFeatured: isFeatured === 'true',
        limit: limitNum,
        offset
    });

    res.json({
        items: result.items,
        total: result.total,
        page: pageNum,
        limit: limitNum
    });
  });

  app.get(api.articles.get.path, async (req, res) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  });

  app.post(api.articles.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const input = api.articles.create.input.parse(req.body);
      const article = await storage.createArticle(input);
      res.status(201).json(article);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.articles.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = api.articles.update.input.parse(req.body);
      const article = await storage.updateArticle(Number(req.params.id), input);
      res.json(article);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return res.status(404).json({ message: "Article not found" });
    }
  });

  app.delete(api.articles.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    await storage.deleteArticle(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.articles.incrementView.path, async (req, res) => {
    await storage.incrementArticleView(Number(req.params.id));
    res.status(200).send();
  });

  // Seed Data function
  await seedData();

  return httpServer;
}

async function seedData() {
    const categoriesList = await storage.getCategories();
    let newsCatId, sportsCatId, artsCatId, techCatId;

    if (categoriesList.length === 0) {
        console.log("Seeding categories...");
        const news = await storage.createCategory({ name: "أخبار", slug: "news" });
        const sports = await storage.createCategory({ name: "رياضة", slug: "sports" });
        const arts = await storage.createCategory({ name: "فن", slug: "arts" });
        await storage.createCategory({ name: "اقتصاد", slug: "economy" });
        const tech = await storage.createCategory({ name: "تكنولوجيا", slug: "tech" });
        
        newsCatId = news.id;
        sportsCatId = sports.id;
        artsCatId = arts.id;
        techCatId = tech.id;
    } else {
        newsCatId = categoriesList.find(c => c.slug === 'news')?.id;
        sportsCatId = categoriesList.find(c => c.slug === 'sports')?.id;
        artsCatId = categoriesList.find(c => c.slug === 'arts')?.id;
        techCatId = categoriesList.find(c => c.slug === 'tech')?.id;
    }

    // Seed User & Articles if no articles exist
    const { total } = await storage.getArticles({ limit: 1 });
    if (total === 0 && newsCatId) {
        console.log("Seeding articles...");
        // Create a system user directly via DB to bypass auth storage logic if needed, 
        // but authStorage.upsertUser is fine.
        const systemUser = await authStorage.upsertUser({
            id: "system_admin",
            email: "admin@masrawy-clone.com",
            firstName: "System",
            lastName: "Admin",
            profileImageUrl: "https://placehold.co/100x100"
        });

        await storage.createArticle({
            title: "افتتاح مشروع جديد للطاقة المتجددة في الصحراء الغربية",
            subtitle: "خطوة كبيرة نحو مستقبل أخضر",
            content: "تم اليوم افتتاح أكبر محطة للطاقة الشمسية...",
            summary: "افتتاح محطة طاقة شمسية جديدة بقدرة 500 ميجا وات.",
            coverImageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            categoryId: newsCatId,
            authorId: systemUser.id,
            isPublished: true,
            isFeatured: true,
            views: 120
        });

        if (sportsCatId) {
            await storage.createArticle({
                title: "فوز المنتخب الوطني في المباراة الودية",
                subtitle: "أداء رائع من اللاعبين",
                content: "حقق المنتخب الوطني فوزاً مستحقاً...",
                summary: "المنتخب يفوز 2-0 في مباراة قوية.",
                coverImageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                categoryId: sportsCatId,
                authorId: systemUser.id,
                isPublished: true,
                isFeatured: false,
                views: 85
            });
        }
        
        if (techCatId) {
             await storage.createArticle({
                title: "إطلاق هاتف ذكي جديد بمواصفات ثورية",
                subtitle: "كاميرا بدقة 200 ميجابكسل",
                content: "أعلنت الشركة العالمية عن هاتفها الجديد...",
                summary: "مواصفات الهاتف الجديد وسعره في الأسواق.",
                coverImageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                categoryId: techCatId,
                authorId: systemUser.id,
                isPublished: true,
                isFeatured: false,
                views: 200
            });
        }
    }
}
