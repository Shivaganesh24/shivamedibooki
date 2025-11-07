
"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { indianStates } from "@/lib/india-data";
import { simulateMalariaRates } from "@/ai/flows/simulate-malaria-rates";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function LocationSelector() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const districts = useMemo(() => {
    const state = indianStates.find((s) => s.name === selectedState);
    return state ? state.districts : [];
  }, [selectedState]);

  useEffect(() => {
    // This effect runs once when the user data is loaded.
    const hasRunLocationCheck = sessionStorage.getItem(`location_check_${user?.uid}`);

    if (user && !isUserDocLoading && userData && !userData.state && !hasRunLocationCheck) {
      setIsDialogOpen(true);
      sessionStorage.setItem(`location_check_${user.uid}`, 'true');
    }
  }, [user, userData, isUserDocLoading]);

  useEffect(() => {
    // This effect runs the simulation if location is set.
    const hasRunSimulation = sessionStorage.getItem(`simulation_ran_${user?.uid}`);
    if (user && userData?.state && userData?.district && !hasRunSimulation) {
      runSimulation(userData.state, userData.district);
      sessionStorage.setItem(`simulation_ran_${user.uid}`, 'true');
    }
  }, [user, userData]);

  const runSimulation = async (state: string, district: string) => {
    try {
      const result = await simulateMalariaRates({
        state,
        district,
        year1: new Date().getFullYear(),
      });

      const intensity = result.simulation.year1.intensity;
      if (intensity === "High" || intensity === "Very High") {
        toast({
          duration: 10000,
          title: "🚨 " + t('malariaAlertTitle'),
          description: (
            <div>
              <p>{t('malariaAlertDescription', { district, state })}</p>
              <p className="mt-2 font-semibold">{t('malariaAlertHealthTip')}: {result.comparison.healthTip}</p>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error("Failed to run background malaria simulation:", error);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedState || !selectedDistrict) {
      toast({
        variant: "destructive",
        title: "Selection required",
        description: "Please select both a state and a district.",
      });
      return;
    }
    if (!userDocRef) return;

    setIsSaving(true);
    try {
      await setDoc(userDocRef, { state: selectedState, district: selectedDistrict }, { merge: true });
      toast({
        title: "Location Saved",
        description: `Your location has been set to ${selectedDistrict}, ${selectedState}.`,
      });
      setIsDialogOpen(false);
      // Run simulation immediately after saving location
      runSimulation(selectedState, selectedDistrict);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your location. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('setLocationTitle')}</DialogTitle>
          <DialogDescription>
            {t('setLocationDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="state-select">{t('state')}</label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger id="state-select">
                <SelectValue placeholder={t('selectState')} />
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
            <label htmlFor="district-select">{t('district')}</label>
            <Select
              value={selectedDistrict}
              onValueChange={setSelectedDistrict}
              disabled={!selectedState}
            >
              <SelectTrigger id="district-select">
                <SelectValue placeholder={t('selectDistrict')} />
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
        </div>
        <DialogFooter>
          <Button onClick={handleSaveLocation} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('saveLocationButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
