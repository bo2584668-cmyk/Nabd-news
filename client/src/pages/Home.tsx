import { useArticles } from "@/hooks/use-articles";
import { useCategories } from "@/hooks/use-categories";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsTicker } from "@/components/NewsTicker";
import { ArticleCard } from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useArticles({ isFeatured: true, limit: 1 });
  const { data: latest, isLoading: loadingLatest } = useArticles({ limit: 6 });
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <NewsTicker />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-6 container mx-auto px-4">
          {loadingFeatured ? (
            <div className="h-[400px] w-full rounded-2xl bg-muted animate-pulse" />
          ) : featured?.items && featured.items.length > 0 ? (
            <ArticleCard article={featured.items[0]} featured={true} />
          ) : null}
        </section>

        {/* Latest News Grid */}
        <section className="py-8 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold border-r-4 border-primary pr-3">آخر الأخبار</h2>
            <Button variant="link" asChild>
              <Link href="/category/all">عرض الكل</Link>
            </Button>
          </div>

          {loadingLatest ? (
             <div className="flex justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest?.items.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Categories Sections */}
        {categories?.slice(0, 3).map(category => (
          <CategorySection key={category.id} categorySlug={category.slug} categoryName={category.name} />
        ))}

      </main>
      <Footer />
    </div>
  );
}

function CategorySection({ categorySlug, categoryName }: { categorySlug: string, categoryName: string }) {
  const { data } = useArticles({ categorySlug, limit: 4 });

  if (!data?.items.length) return null;

  return (
    <section className="py-8 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{categoryName}</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/category/${categorySlug}`}>المزيد من {categoryName}</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {data.items.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
