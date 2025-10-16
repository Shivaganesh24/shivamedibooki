
import { PageTitle, VAIQIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Cpu, Database, Eye, FerrisWheel, LayoutTemplate, Server } from "lucide-react";

export default function AboutPage() {

    const techStack = [
        { name: 'Next.js', description: 'For a fast, server-rendered React application.', icon: <FerrisWheel className="h-8 w-8" /> },
        { name: 'React & TypeScript', description: 'For building a robust and type-safe user interface.', icon: <LayoutTemplate className="h-8 w-8" /> },
        { name: 'Tailwind CSS & ShadCN UI', description: 'For modern, accessible, and aesthetically pleasing component styling.', icon: <Eye className="h-8 w-8" /> },
        { name: 'Firebase', description: 'For secure user authentication and a scalable NoSQL Firestore database.', icon: <Database className="h-8 w-8" /> },
        { name: 'Genkit & Gemini', description: 'Google\'s latest generative AI model and framework, powering all intelligent features.', icon: <Bot className="h-8 w-8" /> },
        { name: 'Firebase App Hosting', description: 'For continuous deployment and scalable, secure hosting.', icon: <Server className="h-8 w-8" /> },
    ];
    
    const howItWorks = [
        {
            step: 1,
            title: "Input Your Health Concerns",
            description: "Start by using our intuitive 'Smart Triage' tool. Describe your symptoms in natural language. For a more comprehensive analysis, you can upload an image of the affected area (like a skin rash) or a recent medical report (PDF or image). Our system is designed to understand and process this multi-modal information securely."
        },
        {
            step: 2,
            title: "Receive AI-Powered Insights",
            description: "Once you submit your information, our AI engine, powered by Google's Gemini model, gets to work. It analyzes the text, image, and report data to generate a preliminary triage recommendation. This includes a severity level (e.g., Mild, Moderate, Severe), a suggested course of action, a concise summary of the findings, and a list of relevant doctor specialties."
        },
        {
            step: 3,
            title: "Take Informed Action",
            description: "With your recommendation in hand, you are empowered to take the next step. If our AI suggests seeing a specialist, you can use the 'Book Appointment' feature to find and schedule a visit directly. You can also explore our 'Health Tips Dashboard' for general advice or test your knowledge with a 'Health Quiz'. All your activities are securely saved in the 'Your Data' section for future reference."
        }
    ];

    const coreFeatures = [
        { title: "Smart Triage", description: "An AI-powered symptom checker that analyzes text, images, and medical reports to provide instant triage recommendations. Includes a special Ayurveda mode for alternative insights." },
        { title: "AI Report Reader", description: "Securely upload your medical reports (PDFs or images), and our AI will extract and summarize the key findings, making complex documents easy to understand." },
        { title: "Appointment Booking", description: "Seamlessly schedule appointments with specialists. The system can even pre-select a doctor based on your triage results." },
        { title: "Your Data & Activity", description: "A secure, centralized dashboard to view your past triage results, report analyses, quiz scores, and upcoming appointments. You can export your data at any time." },
        { title: "Health Tips & Quizzes", description: "Access a curated library of health tips to stay informed and test your knowledge with interactive quizzes on various health topics." },
    ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
            <VAIQIcon className="h-20 w-auto mx-auto text-primary" />
            <PageTitle className="mt-4">About VA!Q</PageTitle>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                An intelligent, simplified platform for personal health management, designed with transparency and cutting-edge technology.
            </p>
        </div>

        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-headline font-semibold">How It Works</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    A detailed look at your journey from symptom to solution.
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
                    <h2 className="text-3xl sm:text-4xl font-headline font-semibold">Core Features</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        A closer look at the tools designed to empower your health decisions.
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
                <h2 className="text-3xl sm:text-4xl font-headline font-semibold">Our Technology</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Built on a foundation of modern, secure, and scalable technologies.
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

    