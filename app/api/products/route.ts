import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const limit = Number(searchParams.get('limit') || 50);
    const offset = Number(searchParams.get('offset') || 0);

    const db = getSupabase();
    let query = db.from('products').select('*').gt('stock', 0).order('id', { ascending: false }).range(offset, offset + limit - 1);

    if (category && category !== 'all') query = query.eq('category', category);
    if (featured === '1') query = query.eq('featured', true);
    if (search?.trim()) query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);

    const { data, error } = await query;
    if (error) return errorResponse(error.message, 500);
    return jsonResponse({ products: data });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Failed to load products', 500);
  }
}
