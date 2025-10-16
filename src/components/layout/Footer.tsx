import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { VAIQIcon } from "../icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <VAIQIcon className="h-8 w-auto text-primary" />
              <span className="font-headline text-xl font-bold"></span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Medical Triage
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            <div>
              <h3 className="font-semibold font-headline text-foreground">Features</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/smart-triage" className="text-muted-foreground hover:text-primary">Smart Triage</Link></li>
                <li><Link href="/report-reader" className="text-muted-foreground hover:text-primary">Report Reader</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Health Tips</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline text-foreground">Resources</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/health-quiz" className="text-muted-foreground hover:text-primary">Health Quiz</Link></li>
                <li><Link href="/book-appointment" className="text-muted-foreground hover:text-primary">Find a Doctor</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline text-foreground">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} VA!Q. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
