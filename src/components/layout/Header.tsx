
"use client";

import { VAIQIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { Bot, ChevronDown, ClipboardCheck, Home, Languages, LayoutDashboard, Loader2, LogOut, Map, Menu, Moon, Sun, Stethoscope, TestTube, User, X, MapPin, ShieldAlert, ScanLine, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
  } from "@/components/ui/menubar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLanguage } from "@/context/language-context";
import { useTranslation } from "@/hooks/use-translation";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", labelKey: "home", icon: <Home className="mr-2" /> },
  { href: "/dashboard", labelKey: "dashboard", icon: <LayoutDashboard className="mr-2" /> },
  { href: "/smart-triage", labelKey: "smartTriage", icon: <Bot className="mr-2" /> },
  { href: "/ingredient-scanner", labelKey: "featureIngredientScannerTitle", icon: <ScanLine className="mr-2" />},
  { href: "/pose-perfect", labelKey: "featurePosePerfectTitle", icon: <Target className="mr-2" />},
  { href: "/malaria-map", labelKey: "diseaseSection", icon: <ShieldAlert className="mr-2" /> },
  { href: "/your-location", labelKey: "healthTips", icon: <MapPin className="mr-2" /> },
  { href: "/health-quiz", labelKey: "healthQuiz", icon: <TestTube className="mr-2" /> },
  { href: "/book-appointment", labelKey: "bookAppointment", icon: <Stethoscope className="mr-2" /> },
  { href: "/your-data", labelKey: "yourData", icon: <User className="mr-2" /> },
  { href: "/report-reader", labelKey: "reportReader", icon: <ClipboardCheck className="mr-2" /> },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { setTheme } = useTheme();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <VAIQIcon className="h-8 w-auto text-primary" />
          <span className="font-headline text-xl font-bold"></span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6">
           <Menubar>
                <MenubarMenu>
                    <MenubarTrigger asChild>
                        <Link href="/">{t('home')}</Link>
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Features</MenubarTrigger>
                    <MenubarContent>
                        {navLinks.filter(l => l.href !== '/').map((link) => (
                            <MenubarItem key={link.href} asChild>
                                <Link href={link.href} className="flex items-center">
                                    {link.icon} {t(link.labelKey)}
                                </Link>
                            </MenubarItem>
                        ))}
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </nav>

        <div className="flex items-center gap-2 ml-auto">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" suppressHydrationWarning>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" suppressHydrationWarning>
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('changeLanguage')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'hi' | 'kn')}>
                <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="hi">हिन्दी</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="kn">ಕನ್ನಡ</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-2">
            {isUserLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" suppressHydrationWarning>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? "User"} />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">{t('logIn')}</Link>
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link href="/signup">{t('signUp')}</Link>
                </Button>
              </>
            )}
          </div>
        
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" suppressHydrationWarning>
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-3/4 pr-0">
               <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Main application navigation</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4 pr-6">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <VAIQIcon className="h-8 w-auto text-primary" />
                        <span className="font-headline text-xl font-bold"></span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </div>
                <nav className="flex-grow flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                        className={cn(
                            "transition-colors hover:text-primary text-sm",
                            pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground",
                            "flex items-center gap-4 py-2 text-lg"
                        )}
                        >
                        {link.icon} {t(link.labelKey)}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-4 flex flex-col gap-2 pr-6">
                  {isUserLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : user ? (
                    <Button variant="outline" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                      {t('logOut')}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>{t('logIn')}</Link>
                      </Button>
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>{t('signUp')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
