import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getSupabase();
    const { data, error } = await db.from('products').select('*').eq('id', params.id).maybeSingle();
    if (error) return errorResponse(error.message, 500);
    if (!data) return errorResponse('Product not found', 404);
    return jsonResponse({ product: data });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Failed', 500);
  }
}
