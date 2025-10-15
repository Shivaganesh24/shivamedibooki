"use client";

import { MedbookIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { Loader2, LogOut, Menu, X } from "lucide-react";
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
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/smart-triage", label: "Smart Triage" },
  { href: "/dashboard", label: "Health Tips" },
  { href: "/health-quiz", label: "Health Quiz" },
  { href: "/book-appointment", label: "Book Appointment" },
  { href: "/your-data", label: "Your Data" },
  { href: "/report-reader", label: "Report Reader" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const NavLink = ({ href, label, isMobile = false }: { href: string; label: string; isMobile?: boolean }) => (
    <Link
      href={href}
      onClick={() => isMobile && setIsMobileMenuOpen(false)}
      className={cn(
        "transition-colors hover:text-primary",
        pathname === href ? "text-primary font-semibold" : "text-muted-foreground",
        isMobile && "block py-2 text-lg"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MedbookIcon className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-bold">MediBook</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          {isUserLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-3/4">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b pb-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <MedbookIcon className="h-8 w-8 text-primary" />
                      <span className="font-headline text-xl font-bold">MediBook</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                      <X />
                      <span className="sr-only">Close menu</span>
                  </Button>
              </div>
              <nav className="flex-grow flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} isMobile />
                ))}
              </nav>
              <div className="mt-auto border-t pt-4 flex flex-col gap-2">
                {isUserLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : user ? (
                  <Button variant="outline" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    Log Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
