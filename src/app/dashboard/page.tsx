
"use client";

import { PageTitle } from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/hooks/use-translation";
import { BookOpenText, MapPin, Microscope, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useTransition } from "react";
import { indianStates } from "@/lib/india-data";
import { simulateMalariaRates } from "@/ai/flows/simulate-malaria-rates";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const districts = useMemo(() => {
    const state = indianStates.find((s) => s.name === selectedState);
    return state ? state.districts : [];
  }, [selectedState]);

  const translatedHealthTips = [
    { question: t("tip1Question"), answer: t("tip1Answer") },
    { question: t("tip2Question"), answer: t("tip2Answer") },
    { question: t("tip3Question"), answer: t("tip3Answer") },
    { question: t("tip4Question"), answer: t("tip4Answer") },
    { question: t("tip5Question"), answer: t("tip5Answer") },
  ];

  const dashboardImage = useMemo(
    () => PlaceHolderImages.find((p) => p.id === "health-tips-main"),
    []
  );

  const handleLocationCheck = () => {
    if (!selectedState || !selectedDistrict) {
      toast({
        variant: "destructive",
        title: t("incompleteSelection"),
        description: t("setLocationIncomplete"),
      });
      return;
    }

    startTransition(async () => {
      try {
        const languageMap = {
          en: "English",
          hi: "Hindi",
          kn: "Kannada",
        };
        const result = await simulateMalariaRates({
          state: selectedState,
          district: selectedDistrict,
          year1: new Date().getFullYear(),
          language: languageMap[language],
        });

        const intensity = result.simulation.year1.intensity;
        if (intensity === "High" || intensity === "Very High") {
          toast({
            duration: 10000,
            variant: "destructive",
            title: "🚨 " + t("malariaAlertTitle"),
            description: (
              <div>
                <p>
                  {t("malariaAlertDescription", {
                    district: selectedDistrict,
                    state: selectedState,
                  })}
                </p>
                <p className="mt-2 font-semibold">
                  {t("malariaAlertHealthTip")}: {result.comparison.healthTip}
                </p>
              </div>
            ),
          });
        } else {
          toast({
            title: t('simulationCompleteTitle'),
            description: t('simulationCompleteDesc', { district: selectedDistrict, intensity: t(intensity.toLowerCase()) }),
          });
        }
      } catch (error) {
        console.error("Failed to run location health check:", error);
        toast({
          variant: "destructive",
          title: t("simulationFailed"),
          description: t("simulationFailedDesc"),
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <BookOpenText className="h-10 w-10 text-primary" />
        <PageTitle>{t("healthTipsDashboardTitle")}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        {t("healthTipsDashboardSubtitle")}
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MapPin />
                    {t('locationHealthCheckTitle')}
                </CardTitle>
                <CardDescription>
                    {t('locationHealthCheckDesc')}
                </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                    <SelectValue placeholder={t("selectState")} />
                    </SelectTrigger>
                    <SelectContent>
                    {indianStates.map((state) => (
                        <SelectItem key={state.name} value={state.name}>
                        {state.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select
                    value={selectedDistrict}
                    onValueChange={setSelectedDistrict}
                    disabled={!selectedState}
                >
                    <SelectTrigger>
                    <SelectValue placeholder={t("selectDistrict")} />
                    </SelectTrigger>
                    <SelectContent>
                    {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                        {district}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleLocationCheck}
                    disabled={isPending || !selectedDistrict}
                    className="w-full sm:w-auto"
                >
                    {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Microscope className="mr-2 h-4 w-4" />
                    )}
                    {t('checkAreaButton')}
                </Button>
                </CardContent>
            </Card>

            <div className="max-w-4xl">
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

        <div className="hidden lg:block relative w-full h-full min-h-[500px] rounded-lg overflow-hidden">
            {dashboardImage && (
                <Image
                    src={dashboardImage.imageUrl}
                    alt={dashboardImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={dashboardImage.imageHint}
                />
            )}
        </div>
      </div>
    </div>
  );
}
