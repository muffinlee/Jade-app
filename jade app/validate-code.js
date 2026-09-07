// Validate a school access code
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { code } = JSON.parse(event.body || '{}');
  if (!code) return { statusCode: 400, body: JSON.stringify({ valid: false }) };

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data } = await sb.from('access_codes')
    .select('*').eq('code', code.toUpperCase()).eq('active', true).single();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valid: !!data, school: data?.school_name || null })
  };
};
