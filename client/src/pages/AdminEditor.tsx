import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useArticle, useCreateArticle, useUpdateArticle } from "@/hooks/use-articles";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArticleSchema } from "@shared/schema";

// Schema for the form - needs to handle coercion
const formSchema = insertArticleSchema.extend({
  categoryId: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminEditor() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/edit/:id");
  const isEdit = !!match;
  const articleId = params ? parseInt(params.id) : 0;
  
  const { data: categories } = useCategories();
  const { data: article, isLoading: articleLoading } = useArticle(articleId);
  
  const { mutateAsync: createArticle, isPending: creating } = useCreateArticle();
  const { mutateAsync: updateArticle, isPending: updating } = useUpdateArticle();
  
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      summary: "",
      content: "",
      coverImageUrl: "",
      categoryId: 1,
      isPublished: false,
      isFeatured: false,
      authorId: user?.id || "",
    }
  });

  // Redirect if not logged in
  if (!authLoading && !user) {
    setLocation("/");
    return null;
  }

  // Populate form on edit
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        subtitle: article.subtitle || "",
        summary: article.summary,
        content: article.content,
        coverImageUrl: article.coverImageUrl,
        categoryId: article.categoryId,
        isPublished: article.isPublished || false,
        isFeatured: article.isFeatured || false,
        authorId: article.authorId,
      });
    } else if (user && !isEdit) {
      form.setValue("authorId", user.id);
    }
  }, [article, isEdit, user, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateArticle({ id: articleId, ...data });
        toast({ title: "تم التحديث", description: "تم تحديث المقال بنجاح" });
      } else {
        await createArticle(data);
        toast({ title: "تم الإنشاء", description: "تم إنشاء المقال بنجاح" });
        setLocation("/admin");
      }
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  if (authLoading || (isEdit && articleLoading)) {
    return (
       <div className="flex h-screen items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
           <Button variant="ghost" size="icon" onClick={() => setLocation("/admin")}>
             <ArrowRight className="h-5 w-5" />
           </Button>
           <h1 className="text-3xl font-black">
             {isEdit ? "تعديل المقال" : "مقال جديد"}
           </h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">العنوان الرئيسي</Label>
            <Input id="title" {...form.register("title")} placeholder="أدخل عنوان المقال..." className="text-lg font-bold" />
            {form.formState.errors.title && <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">العنوان الفرعي</Label>
            <Input id="subtitle" {...form.register("subtitle")} placeholder="وصف قصير تحت العنوان..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">القسم</Label>
              <Select 
                value={String(form.watch("categoryId"))} 
                onValueChange={(val) => form.setValue("categoryId", parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">رابط الصورة</Label>
              <Input id="image" {...form.register("coverImageUrl")} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">الملخص</Label>
            <Textarea id="summary" {...form.register("summary")} className="h-24 resize-none" placeholder="ملخص يظهر في البطاقات..." />
            {form.formState.errors.summary && <p className="text-destructive text-sm">{form.formState.errors.summary.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">المحتوى</Label>
            <Textarea id="content" {...form.register("content")} className="min-h-[400px] font-serif text-lg leading-relaxed" placeholder="اكتب محتوى المقال هنا..." />
            {form.formState.errors.content && <p className="text-destructive text-sm">{form.formState.errors.content.message}</p>}
          </div>

          <div className="flex gap-6 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="isPublished" 
                checked={form.watch("isPublished") || false}
                onCheckedChange={(checked) => form.setValue("isPublished", checked as boolean)}
              />
              <Label htmlFor="isPublished" className="cursor-pointer">نشر المقال</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="isFeatured" 
                checked={form.watch("isFeatured") || false}
                onCheckedChange={(checked) => form.setValue("isFeatured", checked as boolean)}
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">تمييز في الرئيسية</Label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/admin")}>
              إلغاء
            </Button>
            <Button type="submit" disabled={creating || updating} className="min-w-[120px]">
              {(creating || updating) ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? "حفظ التعديلات" : "نشر المقال")}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
