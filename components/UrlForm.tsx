'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Globe, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalyzeResponse {
  success: boolean;
  crawlJobId: number;
  siteId: number;
  message: string;
}

export function UrlForm() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          name: name || undefined,
          description: description || undefined,
        }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start analysis');
      }

      setSuccess(`Analysis started successfully! Job ID: ${data.crawlJobId}`);
      setUrl('');
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Analyze Website
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url" className="mb-2 block">
              Website URL *
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="name" className="mb-2 block">
              Site Name (optional)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="My Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              Description (optional)
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Brief description of the website"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !url}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              'Start Analysis'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
