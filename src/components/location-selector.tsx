
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
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/context/language-context";

export function LocationSelector() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { language } = useLanguage();

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
    const hasRunLocationCheck = sessionStorage.getItem(`location_check_${user?.uid}`);

    if (user && !isUserDocLoading && userData && !userData.state && !hasRunLocationCheck) {
      setIsDialogOpen(true);
      sessionStorage.setItem(`location_check_${user.uid}`, 'true');
    }
  }, [user, userData, isUserDocLoading]);
  
  const handleSaveLocation = async () => {
    if (!selectedState || !selectedDistrict) {
      toast({
        variant: "destructive",
        title: t('incompleteSelection'),
        description: t('setLocationIncomplete'),
      });
      return;
    }
    if (!userDocRef) return;

    setIsSaving(true);
    try {
      await setDoc(userDocRef, { state: selectedState, district: selectedDistrict }, { merge: true });
      toast({
        title: t('locationSavedTitle'),
        description: t('locationSavedDesc', { district: selectedDistrict, state: selectedState }),
      });
      setIsDialogOpen(false);
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
          <DialogTitle>{t('setLocationWelcomeTitle')}</DialogTitle>
          <DialogDescription className="space-y-2 text-left">
             <p>{t('setLocationWelcomePara1')}</p>
             <p>{t('setLocationWelcomePara2')}</p>
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
