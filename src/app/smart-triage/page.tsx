
"use client";

import { generateTriageRecommendation, type GenerateTriageRecommendationOutput } from "@/ai/flows/generate-triage-recommendation";
import { MedbookIcon, PageTitle } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { doctors, triageDoctorMapping } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Bot, FileImage, FileText, Loader2, Sparkles, User, Volume2, Wand2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, DragEvent } from "react";
import { useLanguage } from "@/context/language-context";
import { useTranslation } from "@/hooks/use-translation";

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const severityStyles: { [key: string]: string } = {
    Mild: "bg-green-500/20 text-green-400 border-green-500/30",
    Moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Severe: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Emergency": "bg-red-500/20 text-red-400 border-red-500/30",
};


const FileDropzone = ({
  id,
  label,
  Icon,
  file,
  setFile,
  accept
}: {
  id: string;
  label: string;
  Icon: React.ElementType;
  file: File | null;
  setFile: (file: File | null) => void;
  accept: string;
}) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 4MB." });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] || null);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith(accept.replace('/*', ''))) {
        handleFileSelect(droppedFile);
    } else {
        toast({ variant: "destructive", title: "Invalid file type", description: `Please drop a valid file type (${accept}).` });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <div 
        className={cn("relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer text-center text-sm h-24",
          isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
          file ? "border-primary/50" : ""
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEvents}
        onDrop={handleDrop}
        onClick={() => document.getElementById(id)?.click()}
      >
        <p className="text-muted-foreground">
          {file ? file.name : isDragging ? 'Drop to upload' : 'Drag & drop or click'}
        </p>
        <Input id={id} type="file" accept={accept} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
         {file && (
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={(e) => { e.stopPropagation(); setFile(null);}}>
                <X className="h-4 w-4" />
            </Button>
        )}
      </div>
    </div>
  );
};


export default function SmartTriagePage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { language } = useLanguage();
    const { t } = useTranslation();

    const [symptoms, setSymptoms] = useState("");
    const [symptomImage, setSymptomImage] = useState<File | null>(null);
    const [medicalReport, setMedicalReport] = useState<File | null>(null);
    const [recommendation, setRecommendation] = useState<GenerateTriageRecommendationOutput | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isAyurvedaMode, setIsAyurvedaMode] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleGetRecommendation = async () => {
        if (!symptoms) {
            toast({ variant: "destructive", title: "Symptoms required", description: "Please describe your symptoms." });
            return;
        }

        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to get a recommendation." });
            return;
        }

        startTransition(async () => {
            setRecommendation(null);
            setAudioUrl(null);
            try {
                const symptomImageUri = symptomImage ? await fileToDataUri(symptomImage) : undefined;
                const medicalReportUri = medicalReport ? await fileToDataUri(medicalReport) : undefined;

                const languageMap = {
                    en: 'English',
                    hi: 'Hindi',
                    kn: 'Kannada'
                }

                const result = await generateTriageRecommendation({
                    symptoms,
                    symptomImage: symptomImageUri,
                    medicalReport: medicalReportUri,
                    isAyurvedaMode: isAyurvedaMode,
                    language: languageMap[language],
                });
                setRecommendation(result);

                // Save recommendation to Firestore
                const recommendationsCol = collection(firestore, `users/${user.uid}/triageRecommendations`);
                addDocumentNonBlocking(recommendationsCol, {
                    ...result,
                    symptoms: symptoms,
                    createdAt: serverTimestamp(),
                    userId: user.uid,
                });

            } catch (error) {
                console.error("Error getting recommendation:", error);
                toast({ variant: "destructive", title: "Analysis Failed", description: "An error occurred. Please try again." });
            }
        });
    };

    const handleTextToSpeech = async () => {
        if (!recommendation?.summary) return;
        setIsAudioLoading(true);
        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: recommendation.summary }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to generate audio' }));
                throw new Error(errorData.error || 'Failed to generate audio');
            }

            const result = await response.json();
            setAudioUrl(result.media);
        } catch (error: any) {
            console.error("Error generating speech:", error);
            toast({ variant: "destructive", title: "Audio Failed", description: error.message || "Could not generate audio summary." });
        } finally {
            setIsAudioLoading(false);
        }
    };
    
    const suggestedDoctors = recommendation?.suggestedDoctors.flatMap(specialty => 
        triageDoctorMapping[specialty as keyof typeof triageDoctorMapping]?.flatMap(docSpecialty => 
            doctors.filter(d => d.specialty === docSpecialty)
        ) || []
    )
    .filter((v,i,a) => a.findIndex(t => (t.id === v.id)) === i); // unique doctors

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-4">
                <Bot className="h-10 w-10 text-primary" />
                <PageTitle>{t('smartTriage')}</PageTitle>
            </div>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
                {t('smartTriageSubtitle')}
            </p>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-between gap-2">
                           <div className="flex items-center gap-2">
                             <User className="h-6 w-6" /> {t('yourInformationTitle')}
                           </div>
                           <div className="flex items-center space-x-2">
                                <Switch id="ayurveda-mode" checked={isAyurvedaMode} onCheckedChange={setIsAyurvedaMode} />
                                <Label htmlFor="ayurveda-mode">{t('ayurvedaModeLabel')}</Label>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            {t('provideDetailsDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">{t('describeSymptomsLabel')}</Label>
                            <Textarea
                                id="symptoms"
                                placeholder={t('symptomsPlaceholder')}
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={6}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FileDropzone 
                                id="symptom-image"
                                label={t('symptomImageLabel')}
                                Icon={FileImage}
                                file={symptomImage}
                                setFile={setSymptomImage}
                                accept="image/*"
                            />
                             <FileDropzone 
                                id="medical-report"
                                label={t('medicalReportLabel')}
                                Icon={FileText}
                                file={medicalReport}
                                setFile={setMedicalReport}
                                accept="application/pdf,image/*"
                            />
                        </div>
                        <Button onClick={handleGetRecommendation} disabled={!symptoms || isPending || !user} className="w-full">
                            {isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('analyzingButton')}</>
                            ) : (
                                <><Wand2 className="mr-2 h-4 w-4" />{t('getRecommendationButton')}</>
                            )}
                        </Button>
                         {!user && <p className="text-center text-sm text-muted-foreground">{t('loginToContinue')}</p>}
                    </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-amber-400" /> {t('aiRecommendationTitle')}
                        </CardTitle>
                        <CardDescription>{t('aiRecommendationSubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {isPending && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p>{t('analyzingSymptoms')}</p>
                            </div>
                        )}
                        {!isPending && recommendation && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">{t('severityTitle')}</h3>
                                    <Badge variant="outline" className={cn("text-lg", severityStyles[recommendation.severity] || "bg-secondary")}>{recommendation.severity}</Badge>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">{t('suggestedActionTitle')}</h3>
                                    <p className="text-muted-foreground">{recommendation.suggestedAction}</p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">{t('summaryTitle')}</h3>
                                        <Button size="sm" variant="ghost" onClick={handleTextToSpeech} disabled={isAudioLoading || !!audioUrl}>
                                            {isAudioLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {!isAudioLoading && <Volume2 className="h-4 w-4" />}
                                            <span className="ml-2">{t('listenButton')}</span>
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground">{recommendation.summary}</p>
                                    {audioUrl && <audio src={audioUrl} controls autoPlay className="w-full mt-4" />}
                                </div>
                                {suggestedDoctors && suggestedDoctors.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">{t('suggestedDoctorsTitle')}</h3>
                                    <div className="space-y-4">
                                        {suggestedDoctors.map(doctor => {
                                            const docImage = PlaceHolderImages.find(p => p.id === doctor.imageId);
                                            return (
                                            <div key={doctor.id} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                                                {docImage && (
                                                    <Image src={docImage.imageUrl} alt={docImage.description} width={50} height={50} className="rounded-full" data-ai-hint={docImage.imageHint} />
                                                )}
                                                <div>
                                                    <p className="font-semibold">{doctor.name}</p>
                                                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="ml-auto" asChild>
                                                    <Link href="/book-appointment">{t('bookButton')}</Link>

                                                </Button>
                                            </div>
                                        )})}
                                    </div>
                                </div>
                                )}
                            </div>
                        )}
                        {!isPending && !recommendation && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                                <MedbookIcon className="h-16 w-16 text-muted-foreground/50" />
                                <p className="mt-4">{t('recommendationPlaceholder')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
