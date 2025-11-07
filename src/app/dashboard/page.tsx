
"use client";

import { PageTitle } from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/hooks/use-translation";
import { healthTips } from "@/lib/data";
import { BookOpenText } from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();
  
  const translatedHealthTips = [
    { question: t('tip1Question'), answer: t('tip1Answer') },
    { question: t('tip2Question'), answer: t('tip2Answer') },
    { question: t('tip3Question'), answer: t('tip3Answer') },
    { question: t('tip4Question'), answer: t('tip4Answer') },
    { question: t('tip5Question'), answer: t('tip5Answer') }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <BookOpenText className="h-10 w-10 text-primary" />
        <PageTitle>{t('healthTipsDashboardTitle')}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        {t('healthTipsDashboardSubtitle')}
      </p>

      <div className="mt-8 max-w-4xl">
        <Accordion type="single" collapsible className="w-full">
          {translatedHealthTips.map((tip, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">
                {tip.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {tip.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
