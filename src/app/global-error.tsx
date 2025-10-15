'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="max-w-lg w-full text-center">
            <CardHeader>
              <div className="mx-auto bg-destructive/20 text-destructive rounded-full h-16 w-16 flex items-center justify-center">
                <Dna className="h-10 w-10" />
              </div>
              <CardTitle className="font-headline mt-6 text-3xl">Something went wrong!</CardTitle>
              <CardDescription className="mt-2 text-lg">
                An unexpected error occurred. We have been notified and are looking into it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                You can try to reload the page or come back later.
              </p>
              <div className="mt-6">
                <Button onClick={() => reset()}>
                  Try again
                </Button>
              </div>
              {error?.message && (
                 <details className="mt-4 bg-secondary p-3 rounded-md text-left">
                    <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
                    <pre className="mt-2 text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                        {error.stack}
                    </pre>
                 </details>
              )}
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
