'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, PlusCircle, FileText } from 'lucide-react';
import { UrlForm } from '@/components/UrlForm';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Simple dashboard for test users
export default function DashboardPage() {
  const [isTestUser, setIsTestUser] = useState(false);

  useEffect(() => {
    // Check if we're a test user by looking at the session cookie
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('session='));
    if (sessionCookie) {
      try {
        const sessionValue = sessionCookie.split('=')[1];
        const decoded = atob(sessionValue);
        const sessionData = JSON.parse(decoded);
        if (sessionData.user?.id === 'test-user-123') {
          setIsTestUser(true);
        }
      } catch (e) {
        // Not a test user
      }
    }
  }, []);

  if (isTestUser) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
          Dashboard (Test Mode)
        </h1>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/reports">
                <Button variant="outline" className="w-full h-16">
                  <FileText className="mr-2 h-5 w-5" />
                  View Reports
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full h-16">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Website Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Website Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <UrlForm />
          </CardContent>
        </Card>

        {/* Test User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>TU</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Test User</p>
                  <p className="text-sm text-muted-foreground">test@example.com</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Test Mode:</strong> You are logged in as a test user. 
                  Database features are disabled. This allows you to explore the 
                  interface without a working database connection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Original dashboard for real users
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Dashboard
      </h1>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/reports">
              <Button variant="outline" className="w-full h-16">
                <FileText className="mr-2 h-5 w-5" />
                View Reports
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full h-16">
                <PlusCircle className="mr-2 h-5 w-5" />
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Website Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Website Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <UrlForm />
        </CardContent>
      </Card>

      {/* Loading state for real users */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
