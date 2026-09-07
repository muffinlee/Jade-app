const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const auth = event.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return { statusCode: 401, body: 'Unauthorized' };
  const sbAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) return { statusCode: 401, body: 'Invalid session' };
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { completed_weeks, xp, quiz_passes, holdings, cash } = JSON.parse(event.body || '{}');
  const { error } = await sb.from('profiles').update({
    completed_weeks, xp, quiz_passes,
    holdings: holdings || {},
    cash: cash || 100000,
    updated_at: new Date().toISOString()
  }).eq('id', user.id);
  return {
    statusCode: error ? 500 : 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: !error, error: error?.message })
  };
};
