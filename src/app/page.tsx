import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Bot, ClipboardCheck, HeartPulse, Stethoscope, TestTube, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MedbookIcon } from "@/components/icons";

const features = [
  {
    title: "Smart Triage",
    description: "AI-powered symptom checker for instant recommendations.",
    link: "/smart-triage",
    icon: <Bot className="h-8 w-8 text-primary" />,
    image_id: "smart-triage"
  },
  {
    title: "Health Tips",
    description: "Get daily advice on staying healthy and safe.",
    link: "/dashboard",
    icon: <HeartPulse className="h-8 w-8 text-primary" />,
    image_id: "health-tips"
  },
  {
    title: "Health Quiz",
    description: "Test your knowledge with our interactive health quizzes.",
    link: "/health-quiz",
    icon: <TestTube className="h-8 w-8 text-primary" />,
    image_id: "health-quiz"
  },
  {
    title: "Book Appointment",
    description: "Easily schedule appointments with top specialists.",
    link: "/book-appointment",
    icon: <Stethoscope className="h-8 w-8 text-primary" />,
    image_id: "book-appointment"
  },
  {
    title: "Your Data",
    description: "View and manage your health activity securely.",
    link: "/your-data",
    icon: <User className="h-8 w-8 text-primary" />,
    image_id: "your-data"
  },
  {
    title: "Report Reader",
    description: "Upload and analyze your medical reports with AI.",
    link: "/report-reader",
    icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    image_id: "report-reader"
  },
];

const howItWorksSteps = [
  {
    step: 1,
    title: "Describe Your Symptoms",
    description: "Use our Smart Triage tool to tell us how you're feeling. You can also upload images for a more accurate analysis.",
  },
  {
    step: 2,
    title: "Get AI-Powered Insight",
    description: "Our intelligent system analyzes your information and provides a preliminary triage recommendation and suggests relevant specialists.",
  },
  {
    step: 3,
    title: "Take Action",
    description: "Based on the recommendation, book an appointment, read health tips, or manage your health data all in one place.",
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 bg-secondary">
        <div className="absolute inset-0">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover opacity-20"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
           <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <MedbookIcon className="h-24 w-24 mx-auto text-primary" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold mt-4">
            Welcome to MediBook
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto text-muted-foreground">
            Your intelligent, simplified platform for personal health management.
            Take control of your health journey with AI-powered insights.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/smart-triage">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-semibold">Our Core Features</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A suite of tools designed to empower your health decisions.
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
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
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
            <h2 className="text-3xl sm:text-4xl font-headline font-semibold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple, three-step process to get you the help you need.
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
