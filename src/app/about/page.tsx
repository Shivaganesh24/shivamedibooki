
"use client";

import { PageTitle, VAIQIcon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { Bot, Cpu, Database, Eye, FerrisWheel, LayoutTemplate, Server } from "lucide-react";

export default function AboutPage() {
    const { t } = useTranslation();

    const techStack = [
        { name: 'Next.js', description: t('techNextJs'), icon: <FerrisWheel className="h-8 w-8" /> },
        { name: 'React & TypeScript', description: t('techReact'), icon: <LayoutTemplate className="h-8 w-8" /> },
        { name: 'Tailwind CSS & ShadCN UI', description: t('techTailwind'), icon: <Eye className="h-8 w-8" /> },
        { name: 'Firebase', description: t('techFirebase'), icon: <Database className="h-8 w-8" /> },
        { name: 'Genkit & Gemini', description: t('techGenkit'), icon: <Bot className="h-8 w-8" /> },
        { name: 'Firebase App Hosting', description: t('techAppHosting'), icon: <Server className="h-8 w-8" /> },
    ];
    
    const howItWorks = [
        {
            step: 1,
            title: t('aboutHowItWorksStep1Title'),
            description: t('aboutHowItWorksStep1Desc')
        },
        {
            step: 2,
            title: t('aboutHowItWorksStep2Title'),
            description: t('aboutHowItWorksStep2Desc')
        },
        {
            step: 3,
            title: t('aboutHowItWorksStep3Title'),
            description: t('aboutHowItWorksStep3Desc')
        }
    ];

    const coreFeatures = [
        { title: t('featureSmartTriageTitle'), description: t('aboutFeatureSmartTriageDesc') },
        { title: t('featureReportReaderTitle'), description: t('aboutFeatureReportReaderDesc') },
        { title: t('featureBookAppointmentTitle'), description: t('aboutFeatureBookAppointmentDesc') },
        { title: t('featureYourDataTitle'), description: t('aboutFeatureYourDataDesc') },
        { title: t('featureHealthTipsTitle'), description: t('aboutFeatureHealthTipsDesc') },
    ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
            <VAIQIcon className="h-20 w-auto mx-auto text-primary" />
            <PageTitle className="mt-4">{t('aboutTitle')}</PageTitle>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('aboutSubtitle')}
            </p>
        </div>

        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-headline font-semibold">{t('howItWorks')}</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('aboutHowItWorksSubtitle')}
                </p>
            </div>
            <div className="mt-16 grid gap-12 lg:grid-cols-3">
                {howItWorks.map((step) => (
                    <div key={step.step} className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl font-headline">
                        {step.step}
                        </div>
                        <h3 className="mt-6 text-xl font-headline font-semibold">{step.title}</h3>
                        <p className="mt-2 text-muted-foreground">{step.description}</p>
                    </div>
                ))}
            </div>
        </section>

        <section className="py-16 bg-secondary rounded-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-headline font-semibold">{t('ourCoreFeatures')}</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('aboutCoreFeaturesSubtitle')}
                    </p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {coreFeatures.map((feature) => (
                        <Card key={feature.title} className="bg-background">
                            <CardHeader>
                                <CardTitle className="font-headline">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-headline font-semibold">{t('ourTechnologyTitle')}</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('ourTechnologySubtitle')}
                </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {techStack.map((tech) => (
                <Card key={tech.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-headline font-medium">
                            {tech.name}
                        </CardTitle>
                       <div className="text-primary">{tech.icon}</div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {tech.description}
                        </p>
                    </CardContent>
                </Card>
                ))}
            </div>
        </section>
    </div>
  );
}
