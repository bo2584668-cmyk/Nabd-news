import { useRoute, Link } from "wouter";
import { useArticle, useIncrementView } from "@/hooks/use-articles";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2, User, Clock, Eye, Share2 } from "lucide-react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ArticleDetails() {
  const [match, params] = useRoute("/article/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: article, isLoading, error } = useArticle(id);
  const { mutate: incrementView } = useIncrementView();

  useEffect(() => {
    if (id && article) {
      incrementView(id);
    }
  }, [id, article, incrementView]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-gray-300">404</h1>
          <p className="text-muted-foreground">المقال غير موجود</p>
          <Button asChild><Link href="/">العودة للرئيسية</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Stock image fallback for article content
  const heroImage = article.coverImageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          {article.category && (
            <Link href={`/category/${article.category.slug}`} className="hover:text-primary">{article.category.name}</Link>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          {article.category && (
             <span className="text-primary font-bold">{article.category.name}</span>
          )}
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-foreground">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {article.subtitle}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-3 mt-2">
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author.firstName} {article.author.lastName}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(article.createdAt || new Date()), "EEEE، d MMMM yyyy - p", { locale: arEG })}</span>
            </div>
            <div className="flex items-center gap-1 mr-auto">
              <Eye className="h-4 w-4" />
              <span>{article.views} مشاهدة</span>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              مشاركة
            </Button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-10 shadow-lg">
          <img 
            src={heroImage} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <article className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-gray-700 prose-p:leading-loose">
          {/* Simple whitespace handling for now. Ideally this is HTML from a rich text editor. */}
          {article.content.split('\n').map((paragraph, idx) => (
             <p key={idx}>{paragraph}</p>
          ))}
        </article>
      </main>
      <Footer />
    </div>
  );
}
