'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileText,
  Globe
} from 'lucide-react';

interface Report {
  id: number;
  title: string;
  summary: string;
  data: any;
  status: string;
  createdAt: string;
  updatedAt: string;
  site: {
    id: number;
    url: string;
    name: string;
    description: string;
  };
  crawlJob: {
    id: number;
    status: string;
    startedAt: string;
    completedAt: string;
    errorMessage: string;
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Report not found');
          }
          throw new Error('Failed to fetch report');
        }
        
        const data: Report = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-red-900">Error</h3>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <div className="mt-6">
                <Link href="/reports">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reports
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
        </Link>
        
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon(report.status)}
          <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
          {getStatusBadge(report.status)}
        </div>
        
        {report.summary && (
          <p className="text-gray-600 text-lg">{report.summary}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">URL</label>
              <div className="flex items-center gap-2 mt-1">
                <a 
                  href={report.site.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {report.site.url}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            {report.site.name && (
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1">{report.site.name}</p>
              </div>
            )}
            
            {report.site.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1">{report.site.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(report.status)}
                {getStatusBadge(report.status)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <div className="flex items-center gap-1 mt-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                {formatDate(report.createdAt)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <div className="flex items-center gap-1 mt-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                {formatDate(report.updatedAt)}
              </div>
            </div>
            
            {report.crawlJob && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Crawl Job ID</label>
                  <p className="mt-1 font-mono text-sm">{report.crawlJob.id}</p>
                </div>
                
                {report.crawlJob.startedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Started At</label>
                    <div className="flex items-center gap-1 mt-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {formatDate(report.crawlJob.startedAt)}
                    </div>
                  </div>
                )}
                
                {report.crawlJob.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completed At</label>
                    <div className="flex items-center gap-1 mt-1 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      {formatDate(report.crawlJob.completedAt)}
                    </div>
                  </div>
                )}
                
                {report.crawlJob.errorMessage && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Error</label>
                    <p className="mt-1 text-red-600 text-sm">{report.crawlJob.errorMessage}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Data */}
      {report.data && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(report.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
