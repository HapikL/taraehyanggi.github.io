const SUPABASE_URL = 'https://ipostkzlxgxmawmdkufz.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_-Pkqj4168gg02OdbgLcr3Q_1--IoEn7';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log('Supabase 연결 준비 완료');
