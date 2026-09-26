const SUPABASE_URL = 'https://ipostkzlxgxmawmdkufz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-Pkqj4168gg02OdbgLcr3Q_1--IoEn7';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
const calendarGrid = document.getElementById('calendarGrid');
const calendarTitle = document.getElementById('calendarTitle');

const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const todayButton = document.getElementById('todayButton');

const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');

const eventModal = document.getElementById('eventModal');
const eventTitle = document.getElementById('eventTitle');
const eventDescription = document.getElementById('eventDescription');
const eventCategory = document.getElementById('eventCategory');
const selectedDateText = document.getElementById('selectedDateText');

const cancelEventButton = document.getElementById('cancelEventButton');
const saveEventButton = document.getElementById('saveEventButton');
const deleteEventButton = document.getElementById('deleteEventButton');
const eventModalTitle = document.getElementById('eventModalTitle');

let currentDate = new Date();
let events = [];
let selectedDate = null;
let currentUser = null;
let isAdmin = false;
let editingEventId = null;

/* =========================
   로그인 상태 확인
========================= */

async function checkLogin() {
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    currentUser = user;

    if (!user) {
        isAdmin = false;

        loginButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';

        return;
    }

    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('프로필 확인 실패:', error);
        isAdmin = false;
    } else {
        isAdmin = profile?.role === 'admin';
    }

    loginButton.style.display = 'none';
    logoutButton.style.display = 'inline-block';
}


/* =========================
   로그인
========================= */

loginButton.addEventListener('click', async () => {
    const email = prompt('이메일을 입력하세요.');

    if (!email) {
        return;
    }

    const password = prompt('비밀번호를 입력하세요.');

    if (!password) {
        return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert('로그인에 실패했습니다.');
        console.error(error);
        return;
    }

    await checkLogin();

    if (isAdmin) {
        alert('관리자로 로그인되었습니다.');
    } else {
        alert('로그인되었습니다.');
    }
});


/* =========================
   로그아웃
========================= */

logoutButton.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();

    currentUser = null;
    isAdmin = false;

    await checkLogin();

    alert('로그아웃되었습니다.');
});


/* =========================
   일정 불러오기
========================= */

async function loadEvents() {
    const { data, error } = await supabaseClient
        .from('events')
        .select('*');

    if (error) {
        console.error('일정 불러오기 실패:', error);
        return;
    }

    events = data || [];

    renderCalendar();
}


/* =========================
   YYYY-MM-DD 변환
========================= */

function formatDate(year, month, day) {
    const monthString = String(month + 1).padStart(2, '0');
    const dayString = String(day).padStart(2, '0');

    return `${year}-${monthString}-${dayString}`;
}


/* =========================
   달력 그리기
========================= */

function renderCalendar() {
    calendarGrid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    calendarTitle.textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const previousMonthLastDate = new Date(year, month, 0).getDate();

    const today = new Date();

    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
        const dayElement = document.createElement('div');

        dayElement.classList.add('day');

        let displayDay;
        let cellYear = year;
        let cellMonth = month;

        /* 이전 달 */

        if (i < firstDay) {
            displayDay =
                previousMonthLastDate
                - firstDay
                + i
                + 1;

            cellMonth = month - 1;

            if (cellMonth < 0) {
                cellMonth = 11;
                cellYear--;
            }

            dayElement.classList.add('other-month');
        }

        /* 이번 달 */

        else if (i < firstDay + lastDate) {
            displayDay = i - firstDay + 1;
        }

        /* 다음 달 */

        else {
            displayDay =
                i
                - firstDay
                - lastDate
                + 1;

            cellMonth = month + 1;

            if (cellMonth > 11) {
                cellMonth = 0;
                cellYear++;
            }

            dayElement.classList.add('other-month');
        }

        const dateString = formatDate(
            cellYear,
            cellMonth,
            displayDay
        );

        dayElement.dataset.date = dateString;


        /* =========================
           관리자 날짜 클릭
        ========================= */

dayElement.addEventListener('click', () => {
    if (!isAdmin) {
        return;
    }

    editingEventId = null;
    selectedDate = dateString;

    eventModalTitle.textContent = '일정 추가';

    selectedDateText.textContent =
        `선택한 날짜: ${selectedDate}`;

    eventTitle.value = '';
    eventDescription.value = '';
    eventCategory.value = '머미';

    deleteEventButton.style.display = 'none';

    eventModal.classList.remove('hidden');
});


        /* 오늘 표시 */

        if (
            cellYear === today.getFullYear()
            &&
            cellMonth === today.getMonth()
            &&
            displayDay === today.getDate()
        ) {
            dayElement.classList.add('today');
        }


        /* 날짜 숫자 */

        const numberElement = document.createElement('div');

        numberElement.classList.add('day-number');
        numberElement.textContent = displayDay;

        dayElement.appendChild(numberElement);


        /* 일정 표시 */

        const dayEvents = events.filter(
            event => event.start_date === dateString
        );

        dayEvents.forEach(event => {
    const eventElement = document.createElement('div');

    eventElement.classList.add('event');

    eventElement.textContent = event.title;

    eventElement.title =
        event.description || event.title;

    eventElement.addEventListener('click', (e) => {
        e.stopPropagation();

        if (!isAdmin) {
            return;
        }

        editingEventId = event.id;
        selectedDate = event.start_date;

        eventModalTitle.textContent = '일정 수정';

        selectedDateText.textContent =
            `선택한 날짜: ${selectedDate}`;

        eventTitle.value = event.title || '';
        eventDescription.value = event.description || '';
        eventCategory.value = event.category || '머미';

        deleteEventButton.style.display = 'inline-block';

        eventModal.classList.remove('hidden');
    });

    dayElement.appendChild(eventElement);
});

        calendarGrid.appendChild(dayElement);
    }
}


/* =========================
   이전 달
========================= */

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();
});


/* =========================
   다음 달
========================= */

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();
});


/* =========================
   오늘
========================= */

todayButton.addEventListener('click', () => {
    currentDate = new Date();

    renderCalendar();
});


/* =========================
   일정 추가 취소
========================= */

cancelEventButton.addEventListener('click', () => {
    eventModal.classList.add('hidden');

    editingEventId = null;
});


/* =========================
   일정 저장
========================= */

saveEventButton.addEventListener('click', async () => {
    if (!isAdmin) {
        alert('관리자만 일정을 추가할 수 있습니다.');
        return;
    }

    const title = eventTitle.value.trim();

    if (!title) {
        alert('일정 제목을 입력하세요.');
        return;
    }

    const { error } = await supabaseClient
        .from('events')
        .insert({
            title: title,
            description: eventDescription.value.trim(),
            start_date: selectedDate,
            category: eventCategory.value
        });

    if (error) {
        console.error('일정 저장 실패:', error);
        alert('일정 저장에 실패했습니다.');
        return;
    }

    eventModal.classList.add('hidden');

    await loadEvents();
});

deleteEventButton.addEventListener('click', async () => {
    if (!isAdmin) {
        alert('관리자 권한이 없습니다.');
        return;
    }

    if (!editingEventId) {
        alert('삭제할 일정 ID를 찾지 못했습니다.');
        return;
    }

    const confirmed = confirm('이 일정을 삭제할까요?');

    if (!confirmed) {
        return;
    }

    console.log('삭제할 일정 ID:', editingEventId);

    const { data, error } = await supabaseClient
        .from('events')
        .delete()
        .eq('id', editingEventId)
        .select();

    if (error) {
        console.error('일정 삭제 실패:', error);
        alert('일정 삭제에 실패했습니다.');
        return;
    }

    console.log('삭제 결과:', data);

    if (!data || data.length === 0) {
        alert('삭제 권한 또는 RLS 정책을 확인해야 합니다.');
        return;
    }

    eventModal.classList.add('hidden');

    editingEventId = null;

    await loadEvents();
});

/* =========================
   시작
========================= */

async function init() {
    await checkLogin();
    await loadEvents();
}

init();
