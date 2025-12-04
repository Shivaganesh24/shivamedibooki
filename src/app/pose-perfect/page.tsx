
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { PageTitle } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { analyzePose, type AnalyzePoseOutput } from '@/ai/flows/analyze-pose';
import {
  Camera,
  CheckCircle,
  Loader2,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const yogaPoses = ['Tree Pose', 'Warrior II', 'Downward-Facing Dog', 'Triangle Pose', 'Bridge Pose'];

const accuracyScoreColor = (score: number) => {
  if (score >= 75) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

export default function PosePerfectPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePoseOutput | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [selectedPose, setSelectedPose] = useState<string>(yogaPoses[0]);

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
      // Use 'user' for front-facing camera, which is more common for this use case
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setHasCameraPermission(true);
      setIsCameraOn(true);
      setCapturedImage(null);
      setAnalysisResult(null);
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

  const stopCamera = () => {
     if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        setAnalysisResult(null);
        stopCamera();
      }
    }
  };

  const handleAnalyze = () => {
    if (!capturedImage) return;

    startTransition(async () => {
      try {
        const languageMap = { en: 'English', hi: 'Hindi', kn: 'Kannada' };
        const result = await analyzePose({
          poseImage: capturedImage,
          poseName: selectedPose,
          language: languageMap[language],
        });
        setAnalysisResult(result);
      } catch (error) {
        console.error('Analysis failed:', error);
        toast({
          variant: 'destructive',
          title: t('analysisFailed'),
          description: t('analysisFailedDesc'),
        });
      }
    });
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    getCameraPermission();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <Target className="h-10 w-10 text-primary" />
        <PageTitle>{t('featurePosePerfectTitle')}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
        {t('featurePosePerfectDescription')}
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Camera className="h-6 w-6" /> {t('poseCaptureTitle')}
            </CardTitle>
            <CardDescription>{t('poseCaptureDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor='pose-select'>{t('selectPoseLabel')}</Label>
                <Select value={selectedPose} onValueChange={setSelectedPose} disabled={isCameraOn || isPending}>
                    <SelectTrigger id='pose-select'>
                        <SelectValue placeholder={t('selectPosePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {yogaPoses.map((pose) => (
                            <SelectItem key={pose} value={pose}>{pose}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="relative aspect-video bg-secondary rounded-md overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                className={cn(
                  'w-full h-full object-cover transform -scale-x-100', // Mirror effect
                  !isCameraOn && 'hidden'
                )}
                autoPlay
                muted
                playsInline
              />
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured pose"
                  className="w-full h-full object-contain"
                />
              )}

              {!isCameraOn && !capturedImage && (
                <div className="flex flex-col items-center gap-4 text-center p-4">
                  <Target className="h-16 w-16 text-muted-foreground" />
                  <p className='text-muted-foreground'>{t('poseReadyPrompt')}</p>
                  <Button onClick={getCameraPermission} disabled={isPending}>
                    <Camera className="mr-2" /> {t('turnOnCamera')}
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
                {isCameraOn ? (
                    <Button onClick={handleCapture} disabled={isPending} className="w-full">
                        <Camera className="mr-2"/> {t('capturePoseButton')}
                    </Button>
                ) : (
                    <Button onClick={handleRetake} disabled={isPending} className="w-full">
                        <Camera className="mr-2"/> {t('retakePoseButton')}
                    </Button>
                )}
                <Button onClick={handleAnalyze} disabled={!capturedImage || isPending} className="w-full">
                    {isPending ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
                    {t('analyzePoseButton')}
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-400" /> {t('poseAnalysisTitle')}
            </CardTitle>
            <CardDescription>{t('poseAnalysisDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isPending ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>{t('analyzingPose')}</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('accuracyScoreTitle')}</h3>
                  <div className="flex items-center gap-4">
                    <Progress
                      value={analysisResult.accuracyScore}
                      className="w-full"
                    />
                    <span
                      className={cn(
                        'font-bold text-2xl',
                        accuracyScoreColor(analysisResult.accuracyScore)
                      )}
                    >
                      {analysisResult.accuracyScore} / 100
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('summaryTitle')}</h3>
                  <p className="text-muted-foreground">
                    {analysisResult.summary}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('correctionTipsTitle')}</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {analysisResult.corrections.length > 0 ? (
                        analysisResult.corrections.map((tip, i) => (
                        <div key={i} className="p-3 bg-secondary rounded-md">
                            <div className="flex items-center font-semibold">
                                <ThumbsDown className="h-4 w-4 mr-2 text-amber-500" />
                                {tip.area}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 pl-6">
                                {tip.feedback}
                            </p>
                        </div>
                        ))
                    ) : (
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-md flex items-center gap-3">
                            <CheckCircle className="h-5 w-5" />
                            <p className='font-semibold'>{t('greatFormMessage')}</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                <p>{t('poseAnalysisPlaceholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}
