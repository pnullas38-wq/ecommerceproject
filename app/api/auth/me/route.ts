import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Not authenticated', 401);
  return jsonResponse({ user });
}
