"use client";

import { extractKeyFindings, type ExtractKeyFindingsOutput } from "@/ai/flows/extract-key-findings";
import { PageTitle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, FileUp, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState, useTransition } from "react";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ReportReaderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFindings, setKeyFindings] = useState<ExtractKeyFindingsOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 4MB.",
        });
        return;
      }
      setFile(selectedFile);
      setKeyFindings(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a medical report to analyze.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const fileDataUri = await fileToDataUri(file);
        const result = await extractKeyFindings({ fileDataUri });
        setKeyFindings(result);
      } catch (error) {
        console.error("Error analyzing report:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "There was an error analyzing your report. Please try again.",
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <ClipboardCheck className="h-10 w-10 text-primary" />
        <PageTitle>AI Report Reader</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
        Upload a medical report (PDF or image), and our AI will extract the key findings for you.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <FileUp className="h-6 w-6" />
              Upload Your Report
            </CardTitle>
            <CardDescription>
              Select a PDF or image file from your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="report-file">Medical Report File</Label>
              <Input id="report-file" type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
              {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
            </div>
            <Button onClick={handleAnalyze} disabled={!file || isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Analyze Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-400" />
              Key Findings
            </CardTitle>
            <CardDescription>
              The AI-extracted summary of your report will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isPending && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Analyzing document, please wait...</p>
              </div>
            )}
            {!isPending && keyFindings && (
              <div className="space-y-4 text-sm whitespace-pre-wrap font-mono bg-secondary p-4 rounded-md">
                {keyFindings.keyFindings}
              </div>
            )}
            {!isPending && !keyFindings && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                    <p>Your analysis results will be displayed here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
