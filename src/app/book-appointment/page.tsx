
"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { CalendarIcon, Stethoscope } from "lucide-react";

import { PageTitle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { doctors } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useTranslation } from "@/hooks/use-translation";

// ----------------- Validation Schema -----------------
const appointmentFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  doctorId: z.string().min(1, "Please select a doctor."),
  appointmentDate: z.date({
    required_error: "An appointment date is required.",
  }),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters.")
    .max(500, "Reason must be less than 500 characters."),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// ----------------- Inner Component -----------------
function AppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorIdFromQuery = searchParams.get("doctorId");
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const appointmentImage = useMemo(() => PlaceHolderImages.find(
    (p) => p.id === "book-appointment"
  ), []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      doctorId: doctorIdFromQuery || "",
      reason: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("fullName", user.displayName || "");
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  useEffect(() => {
    if (doctorIdFromQuery) {
      form.setValue("doctorId", doctorIdFromQuery);
    }
  }, [doctorIdFromQuery, form]);

  function onSubmit(data: AppointmentFormValues) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: t('notLoggedInError'),
        description: t('loginToBookAppointment'),
      });
      return;
    }

    toast({
      title: t('submittingAppointment'),
      description: t('waitWhileBooking'),
    });

    const appointmentsCol = collection(firestore, `users/${user.uid}/appointments`);
    addDocumentNonBlocking(appointmentsCol, {
      ...data,
      // Use serverTimestamp for accuracy and to avoid client-side clock skew
      appointmentDate: serverTimestamp(),
      userId: user.uid,
    });

    router.push("/book-appointment/confirmation");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <Stethoscope className="h-10 w-10 text-primary" />
        <PageTitle>{t('bookAppointment')}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        {t('bookAppointmentSubtitle')}
      </p>

      <div className="mt-8 grid lg:grid-cols-2 gap-12 items-start">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">{t('appointmentDetails')}</CardTitle>
            <CardDescription>
              {t('appointmentFormDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fullNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('emailLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Doctor */}
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('preferredDoctorLabel')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectDoctorPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('appointmentDateLabel')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>{t('pickDatePlaceholder')}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setDate(new Date().getDate() - 1))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reason */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reasonForVisitLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('reasonForVisitPlaceholder')}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting || !user}
                >
                  {form.formState.isSubmitting ? t('bookingButton') : t('bookAppointmentButton')}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-muted-foreground">
                    {t('loginToBookAppointment')}
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Image */}
        <div className="hidden lg:block relative w-full h-full min-h-[500px] rounded-lg overflow-hidden">
          {appointmentImage && (
            <Image
              src={appointmentImage.imageUrl}
              alt={appointmentImage.description}
              fill
              className="object-cover"
              data-ai-hint={appointmentImage.imageHint}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------- Page Export -----------------
export default function BookAppointmentPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="p-12 text-center">{t('loadingAppointmentForm')}</div>}>
      <AppointmentForm />
    </Suspense>
  );
}
