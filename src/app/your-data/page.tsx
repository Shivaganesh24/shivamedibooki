
"use client";

import { PageTitle } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { cn } from "@/lib/utils";
import { collection, query, orderBy } from "firebase/firestore";
import { Download, MoreHorizontal, User, Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const statusStyles: { [key: string]: string } = {
  Completed: "bg-green-500/20 text-green-400 border-green-500/30",
  "In Progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function YourDataPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const appointmentsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, `users/${user.uid}/appointments`), orderBy("appointmentDate", "desc"))
        : null,
    [user, firestore]
  );
  const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);

  const quizzesQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, `users/${user.uid}/healthQuizzes`), orderBy("completionDate", "desc"))
        : null,
    [user, firestore]
  );
  const { data: quizzes, isLoading: quizzesLoading } = useCollection(quizzesQuery);
  
  const recommendationsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, `users/${user.uid}/triageRecommendations`), orderBy("createdAt", "desc"))
        : null,
    [user, firestore]
  );
  const { data: recommendations, isLoading: recommendationsLoading } = useCollection(recommendationsQuery);

  const analysesQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, `users/${user.uid}/reportAnalyses`), orderBy("uploadDate", "desc"))
        : null,
    [user, firestore]
  );
  const { data: analyses, isLoading: analysesLoading } = useCollection(analysesQuery);

  const combinedActivity = useMemo(() => {
    const activities = [];

    if (appointments) {
      activities.push(...appointments.map(a => ({
        id: a.id,
        action: 'Book Appointment',
        details: `For ${a.reason}`,
        status: 'Completed',
        date: new Date(a.appointmentDate),
        type: 'appointment'
      })));
    }
    if (quizzes) {
       activities.push(...quizzes.map(q => ({
        id: q.id,
        action: 'Health Quiz',
        details: `Score: ${q.score}`,
        status: 'Completed',
        date: new Date(q.completionDate),
        type: 'quiz'
      })));
    }
    if (recommendations) {
        activities.push(...recommendations.map(r => ({
            id: r.id,
            action: 'Smart Triage',
            details: `Severity: ${r.severity}. ${r.summary}`,
            status: 'Completed',
            date: new Date(r.createdAt.toDate()),
            type: 'triage'
        })))
    }
    if (analyses) {
        activities.push(...analyses.map(an => ({
            id: an.id,
            action: 'Report Analysis',
            details: `Report: ${an.reportName}`,
            status: 'Completed',
            date: new Date(an.uploadDate),
            type: 'analysis'
        })))
    }

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [appointments, quizzes, recommendations, analyses]);

  const isLoading = isUserLoading || appointmentsLoading || quizzesLoading || recommendationsLoading || analysesLoading;

  const handleExportCSV = () => {
    if (!combinedActivity || combinedActivity.length === 0) {
      return;
    }
    const headers = ["Activity ID", "Action", "Details", "Status", "Date"];
    const csvContent = [
      headers.join(','),
      ...combinedActivity.map(item => [
        `"${item.id}"`,
        `"${item.action}"`,
        `"${item.details.replace(/"/g, '""')}"`,
        `"${item.status}"`,
        `"${item.date.toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'medibook-activity.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!combinedActivity || combinedActivity.length === 0) {
      return;
    }
    const doc = new jsPDF();
    doc.text("MediBook Activity Log", 14, 16);
    autoTable(doc, {
      head: [['Activity ID', 'Action', 'Details', 'Status', 'Date']],
      body: combinedActivity.map(item => [
        item.id,
        item.action,
        item.details,
        item.status,
        item.date.toLocaleDateString(),
      ]),
      startY: 20,
    });
    doc.save('medibook-activity.pdf');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <User className="h-10 w-10 text-primary" />
        <PageTitle>Your Data & Activity</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        View and manage your health activity securely.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline flex justify-between items-center">
            <span>Activity Log</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportCSV}>CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : !user ? (
                 <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Please log in to see your activity.
                  </TableCell>
                </TableRow>
              ) : combinedActivity.length > 0 ? (
                combinedActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium truncate max-w-[100px]">{activity.id}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell className="truncate max-w-xs">{activity.details}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(statusStyles[activity.status])}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.date.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem>View Details</DropdownMenuItem>
                           <DropdownMenuItem>Download Report</DropdownMenuItem>
                        </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
