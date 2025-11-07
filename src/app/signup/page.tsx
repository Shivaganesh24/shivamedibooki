
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { VAIQIcon } from "@/components/icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth, useUser } from "@/firebase";
import { initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "firebase/auth";
import { useTranslation } from "@/hooks/use-translation";

const signupFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    if (!auth) return;
    initiateEmailSignUp(auth, data.email, data.password)
    .catch((error: AuthError) => {
      let description = t('unexpectedError');
      if (error.code === 'auth/email-already-in-use') {
        description = t('emailInUse');
      } else {
        description = error.message;
      }
      toast({
          variant: "destructive",
          title: t('signupFailed'),
          description: description,
      });
    });
  };
  
  useEffect(() => {
    if (user) {
        router.push("/");
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader className="text-center">
            <VAIQIcon className="mx-auto h-12 w-auto text-primary" />
            <CardTitle className="font-headline mt-4">{t('signupTitle')}</CardTitle>
            <CardDescription>
              {t('signupSubtitle')}{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t('logIn')}
              </Link>
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label>{t('emailLabel')}</Label>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label>{t('passwordLabel')}</Label>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Label>{t('confirmPasswordLabel')}</Label>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('createAccountButton')}
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {t('signupAgreement')}{" "}
                  <Link href="#" className="underline hover:text-primary">
                    {t('termsOfService')}
                  </Link>{" "}
                  {t('and')}{" "}
                  <Link href="#" className="underline hover:text-primary">
                    {t('privacyPolicy')}
                  </Link>
                  .
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
