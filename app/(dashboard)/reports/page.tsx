'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface Report {
  id: number;
  title: string;
  summary: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  site: {
    id: number;
    url: string;
    name: string;
  };
}

interface ReportsResponse {
  reports: Report[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const fetchReports = async (offset = 0) => {
    try {
      const response = await fetch(`/api/reports?limit=${pagination.limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data: ReportsResponse = await response.json();
      
      if (offset === 0) {
        setReports(data.reports);
      } else {
        setReports(prev => [...prev, ...data.reports]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const loadMore = () => {
    fetchReports(pagination.offset + pagination.limit);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
      month: 'short',
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

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
          Reports
        </h1>
        <Link href="/dashboard">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start your first analysis to see reports here.
              </p>
              <div className="mt-6">
                <Link href="/dashboard">
                  <Button>
                    Start Analysis
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(report.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {report.title}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    {report.summary && (
                      <p className="text-gray-600 mb-3">{report.summary}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <a 
                          href={report.site.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          {report.site.name || report.site.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/reports/${report.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {pagination.hasMore && (
            <div className="text-center pt-4">
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
