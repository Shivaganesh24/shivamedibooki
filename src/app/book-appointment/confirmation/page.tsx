
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto bg-green-500/20 text-green-500 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="font-headline mt-6 text-3xl">{t('appointmentConfirmedTitle')}</CardTitle>
          <CardDescription className="mt-2 text-lg">
            {t('appointmentConfirmedSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('appointmentConfirmedMessage')}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <Link href="/">{t('backToHome')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/your-data">{t('viewMyAppointments')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
