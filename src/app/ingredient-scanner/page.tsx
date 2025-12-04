
"use client";

import { useEffect, useRef, useState, useTransition, ChangeEvent } from "react";
import { PageTitle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { analyzeIngredients, type AnalyzeIngredientsOutput } from "@/ai/flows/analyze-ingredients";
import { Camera, CheckCircle, FileUp, Loader2, ScanLine, Sparkles, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const healthScoreColor = (score: number) => {
    if (score >= 75) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
};

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

export default function IngredientScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeIngredientsOutput | null>(null);
    const [isPending, startTransition] = useTransition();

    const { t } = useTranslation();
    const { language } = useLanguage();
    const { toast } = useToast();
    
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
            variant: 'destructive',
            title: t('cameraNotSupported'),
            description: t('cameraNotSupportedDesc'),
        });
        setHasCameraPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        setIsCameraOn(true);
        setCapturedImage(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('cameraAccessDenied'),
          description: t('cameraAccessDeniedDesc'),
        });
      }
    };
    
    useEffect(() => {
        return () => {
            if(videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUri = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUri);
                setAnalysisResult(null); // Reset previous analysis
                setIsCameraOn(false); // Turn off camera after capture
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          if (file.size > 4 * 1024 * 1024) { // 4MB limit
            toast({ variant: 'destructive', title: t('fileTooLarge'), description: t('fileTooLargeDesc') });
            return;
          }
          const dataUri = await fileToDataUri(file);
          setCapturedImage(dataUri);
          setIsCameraOn(false);
          setAnalysisResult(null); // Reset previous analysis
        }
        // Reset file input to allow re-uploading the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = () => {
        if (!capturedImage) return;

        startTransition(async () => {
            try {
                const languageMap = { en: 'English', hi: 'Hindi', kn: 'Kannada' };
                const result = await analyzeIngredients({ 
                    imageDataUri: capturedImage,
                    language: languageMap[language],
                });
                setAnalysisResult(result);
            } catch (error) {
                console.error("Analysis failed:", error);
                toast({
                    variant: "destructive",
                    title: t('analysisFailed'),
                    description: t('analysisFailedDesc'),
                });
            }
        });
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-4">
                <ScanLine className="h-10 w-10 text-primary" />
                <PageTitle>{t('featureIngredientScannerTitle')}</PageTitle>
            </div>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
                {t('featureIngredientScannerDescription')}
            </p>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Camera className="h-6 w-6" /> {t('scannerTitle')}
                        </CardTitle>
                        <CardDescription>{t('scannerDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraOn && "hidden")} autoPlay muted playsInline />
                            {capturedImage && <img src={capturedImage} alt="Captured ingredients" className="w-full h-full object-contain" />}
                            
                            {!isCameraOn && !capturedImage && (
                                <div className="flex flex-col items-center gap-4">
                                     <Camera className="h-16 w-16 text-muted-foreground" />
                                    <Button onClick={getCameraPermission} disabled={isPending}>
                                        <Camera className="mr-2"/> {t('turnOnCamera')}
                                    </Button>
                                </div>
                            )}

                            {hasCameraPermission === false && (
                                 <Alert variant="destructive" className="m-4">
                                     <AlertTitle>{t('cameraAccessRequired')}</AlertTitle>
                                     <AlertDescription>{t('cameraAccessDeniedDesc')}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <Button onClick={handleCapture} disabled={!isCameraOn || isPending} className="w-full">
                                <Camera className="mr-2"/> {t('capturePicture')}
                            </Button>
                            <Button asChild variant="outline">
                                <Label htmlFor="upload-ingredient-image" className="cursor-pointer">
                                    <FileUp className="mr-2" /> Upload Image
                                    <input
                                        ref={fileInputRef}
                                        id="upload-ingredient-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                    />
                                </Label>
                            </Button>
                        </div>
                         <Button onClick={handleAnalyze} disabled={!capturedImage || isPending} className="w-full">
                            {isPending ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
                            {t('analyzeIngredients')}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-amber-400" /> {t('analysisResults')}
                        </CardTitle>
                        <CardDescription>{t('analysisResultsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {isPending ? (
                             <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p>{t('analyzingIngredients')}</p>
                            </div>
                        ) : analysisResult ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">{t('healthScore')}</h3>
                                    <div className="flex items-center gap-4">
                                        <Progress value={analysisResult.healthScore} className="w-full" />
                                        <span className={cn("font-bold text-2xl", healthScoreColor(analysisResult.healthScore))}>{analysisResult.healthScore} / 100</span>
                                    </div>
                                </div>
                                 <div>
                                    <h3 className="font-semibold mb-2">{t('summaryTitle')}</h3>
                                    <p className="text-muted-foreground">{analysisResult.summary}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">{t('ingredientBreakdown')}</h3>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {analysisResult.ingredients.map((ing, i) => (
                                            <div key={i} className="p-3 bg-secondary rounded-md">
                                                <div className="flex items-center justify-between font-semibold">
                                                   <span className="flex items-center gap-2">
                                                     {ing.isGood ? <ThumbsUp className="h-4 w-4 text-green-500" /> : <ThumbsDown className="h-4 w-4 text-red-500" />}
                                                     {ing.name}
                                                   </span>
                                                   <Badge variant={ing.isGood ? "default" : "destructive"} className={cn(ing.isGood && "bg-green-500/80")}>{ing.isGood ? t('good') : t('bad')}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 pl-6">{ing.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                                <p>{t('analysisResultsPlaceholder')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
}
