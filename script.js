const SUPABASE_URL = 'https://ipostkzlxgxmawmdkufz.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_-Pkqj4168gg02OdbgLcr3Q_1--IoEn7';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function loadEvents() {
    const { data, error } = await supabaseClient
        .from('events')
        .select('*');

    if (error) {
        console.error('일정 불러오기 실패:', error);
        return;
    }

    console.log('일정 데이터:', data);
}

loadEvents();
