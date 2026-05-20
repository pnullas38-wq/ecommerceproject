import { setSessionCookie, signToken, verifyPassword } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email?.trim() || !password) return errorResponse('Email and password are required');

    const db = getSupabase();
    const { data: user, error } = await db
      .from('users')
      .select('id, name, email, is_admin, password_hash')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !user) return errorResponse('Invalid email or password', 401);
    if (!(await verifyPassword(password, user.password_hash))) {
      return errorResponse('Invalid email or password', 401);
    }

    const { password_hash: _, ...safeUser } = user;
    const token = await signToken(safeUser);
    await setSessionCookie(token);
    return jsonResponse({ user: safeUser, token });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Login failed', 500);
  }
}
