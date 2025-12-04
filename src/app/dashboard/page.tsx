
"use client";

import { PageTitle } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { ArrowRight, Bot, ClipboardCheck, HeartPulse, LayoutDashboard, Stethoscope, TestTube, User, Virus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { t } = useTranslation();

  const features = [
    {
      title: t('featureSmartTriageTitle'),
      description: t('featureSmartTriageDescription'),
      link: "/smart-triage",
      icon: <Bot className="h-8 w-8 text-primary" />,
    },
    {
      title: t('diseaseSection'),
      description: t('featureDiseaseSectionDescription'),
      link: "/malaria-map",
      icon: <Virus className="h-8 w-8 text-primary" />,
    },
    {
      title: t('featureHealthTipsTitle'),
      description: t('featureHealthTipsDescription'),
      link: "/dashboard", // This page itself
      icon: <HeartPulse className="h-8 w-8 text-primary" />,
    },
    {
      title: t('featureHealthQuizTitle'),
      description: t('featureHealthQuizDescription'),
      link: "/health-quiz",
      icon: <TestTube className="h-8 w-8 text-primary" />,
    },
    {
      title: t('featureBookAppointmentTitle'),
      description: t('featureBookAppointmentDescription'),
      link: "/book-appointment",
      icon: <Stethoscope className="h-8 w-8 text-primary" />,
    },
    {
      title: t('featureYourDataTitle'),
      description: t('featureYourDataDescription'),
      link: "/your-data",
      icon: <User className="h-8 w-8 text-primary" />,
    },
    {
      title: t('featureReportReaderTitle'),
      description: t('featureReportReaderDescription'),
      link: "/report-reader",
      icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <LayoutDashboard className="h-10 w-10 text-primary" />
        <PageTitle>{t('dashboard')}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        {t('dashboardSubtitle')}
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="font-headline">{feature.title}</CardTitle>
                {feature.icon}
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-muted-foreground flex-grow">{feature.description}</p>
              <Button asChild variant="link" className="p-0 h-auto mt-4 self-start">
                <Link href={feature.link}>
                  {t('learnMore')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
