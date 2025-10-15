
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
import { Download, MoreHorizontal, User, Loader2, Filter, ArrowUpDown } from "lucide-react";
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusStyles: { [key: string]: string } = {
  Completed: "bg-green-500/20 text-green-400 border-green-500/30",
  Upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "In Progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

type ActivityType = 'all' | 'appointment' | 'quiz' | 'triage' | 'analysis';
type SortOption = 'date-desc' | 'date-asc' | 'action-asc' | 'action-desc';

export default function YourDataPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [filterType, setFilterType] = useState<ActivityType>('all');

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
    let activities: any[] = [];
    const now = new Date();

    if (appointments) {
      activities.push(...appointments.map(a => {
        const appointmentDate = new Date(a.appointmentDate);
        const status = appointmentDate > now ? 'Upcoming' : 'Completed';
        return {
          id: a.id,
          action: 'Book Appointment',
          details: `For ${a.reason}`,
          status: status,
          date: appointmentDate,
          type: 'appointment'
        };
      }));
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
            date: r.createdAt?.toDate ? new Date(r.createdAt.toDate()) : new Date(),
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
    
    // Filtering
    if (filterType !== 'all') {
      activities = activities.filter(activity => activity.type === filterType);
    }

    // Sorting
    return activities.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return a.date.getTime() - b.date.getTime();
        case 'action-asc':
          return a.action.localeCompare(b.action);
        case 'action-desc':
          return b.action.localeCompare(a.action);
        case 'date-desc':
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });
  }, [appointments, quizzes, recommendations, analyses, sortOption, filterType]);

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
    link.download = 'medibooki-activity.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!combinedActivity || combinedActivity.length === 0) {
      return;
    }
    const doc = new jsPDF();
    doc.text("MediBooki Activity Log", 14, 16);
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
    doc.save('medibooki-activity.pdf');
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline">Activity Log</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value) => setFilterType(value as ActivityType)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="appointment">Appointments</SelectItem>
                    <SelectItem value="quiz">Health Quizzes</SelectItem>
                    <SelectItem value="triage">Smart Triage</SelectItem>
                    <SelectItem value="analysis">Report Analyses</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date: Newest first</SelectItem>
                    <SelectItem value="date-asc">Date: Oldest first</SelectItem>
                    <SelectItem value="action-asc">Activity: A-Z</SelectItem>
                    <SelectItem value="action-desc">Activity: Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
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
            </div>
          </div>
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
                    No activity found for the selected filter.
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

    
