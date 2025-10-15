import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { MedbookIcon } from "@/components/icons";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader className="text-center">
            <MedbookIcon className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="font-headline mt-4">Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a link to get back into your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full">Send reset link</Button>
            <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Back to log in</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
