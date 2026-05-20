import { hashPassword, isAdminEmail, setSessionCookie, signToken } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name?.trim() || !email?.trim() || !password) {
      return errorResponse('Name, email, and password are required');
    }
    if (password.length < 6) return errorResponse('Password must be at least 6 characters');

    const db = getSupabase();
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await db.from('users').select('id').eq('email', normalizedEmail).maybeSingle();
    if (existing) return errorResponse('Email already registered', 409);

    const passwordHash = await hashPassword(password);
    const isAdmin = isAdminEmail(normalizedEmail);

    const { data: user, error } = await db
      .from('users')
      .insert({ name: name.trim(), email: normalizedEmail, password_hash: passwordHash, is_admin: isAdmin })
      .select('id, name, email, is_admin')
      .single();

    if (error) return errorResponse(error.message, 500);

    const token = await signToken(user);
    await setSessionCookie(token);
    return jsonResponse({ user, token }, 201);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Registration failed', 500);
  }
}
