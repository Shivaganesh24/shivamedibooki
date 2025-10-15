import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto bg-green-500/20 text-green-500 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="font-headline mt-6 text-3xl">Appointment Confirmed!</CardTitle>
          <CardDescription className="mt-2 text-lg">
            Your appointment has been successfully booked. You will receive a confirmation email shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please arrive 15 minutes early for your appointment. If you need to reschedule, please contact us at least 24 hours in advance.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/your-data">View My Appointments</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
