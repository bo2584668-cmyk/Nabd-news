import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function NewsTicker() {
  const news = [
    "عاجل: افتتاح مشروع الطاقة الشمسية الجديد في الصحراء الغربية",
    "وزارة الصحة تعلن عن انخفاض ملحوظ في معدلات الإصابة بالأمراض الموسمية",
    "المنتخب الوطني يستعد للمباراة الحاسمة في تصفيات كأس العالم",
    "تحديثات جديدة في أسواق المال العالمية وتوقعات بارتفاع الذهب"
  ];

  return (
    <div className="bg-foreground text-background py-2 overflow-hidden flex items-center relative z-40 border-b border-primary/20">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <Badge variant="destructive" className="shrink-0 animate-pulse hidden md:flex">
          عاجل
        </Badge>
        <div className="flex-1 overflow-hidden relative h-6">
           <motion.div 
             className="absolute whitespace-nowrap flex gap-16"
             animate={{ x: [1000, -1000] }}
             transition={{ 
               repeat: Infinity, 
               duration: 25, 
               ease: "linear",
               repeatType: "loop"
             }}
           >
             {news.map((item, i) => (
               <span key={i} className="text-sm font-medium inline-block">
                 {item}
               </span>
             ))}
           </motion.div>
        </div>
      </div>
    </div>
  );
}
