
"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { PageTitle } from "@/components/icons";
import {
  getLocalHealthAlerts,
  type GetLocalHealthAlertsOutput,
} from "@/ai/flows/get-local-health-alerts";
import { indianStates } from "@/lib/india-data";
import { useLanguage } from "@/context/language-context";
import { useTranslation } from "@/hooks/use-translation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Lightbulb, ShieldCheck, Siren } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const riskStyles: { [key: string]: string } = {
  Low: "bg-green-500/20 text-green-400 border-green-500/30",
  Moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Elevated: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function YourLocationPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc(userDocRef);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isPending, startTransition] = useTransition();
  const [alerts, setAlerts] = useState<GetLocalHealthAlertsOutput | null>(null);

  const districts = useMemo(() => {
    const stateData = indianStates.find((s) => s.name === selectedState);
    return stateData ? stateData.districts : [];
  }, [selectedState]);

  useEffect(() => {
    if (userData?.state && userData?.district) {
      setSelectedState(userData.state);
      setSelectedDistrict(userData.district);
    }
  }, [userData]);

  const handleFetchAlerts = () => {
    if (!selectedState || !selectedDistrict) {
      toast({
        variant: "destructive",
        title: t("selectStateAndDistrict"),
      });
      return;
    }
    startTransition(async () => {
      setAlerts(null);
      try {
        const languageMap = { en: "English", hi: "Hindi", kn: "Kannada" };
        const result = await getLocalHealthAlerts({
          state: selectedState,
          district: selectedDistrict,
          language: languageMap[language],
        });
        setAlerts(result);
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
      <p className="mt-4 text-lg text-muted-foreground">
        {t("yourLocationSubtitle")}
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {t("selectYourLocation")}
            </CardTitle>
            <CardDescription>{t("selectYourLocationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
            <Button
              onClick={handleFetchAlerts}
              disabled={isPending || !selectedState || !selectedDistrict}
              className="w-full"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Siren className="mr-2 h-4 w-4" />
              )}
              {t("checkHealthAlerts")}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">
              {t("simulatedHealthAlertsFor")} {selectedDistrict || "..."}
            </CardTitle>
            <CardDescription>
              {alerts?.disclaimer ||
                "Select your location to see health alerts."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isPending ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>{t("generatingAlerts")}</p>
              </div>
            ) : alerts ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  {alerts.alerts.map((alert, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{alert.diseaseName}</h3>
                        <Badge variant="outline" className={cn(riskStyles[alert.riskLevel])}>
                          {alert.riskLevel} Risk
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {alert.summary}
                      </p>
                      <div className="mt-4">
                        <h4 className="font-semibold flex items-center gap-2">
                           <ShieldCheck className="h-4 w-4 text-green-400" /> {t("preventativeMeasures")}
                        </h4>
                        <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {alert.preventativeMeasures.map((measure, i) => (
                            <li key={i}>{measure}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                 <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>{t('seasonalHealthTip')}</AlertTitle>
                    <AlertDescription>
                        {alerts.seasonalTip}
                    </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                <p>Health alerts for your selected area will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
