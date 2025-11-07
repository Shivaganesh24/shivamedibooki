
"use client";

import { useState, useMemo, useTransition } from "react";
import {
  getLocalHealthAlerts,
  type GetLocalHealthAlertsOutput,
} from "@/ai/flows/get-local-health-alerts";
import { PageTitle } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { indianStates } from "@/lib/india-data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Info, Loader2, MapPin, Shield, Siren, Syringe, Activity } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useTranslation } from "@/hooks/use-translation";

const riskLevelStyles: { [key: string]: string } = {
  Low: "bg-green-500/20 text-green-400 border-green-500/30",
  Moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Elevated: "bg-red-500/20 text-red-400 border-red-500/30",
};

const riskLevelIcons: { [key: string]: React.ElementType } = {
    Low: Activity,
    Moderate: Siren,
    High: Siren,
    Elevated: Siren,
};

export default function YourLocationPage() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [alertsData, setAlertsData] = useState<GetLocalHealthAlertsOutput | null>(null);

  const districts = useMemo(() => {
    const state = indianStates.find((s) => s.name === selectedState);
    return state ? state.districts : [];
  }, [selectedState]);

  const handleFetchAlerts = () => {
    if (!selectedState || !selectedDistrict) {
      toast({
        variant: "destructive",
        title: t("incompleteSelection"),
        description: t("selectStateAndDistrict"),
      });
      return;
    }

    startTransition(async () => {
      setAlertsData(null);
      try {
        const languageMap = {
          en: "English",
          hi: "Hindi",
          kn: "Kannada",
        };
        const result = await getLocalHealthAlerts({
          state: selectedState,
          district: selectedDistrict,
          language: languageMap[language],
        });
        setAlertsData(result);
      } catch (error) {
        console.error("Error fetching health alerts:", error);
        toast({
          variant: "destructive",
          title: t("errorFetchingAlerts"),
          description: t("errorFetchingAlertsDesc"),
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <MapPin className="h-10 w-10 text-primary" />
        <PageTitle>{t("yourLocation")}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
        {t("yourLocationSubtitle")}
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">{t("selectYourLocation")}</CardTitle>
          <CardDescription>{t("selectYourLocationDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label htmlFor="state-select">{t("state")}</label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger id="state-select">
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
          </div>
          <div className="space-y-2">
            <label htmlFor="district-select">{t("district")}</label>
            <Select
              value={selectedDistrict}
              onValueChange={setSelectedDistrict}
              disabled={!selectedState}
            >
              <SelectTrigger id="district-select">
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
          </div>
          <Button onClick={handleFetchAlerts} disabled={isPending} className="w-full md:w-auto">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Siren className="mr-2 h-4 w-4" />
            )}
            {t("checkHealthAlerts")}
          </Button>
        </CardContent>
      </Card>

      {isPending && (
         <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>{t('generatingAlerts')}</p>
        </div>
      )}

      {alertsData && (
        <div className="mt-8 space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{t("disclaimer")}</AlertTitle>
                <AlertDescription>{alertsData.disclaimer}</AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Siren className="h-6 w-6 text-destructive" />
                        {t('simulatedHealthAlertsFor')} {selectedDistrict}, {selectedState}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {alertsData.alerts.map((alert, index) => {
                            const Icon = riskLevelIcons[alert.riskLevel] || Activity;
                            return (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-4">
                                        <Icon className={cn("h-5 w-5", riskLevelStyles[alert.riskLevel])} />
                                        <span className="font-semibold">{alert.diseaseName}</span>
                                        <Badge variant="outline" className={cn(riskLevelStyles[alert.riskLevel])}>{alert.riskLevel}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pl-6">
                                    <p className="text-muted-foreground">{alert.summary}</p>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><Shield className="h-4 w-4" /> {t('preventativeMeasures')}</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            {alert.preventativeMeasures.map((measure, i) => <li key={i}>{measure}</li>)}
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )})}
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Syringe className="h-6 w-6 text-green-400" />
                  {t("seasonalHealthTip")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {alertsData.seasonalTip}
                </p>
              </CardContent>
            </Card>

        </div>
      )}
    </div>
  );
}
