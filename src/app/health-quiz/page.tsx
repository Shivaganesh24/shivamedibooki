
"use client";

import { PageTitle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { quizQuestions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lightbulb, RotateCw, TestTube, XCircle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

type AnswerState = {
  questionIndex: number;
  selectedOption: string;
  isCorrect: boolean;
};

export default function HealthQuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const translatedQuizQuestions = useMemo(() => [
    { question: t('quizQ1'), options: t('quizQ1Options').split(','), correctAnswer: t('quizQ1Answer'), explanation: t('quizQ1Explanation') },
    { question: t('quizQ2'), options: t('quizQ2Options').split(','), correctAnswer: t('quizQ2Answer'), explanation: t('quizQ2Explanation') },
    { question: t('quizQ3'), options: t('quizQ3Options').split(','), correctAnswer: t('quizQ3Answer'), explanation: t('quizQ3Explanation') },
    { question: t('quizQ4'), options: t('quizQ4Options').split(','), correctAnswer: t('quizQ4Answer'), explanation: t('quizQ4Explanation') },
    { question: t('quizQ5'), options: t('quizQ5Options').split(','), correctAnswer: t('quizQ5Answer'), explanation: t('quizQ5Explanation') },
  ], [t]);

  const currentQuestion = translatedQuizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / translatedQuizQuestions.length) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswers = [
      ...answers,
      { questionIndex: currentQuestionIndex, selectedOption, isCorrect },
    ];
    setAnswers(newAnswers);

    setSelectedOption(null);
    if (currentQuestionIndex < translatedQuizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const score = useMemo(() => {
    return answers.filter(a => a.isCorrect).length;
  }, [answers]);

  useEffect(() => {
    if (showResults && user && firestore) {
      const quizzesCol = collection(firestore, `users/${user.uid}/healthQuizzes`);
      addDocumentNonBlocking(quizzesCol, {
        score: score,
        totalQuestions: translatedQuizQuestions.length,
        completionDate: new Date().toISOString(),
        userId: user.uid,
      });
      toast({
        title: t('quizResultsSaved'),
        description: t('quizResultsSavedDesc'),
      });
    }
  }, [showResults, user, firestore, score, toast, t, translatedQuizQuestions.length]);


  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">{t('quizResultsTitle')}</CardTitle>
            <CardDescription>
              {t('quizScore', { score: score, total: translatedQuizQuestions.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Progress value={(score / translatedQuizQuestions.length) * 100} className="w-full" />
              <span className="font-bold text-lg">{Math.round((score / translatedQuizQuestions.length) * 100)}%</span>
            </div>
            <div className="mt-8 space-y-6">
              {translatedQuizQuestions.map((q, index) => {
                const userAnswer = answers.find(a => a.questionIndex === index);
                return (
                  <div key={index}>
                    <h3 className="font-semibold">{index + 1}. {q.question}</h3>
                    <p className={cn(
                      "mt-2 flex items-center gap-2",
                      userAnswer?.isCorrect ? "text-green-400" : "text-red-400"
                    )}>
                      {userAnswer?.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      {t('yourAnswer')}: {userAnswer?.selectedOption}
                    </p>
                    {!userAnswer?.isCorrect && <p className="mt-1 flex items-center gap-2 text-green-400">{t('correctAnswer')}: {q.correctAnswer}</p>}
                    <p className="mt-2 text-sm text-muted-foreground bg-secondary p-3 rounded-md flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 mt-1 shrink-0 text-amber-400" />
                      <span>{q.explanation}</span>
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRestart} className="w-full">
              <RotateCw className="mr-2 h-4 w-4" /> {t('tryAgain')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <div className="flex items-center gap-4">
        <TestTube className="h-10 w-10 text-primary" />
        <PageTitle>{t('healthQuizTitle')}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        {t('healthQuizSubtitle')}
      </p>

      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <Progress value={progress} className="w-full mb-4" />
          <CardTitle className="font-headline leading-tight">{t('question')} {currentQuestionIndex + 1}/{translatedQuizQuestions.length}</CardTitle>
          <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption ?? ""} onValueChange={setSelectedOption} className="space-y-4">
            {currentQuestion.options.map((option) => (
              <Label key={option} className="flex items-center gap-4 p-4 border rounded-md cursor-pointer hover:bg-secondary has-[[data-state=checked]]:bg-secondary has-[[data-state=checked]]:border-primary transition-colors">
                <RadioGroupItem value={option} id={option} />
                <span>{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNext} disabled={selectedOption === null} className="w-full">
            {currentQuestionIndex < translatedQuizQuestions.length - 1 ? t('nextQuestion') : t('finishQuiz')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
