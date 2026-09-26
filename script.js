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
const eventTime = document.getElementById('eventTime');
const eventPeople = document.getElementById('eventPeople');
const eventHost = document.getElementById('eventHost');

const todayDateLabel = document.getElementById('todayDateLabel');
const todayCountBadge = document.getElementById('todayCountBadge');
const todaySummaryList = document.getElementById('todaySummaryList');

const detailModal = document.getElementById('detailModal');
const closeDetailModalButton = document.getElementById('closeDetailModalButton');
const editFromDetailButton = document.getElementById('editFromDetailButton');

const detailCategoryBadge = document.getElementById('detailCategoryBadge');
const detailTitle = document.getElementById('detailTitle');
const detailDate = document.getElementById('detailDate');
const detailTime = document.getElementById('detailTime');
const detailPeople = document.getElementById('detailPeople');
const detailHost = document.getElementById('detailHost');
const detailDescription = document.getElementById('detailDescription');
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
    renderTodaySummary();
}


/* =========================
   YYYY-MM-DD 변환
========================= */

function formatDate(year, month, day) {
    const monthString = String(month + 1).padStart(2, '0');
    const dayString = String(day).padStart(2, '0');

    return `${year}-${monthString}-${dayString}`;
}
function getCategoryClass(category) {
    if (category === '보겜') return 'category-bogem';
    if (category === '머미') return 'category-meomi';
    if (category === '협추') return 'category-hyeobchu';
    return 'category-etc';
}

function formatKoreanDate(dateString) {
    const date = new Date(dateString);

    const weekNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekNames[date.getDay()]}`;
}
function renderTodaySummary() {
    const today = new Date();

    const todayString = formatDate(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const todayEvents = events
        .filter(event => event.start_date === todayString)
        .sort((a, b) => (a.event_time || '').localeCompare(b.event_time || ''));

    todayDateLabel.textContent = formatKoreanDate(todayString);
    todayCountBadge.textContent = `${todayEvents.length}건`;
    const todaySummaryCard = document.querySelector('.today-summary-card');

if (todayEvents.length === 0) {
    todaySummaryCard.classList.add('no-events');
} else {
    todaySummaryCard.classList.remove('no-events');
}

    if (todayEvents.length === 0) {
        todaySummaryList.textContent = '오늘 일정이 없습니다.';
        return;
    }

    todaySummaryList.innerHTML = todayEvents.map(event => {
        return `
            <div class="today-summary-item">
                <strong>${event.category || '기타'}</strong>
                <span>${event.title || ''}</span>
                <span>🕒 ${event.event_time || '--:--'}</span>
                <span>👥 ${event.people_count ?? '-'}명</span>
                <span>벙주 ${event.host_name || '-'}</span>
            </div>
        `;
    }).join('');
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
dayElement.addEventListener('dragover', (e) => {
    if (!isAdmin) {
        return;
    }

    e.preventDefault();

    dayElement.classList.add('drag-over');
});
dayElement.addEventListener('dragleave', () => {
    dayElement.classList.remove('drag-over');
});
        dayElement.addEventListener('drop', async (e) => {
    if (!isAdmin) {
        return;
    }

    e.preventDefault();

    dayElement.classList.remove('drag-over');

    const eventId = e.dataTransfer.getData('text/plain');

    if (!eventId) {
        return;
    }

    const { error } = await supabaseClient
        .from('events')
        .update({
            start_date: dateString
        })
        .eq('id', eventId);

    if (error) {
        console.error('일정 이동 실패:', error);
        alert('일정 이동에 실패했습니다.');
        return;
    }

    await loadEvents();
});
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
    eventTime.value = '';
eventPeople.value = '';
eventHost.value = '';

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

   const dayEvents = events
    .filter(
        event => event.start_date === dateString
    )
    .sort((a, b) => {
        const timeA = a.event_time || '99:99';
        const timeB = b.event_time || '99:99';

        return timeA.localeCompare(timeB);
    });

        dayEvents.forEach(event => {
    const eventElement = document.createElement('div');

    eventElement.classList.add('event');
    eventElement.classList.add(getCategoryClass(event.category));
            
eventElement.draggable = isAdmin;
eventElement.dataset.eventId = event.id;
            eventElement.addEventListener('dragstart', (e) => {
    if (!isAdmin) {
        e.preventDefault();
        return;
    }

    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';

    eventElement.classList.add('dragging');
});
       eventElement.addEventListener('dragend', () => {
    eventElement.classList.remove('dragging');
});
            
    eventElement.innerHTML = `
        <div class="event-time">${event.event_time || '--:--'}</div>
        <div class="event-title">${event.title || ''}</div>
        <div class="event-meta">
            <span>${event.people_count ?? '-'}명</span>
            <span>벙주 ${event.host_name || '-'}</span>
        </div>
    `;

    eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
editingEventId = event.id;
        
        detailCategoryBadge.textContent = event.category || '기타';
        detailCategoryBadge.className = `detail-category-badge ${getCategoryClass(event.category)}`;

        detailTitle.textContent = event.title || '';
        detailDate.textContent = formatKoreanDate(event.start_date);
        detailTime.textContent = event.event_time || '-';
        detailPeople.textContent = `${event.people_count ?? '-'}명`;
        detailHost.textContent = event.host_name || '-';
        detailDescription.textContent = event.description || '-';

        if (isAdmin) {
            editFromDetailButton.style.display = 'inline-block';
        } else {
            editFromDetailButton.style.display = 'none';
        }

        editFromDetailButton.onclick = () => {
            detailModal.classList.add('hidden');

            editingEventId = event.id;
            selectedDate = event.start_date;

            eventModalTitle.textContent = '일정 수정';
            selectedDateText.textContent = `선택한 날짜: ${selectedDate}`;

            eventTitle.value = event.title || '';
            eventTime.value = event.event_time || '';
            eventPeople.value = event.people_count ?? '';
            eventHost.value = event.host_name || '';
            eventDescription.value = event.description || '';
            eventCategory.value = event.category || '머미';

            deleteEventButton.style.display = 'inline-block';
            eventModal.classList.remove('hidden');
        };

        detailModal.classList.remove('hidden');
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
closeDetailModalButton.addEventListener('click', () => {
    detailModal.classList.add('hidden');
});

/* =========================
   일정 저장
========================= */

saveEventButton.addEventListener('click', async () => {
    if (!isAdmin) {
        alert('관리자만 일정을 저장할 수 있습니다.');
        return;
    }
console.log('현재 editingEventId:', editingEventId);
    const title = eventTitle.value.trim();

    if (!title) {
        alert('일정 제목을 입력하세요.');
        return;
    }

    const eventData = {
        title: title,
        description: eventDescription.value.trim(),
        start_date: selectedDate,
        category: eventCategory.value,
        event_time: eventTime.value.trim(),
        people_count: eventPeople.value
            ? parseInt(eventPeople.value, 10)
            : null,
        host_name: eventHost.value.trim()
    };

    let error;

    if (editingEventId !== null) {
        const result = await supabaseClient
            .from('events')
            .update(eventData)
            .eq('id', editingEventId);

        error = result.error;
    } else {
        const result = await supabaseClient
            .from('events')
            .insert(eventData);

        error = result.error;
    }

    if (error) {
        console.error('일정 저장 실패:', error);
        alert('일정 저장에 실패했습니다.');
        return;
    }

    eventModal.classList.add('hidden');

    editingEventId = null;

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
