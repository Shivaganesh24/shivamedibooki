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

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswers = [
      ...answers,
      { questionIndex: currentQuestionIndex, selectedOption, isCorrect },
    ];
    setAnswers(newAnswers);

    setSelectedOption(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
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
        totalQuestions: quizQuestions.length,
        completionDate: new Date().toISOString(),
        userId: user.uid,
      });
      toast({
        title: "Quiz results saved!",
        description: "Your score has been saved to your activity log.",
      });
    }
  }, [showResults, user, firestore, score, toast]);


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
            <CardTitle className="font-headline text-3xl">Quiz Results</CardTitle>
            <CardDescription>
              You scored {score} out of {quizQuestions.length}!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Progress value={(score / quizQuestions.length) * 100} className="w-full" />
              <span className="font-bold text-lg">{Math.round((score / quizQuestions.length) * 100)}%</span>
            </div>
            <div className="mt-8 space-y-6">
              {quizQuestions.map((q, index) => {
                const userAnswer = answers.find(a => a.questionIndex === index);
                return (
                  <div key={index}>
                    <h3 className="font-semibold">{index + 1}. {q.question}</h3>
                    <p className={cn(
                      "mt-2 flex items-center gap-2",
                      userAnswer?.isCorrect ? "text-green-400" : "text-red-400"
                    )}>
                      {userAnswer?.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      Your answer: {userAnswer?.selectedOption}
                    </p>
                    {!userAnswer?.isCorrect && <p className="mt-1 flex items-center gap-2 text-green-400">Correct answer: {q.correctAnswer}</p>}
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
              <RotateCw className="mr-2 h-4 w-4" /> Try Again
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
        <PageTitle>Health Knowledge Quiz</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        Test your health-savvy with these quick questions.
      </p>

      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <Progress value={progress} className="w-full mb-4" />
          <CardTitle className="font-headline leading-tight">Question {currentQuestionIndex + 1}/{quizQuestions.length}</CardTitle>
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
            {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
