import { Suspense } from 'react';
import { SupabaseAuth } from '@/components/auth/SupabaseAuth';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; inviteId?: string; error?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <Suspense>
      <SupabaseAuth 
        mode="signin" 
        redirectTo={params.redirect}
        inviteId={params.inviteId}
      />
    </Suspense>
  );
}
