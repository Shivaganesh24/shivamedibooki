import { PageTitle } from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { healthTips } from "@/lib/data";
import { BookOpenText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <BookOpenText className="h-10 w-10 text-primary" />
        <PageTitle>Health Tips Dashboard</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        Common health and safety questions, answered for you.
      </p>

      <div className="mt-8 max-w-4xl">
        <Accordion type="single" collapsible className="w-full">
          {healthTips.map((tip, index) => (
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
