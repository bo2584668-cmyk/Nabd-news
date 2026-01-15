import { useRoute } from "wouter";
import { useArticles } from "@/hooks/use-articles";
import { useCategory } from "@/hooks/use-categories";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Loader2 } from "lucide-react";

export default function CategoryPage() {
  const [match, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  
  const { data: category } = useCategory(slug);
  const { data: articles, isLoading } = useArticles({ categorySlug: slug, limit: 20 });

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 mb-8 border-b pb-4">
          <h1 className="text-4xl font-black text-primary">
            {category?.name || "..."}
          </h1>
          <p className="text-muted-foreground">أحدث الأخبار والمقالات في قسم {category?.name}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles?.items.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
            {articles?.items.length === 0 && (
              <p className="col-span-full text-center py-10 text-muted-foreground">
                لا توجد مقالات في هذا القسم بعد.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
