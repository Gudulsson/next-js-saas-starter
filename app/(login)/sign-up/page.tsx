import { Suspense } from 'react';
import { SupabaseAuth } from '@/components/auth/SupabaseAuth';

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; inviteId?: string; error?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <Suspense>
      <SupabaseAuth 
        mode="signup" 
        redirectTo={params.redirect}
        inviteId={params.inviteId}
      />
    </Suspense>
  );
}
