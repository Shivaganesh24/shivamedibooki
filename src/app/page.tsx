
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Bot, ClipboardCheck, HeartPulse, Stethoscope, TestTube, User, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VAIQIcon } from "@/components/icons";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      title: t('featureSmartTriageTitle'),
      description: t('featureSmartTriageDescription'),
      link: "/smart-triage",
      icon: <Bot className="h-8 w-8 text-primary" />,
      image_id: "smart-triage"
    },
    {
      title: t('diseaseSection'),
      description: t('featureDiseaseSectionDescription'),
      link: "/malaria-map",
      icon: <ShieldAlert className="h-8 w-8 text-primary" />,
      image_id: "malaria-map-main"
    },
    {
      title: t('featureHealthTipsTitle'),
      description: t('featureHealthTipsDescription'),
      link: "/dashboard",
      icon: <HeartPulse className="h-8 w-8 text-primary" />,
      image_id: "health-tips-main"
    },
    {
      title: t('featureHealthQuizTitle'),
      description: t('featureHealthQuizDescription'),
      link: "/health-quiz",
      icon: <TestTube className="h-8 w-8 text-primary" />,
      image_id: "health-quiz"
    },
    {
      title: t('featureBookAppointmentTitle'),
      description: t('featureBookAppointmentDescription'),
      link: "/book-appointment",
      icon: <Stethoscope className="h-8 w-8 text-primary" />,
      image_id: "book-appointment"
    },
    {
      title: t('featureYourDataTitle'),
      description: t('featureYourDataDescription'),
      link: "/your-data",
      icon: <User className="h-8 w-8 text-primary" />,
      image_id: "your-data-main"
    },
    {
      title: t('featureReportReaderTitle'),
      description: t('featureReportReaderDescription'),
      link: "/report-reader",
      icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
      image_id: "report-reader"
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      step: 2,
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      step: 3,
      title: t('step3Title'),
      description: t('step3Description'),
    },
  ];

  const heroImage = PlaceHolderImages.find(p => p.id === "hero");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-background">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-20 text-center sm:px-6 sm:py-32 lg:px-8">
          <VAIQIcon className="mx-auto h-24 w-auto text-primary" />
          <h1 className="mt-4 text-4xl font-bold font-headline sm:text-5xl lg:text-6xl">
            {t('welcomeToVAIQ')}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
            {t('welcomeSubtitle')}
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/smart-triage">
                {t('getStarted')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-semibold">{t('ourCoreFeatures')}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const featureImage = PlaceHolderImages.find(p => p.id === feature.image_id);
              return (
              <Card key={feature.title} className="hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    {featureImage && (
                       <div className="relative w-full h-40 rounded-md overflow-hidden mb-4">
                        <Image src={featureImage.imageUrl} alt={featureImage.description} fill className="object-cover"  data-ai-hint={featureImage.imageHint} />
                       </div>
                    )}
                  <p className="text-muted-foreground flex-grow">{feature.description}</p>
                  <Button asChild variant="link" className="p-0 h-auto mt-4 self-start">
                    <Link href={feature.link}>
                      {t('learnMore')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-semibold">{t('howItWorks')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('howItWorksSubtitle')}
            </p>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <div key={step.step} className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl font-headline">
                  {step.step}
                </div>
                <h3 className="mt-6 text-xl font-headline font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
