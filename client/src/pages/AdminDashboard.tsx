import { useAuth } from "@/hooks/use-auth";
import { useArticles, useDeleteArticle } from "@/hooks/use-articles";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: articles, isLoading: articlesLoading } = useArticles({ limit: 50 });
  const { mutateAsync: deleteArticle } = useDeleteArticle();
  const { toast } = useToast();

  if (authLoading) return null;
  
  if (!user) {
    setLocation("/");
    return null;
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id);
      toast({ title: "تم الحذف", description: "تم حذف المقال بنجاح" });
    } catch (e) {
      toast({ title: "خطأ", description: "فشل حذف المقال", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">لوحة التحكم</h1>
            <p className="text-muted-foreground">إدارة المقالات والمحتوى</p>
          </div>
          <Button asChild className="gap-2 shadow-lg">
            <Link href="/admin/new">
              <Plus className="h-4 w-4" />
              مقال جديد
            </Link>
          </Button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm">
          {articlesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-[400px]">العنوان</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المشاهدات</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles?.items.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="line-clamp-1">{article.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{article.subtitle}</span>
                      </div>
                    </TableCell>
                    <TableCell>{article.category?.name}</TableCell>
                    <TableCell>
                      {article.isPublished ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">منشور</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">مسودة</span>
                      )}
                    </TableCell>
                    <TableCell>{article.views}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(article.createdAt || new Date()), "d MMM yyyy", { locale: arEG })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/edit/${article.id}`}>
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                           <Link href={`/article/${article.id}`}>
                             <Eye className="h-4 w-4 text-gray-500" />
                           </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف المقال "{article.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive hover:bg-destructive/90">
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
