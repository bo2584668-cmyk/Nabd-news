import { Link } from "wouter";
import { type ArticleResponse } from "@shared/schema";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

interface ArticleCardProps {
  article: ArticleResponse;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  // Fallback image if coverImageUrl is missing or broken
  const bgImage = article.coverImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80";

  if (featured) {
    return (
      <Link href={`/article/${article.id}`} className="group relative h-[400px] w-full overflow-hidden rounded-2xl block shadow-lg cursor-pointer">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 w-full p-6 md:p-8 flex flex-col gap-3">
          {article.category && (
            <span className="w-fit bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-bold">
              {article.category.name}
            </span>
          )}
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-md">
            {article.title}
          </h2>
          <p className="text-gray-200 line-clamp-2 max-w-2xl text-sm md:text-base hidden md:block">
            {article.summary}
          </p>
          <div className="flex items-center gap-4 text-gray-300 text-xs mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(article.createdAt || new Date()), "d MMMM yyyy", { locale: arEG })}
            </div>
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {article.author.firstName} {article.author.lastName}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.id}`} className="group flex flex-col gap-3 cursor-pointer">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted relative shadow-sm border border-border/50">
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {article.category && (
          <span className="absolute top-2 right-2 bg-background/90 backdrop-blur text-foreground px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-xs line-clamp-2">
          {article.summary}
        </p>
        <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {format(new Date(article.createdAt || new Date()), "d MMMM yyyy", { locale: arEG })}
        </span>
      </div>
    </Link>
  );
}
