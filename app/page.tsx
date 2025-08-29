import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function HomePage() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // User is authenticated, redirect to dashboard
      redirect('/dashboard');
    } else {
      // User is not authenticated, redirect to sign-in
      redirect('/sign-in');
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    // On error, redirect to sign-in
    redirect('/sign-in');
  }
}
