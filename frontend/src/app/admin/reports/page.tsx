'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, Home, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { adminApi, Report } from '@/lib/admin-api';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolveAction, setResolveAction] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await adminApi.resolveReport(selectedReport.id, resolveAction, resolution);
      setResolveDialogOpen(false);
      setSelectedReport(null);
      setResolution('');
      loadReports();
    } catch (error) {
      console.error('Error resolving report:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="bg-amber-500 text-white">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Résolu
          </Badge>
        );
      case 'DISMISSED':
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingReports = reports.filter((r) => r.status === 'PENDING');
  const resolvedReports = reports.filter((r) => r.status !== 'PENDING');

  const ReportCard = ({ report }: { report: Report }) => {
    const target = report.property || report.vehicle;
    const targetType = report.property ? 'property' : 'vehicle';
    const targetUrl =
      targetType === 'property'
        ? `/properties/${report.property?.id}`
        : `/vehicles/${report.vehicle?.id}`;

    return (
      <Card className={report.status === 'PENDING' ? 'border-amber-500' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                {getStatusBadge(report.status)}
                <Badge variant="outline">
                  {targetType === 'property' ? (
                    <>
                      <Home className="mr-1 h-3 w-3" />
                      Immobilier
                    </>
                  ) : (
                    <>
                      <Car className="mr-1 h-3 w-3" />
                      Véhicule
                    </>
                  )}
                </Badge>
              </div>

              <h3 className="mb-1 font-semibold">
                Signalement pour: {target?.title || 'Annonce supprimée'}
              </h3>

              <p className="mb-2 text-sm text-muted-foreground">
                Par <strong>{report.reporter.name}</strong> ({report.reporter.email})
                <br />
                Le {new Date(report.createdAt).toLocaleDateString('fr-FR')}
              </p>

              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm">
                  <AlertTriangle className="mr-1 inline h-4 w-4 text-amber-500" />
                  {report.reason}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {report.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedReport(report);
                    setResolveAction('RESOLVED');
                    setResolveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Résoudre
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedReport(report);
                    setResolveAction('DISMISSED');
                    setResolveDialogOpen(true);
                  }}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Rejeter
                </Button>
              </>
            )}
            {target && (
              <Button size="sm" variant="outline" asChild>
                <Link href={targetUrl} target="_blank">
                  <Eye className="mr-1 h-4 w-4" />
                  Voir l'annonce
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Signalements</h1>
        <p className="text-muted-foreground">
          {pendingReports.length} signalement{pendingReports.length > 1 ? 's' : ''} en
          attente de traitement
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Aucun signalement</h3>
            <p className="text-muted-foreground">
              Aucun signalement n'a été soumis pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              En attente ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Traités ({resolvedReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingReports.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-10 w-10 text-green-500" />
                  <p className="text-muted-foreground">
                    Tous les signalements ont été traités
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedReports.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Aucun signalement traité
                  </p>
                </CardContent>
              </Card>
            ) : (
              resolvedReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolveAction === 'RESOLVED'
                ? 'Résoudre le signalement'
                : 'Rejeter le signalement'}
            </DialogTitle>
            <DialogDescription>
              {resolveAction === 'RESOLVED'
                ? 'Indiquez les mesures prises pour résoudre ce signalement.'
                : 'Indiquez pourquoi ce signalement est rejeté (infondé, etc.).'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Commentaire (optionnel)..."
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleResolve}
              disabled={processing}
              className={
                resolveAction === 'RESOLVED'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }
            >
              {resolveAction === 'RESOLVED' ? 'Résoudre' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
