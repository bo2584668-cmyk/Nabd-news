import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t mt-auto py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <h3 className="text-2xl font-black text-primary">نبض الخبر</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              مصدرك الأول للأخبار الموثوقة والتحليلات العميقة. نغطي الأحداث لحظة بلحظة لنبقيك في قلب الحدث.
            </p>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-bold mb-4">أقسام الموقع</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/politics" className="hover:text-primary">سياسة</Link></li>
              <li><Link href="/category/economy" className="hover:text-primary">اقتصاد</Link></li>
              <li><Link href="/category/sports" className="hover:text-primary">رياضة</Link></li>
              <li><Link href="/category/tech" className="hover:text-primary">تكنولوجيا</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-4">معلومات عنا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-primary">اتصل بنا</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-primary">شروط الاستخدام</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-4">اشترك في النشرة</h4>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="البريد الإلكتروني"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                اشترك
              </button>
            </form>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} نبض الخبر. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
