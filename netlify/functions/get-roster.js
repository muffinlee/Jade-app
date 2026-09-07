const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  const auth = event.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return { statusCode: 401, body: 'Unauthorized' };
  const sbAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) return { statusCode: 401, body: 'Invalid session' };
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['teacher','school'].includes(profile.role)) {
    return { statusCode: 403, body: 'Forbidden' };
  }
  const { data: students, error } = await sb.from('profiles')
    .select('id,first_name,last_name,role,xp,completed_weeks,quiz_passes,created_at')
    .eq('role', 'student')
    .order('last_name');
  return {
    statusCode: error ? 500 : 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ students: students || [] })
  };
};
