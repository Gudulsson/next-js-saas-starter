'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, FileText } from 'lucide-react';
import { UrlForm } from '@/components/UrlForm';
import Link from 'next/link';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Current Plan: {teamData?.planName || 'Free'}
              </p>
              <p className="text-sm text-muted-foreground">
                {teamData?.subscriptionStatus === 'active'
                  ? 'Billed monthly'
                  : teamData?.subscriptionStatus === 'trialing'
                  ? 'Trial period'
                  : 'No active subscription'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Subscription
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  if (!teamData) {
    return <TeamMembersSkeleton />;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamData.teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {member.user.name
                      ? member.user.name.charAt(0).toUpperCase()
                      : member.user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground capitalize">
                  {member.role}
                </span>
                {member.role !== 'owner' && (
                  <form action={removeAction}>
                    <input
                      type="hidden"
                      name="userId"
                      value={member.user.id}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={isRemovePending}
                    >
                      {isRemovePending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Remove'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>Role</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && (
            <p className="text-red-500">{inviteState.error}</p>
          )}
          {inviteState?.success && (
            <p className="text-green-500">{inviteState.success}</p>
          )}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
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
  );
}

export default function DashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Dashboard
      </h1>

      {/* Quick Actions */}
      <QuickActions />

      {/* Website Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Website Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <UrlForm />
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Suspense fallback={<SubscriptionSkeleton />}>
        <ManageSubscription />
      </Suspense>

      {/* Team Members */}
      <Suspense fallback={<TeamMembersSkeleton />}>
        <TeamMembers />
      </Suspense>

      {/* Invite Team Member */}
      <Suspense fallback={<InviteTeamMemberSkeleton />}>
        <InviteTeamMember />
      </Suspense>
    </section>
  );
}
