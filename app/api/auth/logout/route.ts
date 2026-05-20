import { clearSessionCookie } from '@/lib/auth';
import { jsonResponse } from '@/lib/utils';

export async function POST() {
  await clearSessionCookie();
  return jsonResponse({ ok: true });
}
