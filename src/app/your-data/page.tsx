
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
import { collection, query, orderBy, Query, DocumentData } from "firebase/firestore";
import { Download, MoreHorizontal, User, Loader2, Filter, ArrowUpDown } from "lucide-react";
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

const statusStyles: { [key: string]: string } = {
  Completed: "bg-green-500/20 text-green-400 border-green-500/30",
  Upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "In Progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

type ActivityType = 'all' | 'appointment' | 'quiz' | 'triage' | 'analysis';
type SortDirection = 'asc' | 'desc';

interface Activity {
  id: string;
  action: string;
  details: string;
  status: string;
  date: Date;
  type: ActivityType;
}

export default function YourDataPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const { t } = useTranslation();

  const createQuery = (collectionName: string, dateField: string): Query<DocumentData> | null => {
    if (!user || !firestore || (filterType !== 'all' && filterType !== collectionName.split('/')[0])) {
      return null;
    }
    return query(collection(firestore, `users/${user.uid}/${collectionName}`), orderBy(dateField, sortDirection));
  };
  
  const appointmentsQuery = useMemoFirebase(() => createQuery('appointments', 'appointmentDate'), [user, firestore, sortDirection, filterType]);
  const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);

  const quizzesQuery = useMemoFirebase(() => createQuery('healthQuizzes', 'completionDate'), [user, firestore, sortDirection, filterType]);
  const { data: quizzes, isLoading: quizzesLoading } = useCollection(quizzesQuery);
  
  const recommendationsQuery = useMemoFirebase(() => createQuery('triageRecommendations', 'createdAt'), [user, firestore, sortDirection, filterType]);
  const { data: recommendations, isLoading: recommendationsLoading } = useCollection(recommendationsQuery);

  const analysesQuery = useMemoFirebase(() => createQuery('reportAnalyses', 'uploadDate'), [user, firestore, sortDirection, filterType]);
  const { data: analyses, isLoading: analysesLoading } = useCollection(analysesQuery);


  const combinedActivity = useMemo((): Activity[] => {
    const activities: Activity[] = [];
    const now = new Date();

    if (filterType === 'all' || filterType === 'appointment') {
      appointments?.forEach(a => {
        const appointmentDate = new Date(a.appointmentDate);
        activities.push({
          id: a.id,
          action: t('bookAppointment'),
          details: `${t('reason')}: ${a.reason}`,
          status: appointmentDate > now ? t('upcoming') : t('completed'),
          date: appointmentDate,
          type: 'appointment'
        });
      });
    }
    if (filterType === 'all' || filterType === 'quiz') {
       quizzes?.forEach(q => activities.push({
        id: q.id,
        action: t('healthQuiz'),
        details: `${t('score')}: ${q.score}`,
        status: t('completed'),
        date: new Date(q.completionDate),
        type: 'quiz'
      }));
    }
    if (filterType === 'all' || filterType === 'triage') {
        recommendations?.forEach(r => activities.push({
            id: r.id,
            action: t('smartTriage'),
            details: `${t('severityTitle')}: ${r.severity}. ${r.summary}`,
            status: t('completed'),
            date: r.createdAt?.toDate ? new Date(r.createdAt.toDate()) : new Date(),
            type: 'triage'
        }));
    }
    if (filterType === 'all' || filterType === 'analysis') {
        analyses?.forEach(an => activities.push({
            id: an.id,
            action: t('reportReader'),
            details: `${t('report')}: ${an.reportName}`,
            status: t('completed'),
            date: new Date(an.uploadDate),
            type: 'analysis'
        }));
    }
    
    if (filterType === 'all') {
      return activities.sort((a, b) => {
        return sortDirection === 'desc' ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime();
      });
    }

    return activities;
  }, [appointments, quizzes, recommendations, analyses, filterType, sortDirection, t]);

  const isLoading = isUserLoading || appointmentsLoading || quizzesLoading || recommendationsLoading || analysesLoading;

  const handleExportCSV = () => {
    if (!combinedActivity || combinedActivity.length === 0) {
      return;
    }
    const headers = [t('activityId'), t('action'), t('details'), t('status'), t('date')];
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
    link.download = 'vaiq-activity.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!combinedActivity || combinedActivity.length === 0) {
      return;
    }
    const doc = new jsPDF();
    doc.text("VA!Q Activity Log", 14, 16);
    autoTable(doc, {
      head: [[t('activityId'), t('action'), t('details'), t('status'), t('date')]],
      body: combinedActivity.map(item => [
        item.id,
        item.action,
        item.details,
        item.status,
        item.date.toLocaleDateString(),
      ]),
      startY: 20,
    });
    doc.save('vaiq-activity.pdf');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <User className="h-10 w-10 text-primary" />
        <PageTitle>{t('yourData')}</PageTitle>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        {t('yourDataSubtitle')}
      </p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline">{t('activityLog')}</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value) => setFilterType(value as ActivityType)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t('filterByType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allActivities')}</SelectItem>
                    <SelectItem value="appointment">{t('appointments')}</SelectItem>
                    <SelectItem value="quiz">{t('healthQuizzes')}</SelectItem>
                    <SelectItem value="triage">{t('smartTriage')}</SelectItem>
                    <SelectItem value="analysis">{t('reportAnalyses')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t('sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">{t('dateNewest')}</SelectItem>
                    <SelectItem value="asc">{t('dateOldest')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    {t('exportData')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('exportAs')}</DropdownMenuLabel>
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
                <TableHead>{t('activityId')}</TableHead>
                <TableHead>{t('action')}</TableHead>
                <TableHead>{t('details')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
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
                    {t('loginToSeeActivity')}
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
                           <DropdownMenuItem>{t('viewDetails')}</DropdownMenuItem>
                           <DropdownMenuItem>{t('downloadReport')}</DropdownMenuItem>
                        </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t('noActivityFound')}
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
