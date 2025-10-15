"use client";

import { generateTriageRecommendation, type GenerateTriageRecommendationOutput } from "@/ai/flows/generate-triage-recommendation";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { MedbookIcon, PageTitle } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { doctors, triageDoctorMapping } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Bot, FileImage, FileText, Loader2, Sparkles, User, Volume2, Wand2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";

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

export default function SmartTriagePage() {
    const [symptoms, setSymptoms] = useState("");
    const [symptomImage, setSymptomImage] = useState<File | null>(null);
    const [medicalReport, setMedicalReport] = useState<File | null>(null);
    const [recommendation, setRecommendation] = useState<GenerateTriageRecommendationOutput | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 4MB." });
                return;
            }
            setter(file);
        }
    };

    const handleGetRecommendation = async () => {
        if (!symptoms) {
            toast({ variant: "destructive", title: "Symptoms required", description: "Please describe your symptoms." });
            return;
        }

        startTransition(async () => {
            setRecommendation(null);
            setAudioUrl(null);
            try {
                const symptomImageUri = symptomImage ? await fileToDataUri(symptomImage) : undefined;
                const medicalReportUri = medicalReport ? await fileToDataUri(medicalReport) : undefined;

                const result = await generateTriageRecommendation({
                    symptoms,
                    symptomImage: symptomImageUri,
                    medicalReport: medicalReportUri,
                });
                setRecommendation(result);
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
            const result = await textToSpeech(recommendation.summary);
            setAudioUrl(result.media);
        } catch (error) {
            console.error("Error generating speech:", error);
            toast({ variant: "destructive", title: "Audio Failed", description: "Could not generate audio summary." });
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
                <PageTitle>AI Smart Triage</PageTitle>
            </div>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
                Describe your symptoms to get an AI-powered triage recommendation.
            </p>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <User className="h-6 w-6" /> Your Information
                        </CardTitle>
                        <CardDescription>
                            Provide as much detail as possible for a more accurate analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">Describe your symptoms</Label>
                            <Textarea
                                id="symptoms"
                                placeholder="e.g., I have a sharp pain in my chest, and I'm feeling dizzy..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={6}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="symptom-image" className="flex items-center gap-2"><FileImage className="h-4 w-4" />Symptom Image (optional)</Label>
                                <Input id="symptom-image" type="file" accept="image/*" onChange={handleFileChange(setSymptomImage)} />
                                {symptomImage && <p className="text-sm text-muted-foreground truncate">Selected: {symptomImage.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="medical-report" className="flex items-center gap-2"><FileText className="h-4 w-4" />Medical Report (optional)</Label>
                                <Input id="medical-report" type="file" accept="application/pdf,image/*" onChange={handleFileChange(setMedicalReport)} />
                                {medicalReport && <p className="text-sm text-muted-foreground truncate">Selected: {medicalReport.name}</p>}
                            </div>
                        </div>
                        <Button onClick={handleGetRecommendation} disabled={!symptoms || isPending} className="w-full">
                            {isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                            ) : (
                                <><Wand2 className="mr-2 h-4 w-4" />Get Recommendation</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-amber-400" /> AI Recommendation
                        </CardTitle>
                        <CardDescription>The AI-powered triage analysis will appear below.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {isPending && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p>AI is analyzing your symptoms...</p>
                            </div>
                        )}
                        {!isPending && recommendation && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Severity</h3>
                                    <Badge variant="outline" className={cn("text-lg", severityStyles[recommendation.severity] || "bg-secondary")}>{recommendation.severity}</Badge>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Suggested Action</h3>
                                    <p className="text-muted-foreground">{recommendation.suggestedAction}</p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">Summary</h3>
                                        <Button size="sm" variant="ghost" onClick={handleTextToSpeech} disabled={isAudioLoading || !!audioUrl}>
                                            {isAudioLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {!isAudioLoading && <Volume2 className="h-4 w-4" />}
                                            <span className="ml-2">Listen</span>
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground">{recommendation.summary}</p>
                                    {audioUrl && <audio src={audioUrl} controls autoPlay className="w-full mt-4" />}
                                </div>
                                {suggestedDoctors && suggestedDoctors.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Suggested Doctors</h3>
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
                                                <Button size="sm" variant="outline" className="ml-auto">Book</Button>
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
                                <p className="mt-4">Your triage recommendation will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
