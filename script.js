/* ==================================================
   01. Supabase 연결
================================================== */

const SUPABASE_URL =
    'https://ipostkzlxgxmawmdkufz.supabase.co';

const SUPABASE_KEY =
    'sb_publishable_-Pkqj4168gg02OdbgLcr3Q_1--IoEn7';

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/* ==================================================
   02. DOM 요소
================================================== */

/* 달력 */

const calendarGrid =
    document.getElementById('calendarGrid');

const calendarTitle =
    document.getElementById('calendarTitle');

const prevMonthButton =
    document.getElementById('prevMonth');

const nextMonthButton =
    document.getElementById('nextMonth');

const todayButton =
    document.getElementById('todayButton');


/* 로그인 */

const loginButton =
    document.getElementById('loginButton');

const logoutButton =
    document.getElementById('logoutButton');

const quickAddEventButton =
    document.getElementById('quickAddEventButton');

const settlementButton =
    document.getElementById('settlementButton');

const loginModal =
    document.getElementById('loginModal');

const loginEmail =
    document.getElementById('loginEmail');

const loginPassword =
    document.getElementById('loginPassword');

const submitLoginButton =
    document.getElementById('submitLoginButton');

const closeLoginButton =
    document.getElementById('closeLoginButton');

const togglePasswordButton =
    document.getElementById('togglePasswordButton');

const loginErrorMessage =
    document.getElementById('loginErrorMessage');


/* 일정 추가 / 수정 */

const eventModal =
    document.getElementById('eventModal');

const eventModalTitle =
    document.getElementById('eventModalTitle');

const eventDate =
    document.getElementById('eventDate');

const eventTitle =
    document.getElementById('eventTitle');

const eventTime =
    document.getElementById('eventTime');

const eventTimePeopleRow =
    document.getElementById(
        'eventTimePeopleRow'
    );

const eventPeople =
    document.getElementById('eventPeople');

const eventHost =
    document.getElementById('eventHost');

const eventDescription =
    document.getElementById('eventDescription');

const eventCategory =
    document.getElementById('eventCategory');

const eventNomad =
    document.getElementById('eventNomad');

const selectedDateText =
    document.getElementById('selectedDateText');

const saveEventButton =
    document.getElementById('saveEventButton');

const cancelEventButton =
    document.getElementById('cancelEventButton');

const deleteEventButton =
    document.getElementById('deleteEventButton');


/* 오늘 일정 */

const todayDateLabel =
    document.getElementById('todayDateLabel');

const todayCountBadge =
    document.getElementById('todayCountBadge');

const todaySummaryList =
    document.getElementById('todaySummaryList');


/* 상세보기 */

const detailModal =
    document.getElementById('detailModal');

const closeDetailModalButton =
    document.getElementById('closeDetailModalButton');

const editFromDetailButton =
    document.getElementById('editFromDetailButton');

const addToCalendarButton =
    document.getElementById('addToCalendarButton');

const detailCategoryBadge =
    document.getElementById('detailCategoryBadge');

const detailTitle =
    document.getElementById('detailTitle');

const detailDate =
    document.getElementById('detailDate');

const detailTime =
    document.getElementById('detailTime');

const detailPeople =
    document.getElementById('detailPeople');

const detailHost =
    document.getElementById('detailHost');

const detailDescription =
    document.getElementById('detailDescription');


/* 필터 */

const filterButtons =
    document.querySelectorAll('.filter-button');



/* ==================================================
   03. 전역 상태
================================================== */

let currentDate = new Date();

let events = [];

let selectedDate = null;

let currentUser = null;

let isAdmin = false;

let editingEventId = null;

let selectedDetailEvent = null;

let selectedCategoryFilter = '전체';



/* ==================================================
   04. 공통 유틸 함수
================================================== */

/* YYYY-MM-DD */

function formatDate(year, month, day) {

    const monthString =
        String(month + 1).padStart(2, '0');

    const dayString =
        String(day).padStart(2, '0');

    return `${year}-${monthString}-${dayString}`;
}


/* YYYY-MM-DD를 로컬 Date로 변환 */

function parseLocalDate(dateString) {

    const [year, month, day] =
        dateString.split('-').map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


/* 한글 날짜 */

function formatKoreanDate(dateString) {

    const date =
        parseLocalDate(dateString);

    const weekNames = [
        '일요일',
        '월요일',
        '화요일',
        '수요일',
        '목요일',
        '금요일',
        '토요일'
    ];

    return (
        `${date.getFullYear()}년 ` +
        `${date.getMonth() + 1}월 ` +
        `${date.getDate()}일 ` +
        `${weekNames[date.getDay()]}`
    );
}


/* 카테고리 CSS */

function getCategoryClass(category) {

    if (category === '보겜') {
        return 'category-bogem';
    }

    if (category === '머미') {
        return 'category-meomi';
    }

    if (category === '협추') {
        return 'category-hyeobchu';
    }

    return 'category-etc';
}


/* HTML 안전 처리 */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}



/* ==================================================
   05. 로그인 상태 확인
================================================== */

async function checkLogin() {

    const {
        data: { user }
    } =
        await supabaseClient.auth.getUser();

    currentUser = user;


    /* 로그아웃 상태 */

    if (!user) {

        isAdmin = false;

        loginButton.style.display =
            'inline-block';

        logoutButton.style.display =
            'none';

        quickAddEventButton.style.display =
            'none';
       settlementButton.style.display =
    'none';

        return;
    }


    /* 관리자 권한 확인 */

    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();


    if (error) {

        console.error(
            '프로필 확인 실패:',
            error
        );

        isAdmin = false;

    } else {

        isAdmin =
            profile?.role === 'admin';
    }


    loginButton.style.display =
        'none';

    logoutButton.style.display =
        'inline-block';

    quickAddEventButton.style.display =
        isAdmin
            ? 'inline-block'
            : 'none';
   settlementButton.style.display =
    isAdmin
        ? 'flex'
        : 'none';
}



/* ==================================================
   06. 로그인 / 로그아웃
================================================== */

/* 로그인창 열기 */

loginButton.addEventListener(
    'click',
    () => {

        loginEmail.value = '';
        loginPassword.value = '';

        loginErrorMessage.textContent = '';

        loginPassword.type =
            'password';

        togglePasswordButton.textContent =
            '보기';

        loginModal.classList.remove(
            'hidden'
        );

        setTimeout(
            () => loginEmail.focus(),
            100
        );
    }
);


/* 로그인 실행 */

submitLoginButton.addEventListener(
    'click',
    async () => {

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;

        loginErrorMessage.textContent = '';


        if (!email) {

            loginErrorMessage.textContent =
                '이메일을 입력해주세요.';

            return;
        }


        if (!password) {

            loginErrorMessage.textContent =
                '비밀번호를 입력해주세요.';

            return;
        }


        submitLoginButton.disabled =
            true;

        submitLoginButton.textContent =
            '로그인 중...';


        const { error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });


        submitLoginButton.disabled =
            false;

        submitLoginButton.textContent =
            '로그인';


        if (error) {

            loginErrorMessage.textContent =
                '이메일 또는 비밀번호가 올바르지 않습니다.';

            console.error(
                '로그인 실패:',
                error
            );

            return;
        }


        await checkLogin();

        loginPassword.value = '';

        loginModal.classList.add(
            'hidden'
        );

        renderCalendar();


        if (isAdmin) {
            alert(
                '관리자로 로그인되었습니다.'
            );
        } else {
            alert(
                '로그인되었습니다.'
            );
        }
    }
);


/* 로그인창 닫기 */

closeLoginButton.addEventListener(
    'click',
    () => {

        loginModal.classList.add(
            'hidden'
        );

        loginPassword.value = '';

        loginErrorMessage.textContent = '';
    }
);


/* 비밀번호 보기 */

togglePasswordButton.addEventListener(
    'click',
    () => {

        const isHidden =
            loginPassword.type ===
            'password';

        loginPassword.type =
            isHidden
                ? 'text'
                : 'password';

        togglePasswordButton.textContent =
            isHidden
                ? '숨기기'
                : '보기';
    }
);


/* Enter 로그인 */

loginPassword.addEventListener(
    'keydown',
    (event) => {

        if (event.key === 'Enter') {
            submitLoginButton.click();
        }
    }
);


/* 로그아웃 */

logoutButton.addEventListener(
    'click',
    async () => {

        await supabaseClient.auth
            .signOut();

        currentUser = null;
        isAdmin = false;

        await checkLogin();

        renderCalendar();

        alert(
            '로그아웃되었습니다.'
        );
    }
);



/* ==================================================
   07. 일정 불러오기
================================================== */

async function loadEvents() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from('events')
            .select('*');


    if (error) {

        console.error(
            '일정 불러오기 실패:',
            error
        );

        return;
    }


    events = data || [];

    renderCalendar();

    renderTodaySummary();
}



/* ==================================================
   08. 오늘 일정
================================================== */

function renderTodaySummary() {

    const today = new Date();

    const todayString =
        formatDate(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    const todayEvents =
        events
            .filter(
                event =>
                    event.start_date ===
                    todayString
            )
            .sort(
                (a, b) =>
                    (a.event_time || '')
                        .localeCompare(
                            b.event_time || ''
                        )
            );


    todayDateLabel.textContent =
        formatKoreanDate(
            todayString
        );

    todayCountBadge.textContent =
        `${todayEvents.length}건`;


    const summaryCard =
        document.querySelector(
            '.today-summary-card'
        );


    if (todayEvents.length === 0) {

        summaryCard.classList.add(
            'no-events'
        );

        todaySummaryList.textContent =
            '오늘 일정이 없습니다.';

        return;
    }


    summaryCard.classList.remove(
        'no-events'
    );


    todaySummaryList.innerHTML =
        todayEvents
            .map(event => {

                return `
                    <div class="today-summary-item">

                        <strong>
                            ${escapeHTML(
                                event.category ||
                                '기타'
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                event.title || ''
                            )}
                        </span>

                        <span>
                            🕒
                            ${escapeHTML(
                                event.event_time ||
                                '--:--'
                            )}
                        </span>

                        <span>
                            👥
                            ${event.people_count ?? '-'}명
                        </span>

                        <span>
                            벙주
                            ${escapeHTML(
                                event.host_name ||
                                '-'
                            )}
                        </span>

                    </div>
                `;
            })
            .join('');
}



/* ==================================================
   09. 일정 입력창 공통 함수
================================================== */

function updateEventFormByCategory() {

    const isPersonal =
        eventCategory.value === '기타';


    if (isPersonal) {

        eventPeople.style.display =
            'none';

        eventHost.style.display =
            'none';

        eventDescription.style.display =
            'none';

        eventNomad.style.display =
            'none';


        eventTimePeopleRow.style
            .gridTemplateColumns =
                '1fr';

    } else {

        eventPeople.style.display =
            '';

        eventHost.style.display =
            '';

        eventDescription.style.display =
            '';

        eventNomad.style.display =
            '';


        eventTimePeopleRow.style
            .gridTemplateColumns =
                '';
    }
}

eventCategory.addEventListener(
    'change',
    updateEventFormByCategory
);

/* 새 일정 */

function openCreateEventModal(
    dateString
) {

    editingEventId = null;

    selectedDate = dateString;


    eventModalTitle.textContent =
        '일정 추가';

    eventDate.value =
        dateString;

    selectedDateText.textContent =
        `선택한 날짜: ${dateString}`;


    eventTitle.value = '';
    eventTime.value = '';
    eventPeople.value = '';
    eventHost.value = '';
    eventDescription.value = '';

    eventCategory.value =
        '머미';

eventNomad.value =
    'X';

   updateEventFormByCategory();

    deleteEventButton.style.display =
        'none';

    eventModal.classList.remove(
        'hidden'
    );
}


/* 일정 수정 */

function openEditEventModal(event) {

    editingEventId =
        event.id;

    selectedDate =
        event.start_date;


    eventModalTitle.textContent =
        '일정 수정';

    eventDate.value =
        event.start_date;

    selectedDateText.textContent =
        `선택한 날짜: ${event.start_date}`;


    eventTitle.value =
        event.title || '';

    eventTime.value =
        event.event_time || '';

    eventPeople.value =
        event.people_count ?? '';

    eventHost.value =
        event.host_name || '';

    eventDescription.value =
        event.description || '';

    eventCategory.value =
        event.category || '머미';

    eventNomad.value =
    (
        event.ab_type === 'O' ||
        event.ab_type === 'X'
    )
        ? event.ab_type
        : 'X';

   updateEventFormByCategory();

    deleteEventButton.style.display =
        'inline-block';

    eventModal.classList.remove(
        'hidden'
    );
}



/* ==================================================
   10. 달력 렌더링
================================================== */

function renderCalendar() {

    calendarGrid.innerHTML = '';


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    calendarTitle.textContent =
        `${year}년 ${month + 1}월`;


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const totalCells =
        Math.ceil(
            (firstDay + lastDate) / 7
        ) * 7;


    const today =
        new Date();


    for (
        let i = 0;
        i < totalCells;
        i++
    ) {

        const dayElement =
            document.createElement('div');

        dayElement.classList.add(
            'day'
        );


        /* 이전 달 빈칸 */

        if (i < firstDay) {

            dayElement.classList.add(
                'empty-day'
            );

            calendarGrid.appendChild(
                dayElement
            );

            continue;
        }


        /* 다음 달 빈칸 */

        if (
            i >=
            firstDay + lastDate
        ) {

            dayElement.classList.add(
                'empty-day'
            );

            calendarGrid.appendChild(
                dayElement
            );

            continue;
        }


        /* 현재 달 날짜 */

        const displayDay =
            i - firstDay + 1;

        const dateString =
            formatDate(
                year,
                month,
                displayDay
            );

        dayElement.dataset.date =
            dateString;


        /* 주말 배경 */

        const cellDate =
            new Date(
                year,
                month,
                displayDay
            );

        const dayOfWeek =
            cellDate.getDay();


        if (dayOfWeek === 0) {

            dayElement.classList.add(
                'sunday-cell'
            );
        }


        if (dayOfWeek === 6) {

            dayElement.classList.add(
                'saturday-cell'
            );
        }


        /* 오늘 표시 */

        if (
            year ===
                today.getFullYear()
            &&
            month ===
                today.getMonth()
            &&
            displayDay ===
                today.getDate()
        ) {

            dayElement.classList.add(
                'today'
            );
        }


        /* 날짜 헤더 */

        const dayHeader =
            document.createElement(
                'div'
            );

        dayHeader.classList.add(
            'day-header'
        );


        const numberElement =
            document.createElement(
                'div'
            );

        numberElement.classList.add(
            'day-number'
        );

        numberElement.textContent =
            displayDay;


        /* 유목민 여부
           해당 날짜에 O 일정이 하나라도 있으면
           우측 상단에 🏕️ 표시 */

        const hasNomadEvent =
            events
                .filter(
                    event =>
                        event.start_date ===
                        dateString
                )
                .some(
                    event =>
                        event.ab_type ===
                        'O'
                );


        const nomadIndicator =
            document.createElement(
                'span'
            );

        nomadIndicator.classList.add(
            'nomad-indicator'
        );


        if (hasNomadEvent) {

            nomadIndicator.textContent =
                '🏕️';
        }


        dayHeader.appendChild(
            numberElement
        );

        dayHeader.appendChild(
            nomadIndicator
        );

        dayElement.appendChild(
            dayHeader
        );


        /* 관리자 날짜 클릭 */

        dayElement.addEventListener(
            'click',
            () => {

                if (!isAdmin) {
                    return;
                }

                openCreateEventModal(
                    dateString
                );
            }
        );


        /* 드래그 대상 날짜 */

        dayElement.addEventListener(
            'dragover',
            event => {

                if (!isAdmin) {
                    return;
                }

                event.preventDefault();

                dayElement.classList.add(
                    'drag-over'
                );
            }
        );


        dayElement.addEventListener(
            'dragleave',
            () => {

                dayElement.classList.remove(
                    'drag-over'
                );
            }
        );


        dayElement.addEventListener(
            'drop',
            async event => {

                if (!isAdmin) {
                    return;
                }

                event.preventDefault();

                dayElement.classList.remove(
                    'drag-over'
                );


                const eventId =
                    event.dataTransfer
                        .getData(
                            'text/plain'
                        );


                if (!eventId) {
                    return;
                }


                const { error } =
                    await supabaseClient
                        .from('events')
                        .update({
                            start_date:
                                dateString
                        })
                        .eq(
                            'id',
                            eventId
                        );


                if (error) {

                    console.error(
                        '일정 이동 실패:',
                        error
                    );

                    alert(
                        '일정 이동에 실패했습니다.'
                    );

                    return;
                }


                await loadEvents();
            }
        );


        /* 해당 날짜 일정 */

        const dayEvents =
            events
                .filter(event => {

                    const sameDate =
                        event.start_date ===
                        dateString;

                    const categoryMatches =
                        selectedCategoryFilter ===
                            '전체'
                        ||
                        event.category ===
                            selectedCategoryFilter;

                    return (
                        sameDate &&
                        categoryMatches
                    );
                })
                .sort(
                    (a, b) => {

                        const timeA =
                            a.event_time ||
                            '99:99';

                        const timeB =
                            b.event_time ||
                            '99:99';

                        return (
                            timeA.localeCompare(
                                timeB
                            )
                        );
                    }
                );


        /* 일정 카드 */

        dayEvents.forEach(event => {

            const eventElement =
                document.createElement(
                    'div'
                );


            eventElement.classList.add(
                'event',
                getCategoryClass(
                    event.category
                )
            );


            eventElement.draggable =
                isAdmin;

            eventElement.dataset.eventId =
                event.id;


            eventElement.innerHTML = `
                <div class="event-time">
                    ${escapeHTML(
                        event.event_time ||
                        '--:--'
                    )}
                </div>

                <div class="event-title">
                    ${escapeHTML(
                        event.title || ''
                    )}
                </div>

   ${
    event.category !== '기타'
        ? `
            <div class="event-meta">

                <span>
                    ${event.people_count ?? '-'}명
                </span>

                <span>
                    벙주
                    ${escapeHTML(
                        event.host_name ||
                        '-'
                    )}
                </span>

            </div>
        `
        : ''
}
            `;


            /* 드래그 */

            eventElement.addEventListener(
                'dragstart',
                dragEvent => {

                    if (!isAdmin) {

                        dragEvent
                            .preventDefault();

                        return;
                    }


                    dragEvent
                        .dataTransfer
                        .setData(
                            'text/plain',
                            event.id
                        );

                    dragEvent
                        .dataTransfer
                        .effectAllowed =
                            'move';


                    eventElement
                        .classList
                        .add(
                            'dragging'
                        );
                }
            );


            eventElement.addEventListener(
                'dragend',
                () => {

                    eventElement
                        .classList
                        .remove(
                            'dragging'
                        );
                }
            );


            /* 상세보기 */

            eventElement.addEventListener(
                'click',
                clickEvent => {

                    clickEvent
                        .stopPropagation();


                    selectedDetailEvent =
                        event;


                    detailCategoryBadge
                        .textContent =
                            event.category ||
                            '기타';

                    detailCategoryBadge
                        .className =
                            `detail-category-badge ${getCategoryClass(event.category)}`;


                    detailTitle.textContent =
                        event.title || '';

                    detailDate.textContent =
                        formatKoreanDate(
                            event.start_date
                        );

                    detailTime.textContent =
                        event.event_time ||
                        '-';

                    detailPeople.textContent =
                        `${event.people_count ?? '-'}명`;

                    detailHost.textContent =
                        event.host_name ||
                        '-';

                    detailDescription
                        .textContent =
                            event.description ||
                            '-';


                    editFromDetailButton
                        .style.display =
                            isAdmin
                                ? 'inline-block'
                                : 'none';


                    editFromDetailButton
                        .onclick =
                            () => {

                                detailModal
                                    .classList
                                    .add(
                                        'hidden'
                                    );

                                openEditEventModal(
                                    event
                                );
                            };


                    detailModal.classList.remove(
                        'hidden'
                    );
                }
            );


            dayElement.appendChild(
                eventElement
            );
        });


        calendarGrid.appendChild(
            dayElement
        );
    }
}



/* ==================================================
   11. 달력 이동 / 카테고리 필터
================================================== */

/* 이전 달 */

prevMonthButton.addEventListener(
    'click',
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
    }
);


/* 다음 달 */

nextMonthButton.addEventListener(
    'click',
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
    }
);


/* 오늘 */

todayButton.addEventListener(
    'click',
    () => {

        currentDate =
            new Date();

        renderCalendar();
    }
);


/* 카테고리 필터 */

filterButtons.forEach(button => {

    button.addEventListener(
        'click',
        () => {

            selectedCategoryFilter =
                button.dataset.category;


            filterButtons.forEach(
                filterButton => {

                    filterButton
                        .classList
                        .remove(
                            'active'
                        );
                }
            );


            button.classList.add(
                'active'
            );


            renderCalendar();
        }
    );
});



/* ==================================================
   12. 빠른 일정 추가
================================================== */

quickAddEventButton.addEventListener(
    'click',
    () => {

        if (!isAdmin) {
            return;
        }


        const today =
            new Date();


        const todayString =
            formatDate(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );


        openCreateEventModal(
            todayString
        );
    }
);



/* ==================================================
   13. 일정 추가 / 수정 / 삭제
================================================== */

/* 날짜 직접 변경 */

eventDate.addEventListener(
    'change',
    () => {

        selectedDate =
            eventDate.value;

        selectedDateText.textContent =
            selectedDate
                ? `선택한 날짜: ${selectedDate}`
                : '';
    }
);


/* 취소 */

cancelEventButton.addEventListener(
    'click',
    () => {

        eventModal.classList.add(
            'hidden'
        );

        editingEventId = null;
    }
);


/* 저장 */

saveEventButton.addEventListener(
    'click',
    async () => {

        if (!isAdmin) {

            alert(
                '관리자만 일정을 저장할 수 있습니다.'
            );

            return;
        }


        selectedDate =
            eventDate.value;


        if (!selectedDate) {

            alert(
                '날짜를 선택하세요.'
            );

            return;
        }


        const title =
            eventTitle.value.trim();


        if (!title) {

            alert(
                '일정 제목을 입력하세요.'
            );

            return;
        }
       
const isPersonalEvent =
    eventCategory.value === '기타';
       
        const eventData = {

            title,

            description:
    isPersonalEvent
        ? ''
        : eventDescription
            .value
            .trim(),

            start_date:
                selectedDate,

            category:
                eventCategory.value,

            event_time:
                eventTime
                    .value
                    .trim(),

            people_count:
    isPersonalEvent
        ? null
        : (
            eventPeople.value
                ? parseInt(
                    eventPeople.value,
                    10
                )
                : null
        ),

            host_name:
    isPersonalEvent
        ? ''
        : eventHost
            .value
            .trim(),

            /*
               DB의 기존 ab_type 컬럼을
               유목민 O/X 값 저장용으로 재사용
            */
     ab_type:
    isPersonalEvent
        ? 'X'
        : (
            eventNomad.value || 'X'
        ),
        };


        let error;


        /* 수정 */

        if (editingEventId) {

            const result =
                await supabaseClient
                    .from('events')
                    .update(eventData)
                    .eq(
                        'id',
                        editingEventId
                    );

            error =
                result.error;

        }

        /* 새 일정 */

        else {

            const result =
                await supabaseClient
                    .from('events')
                    .insert(
                        eventData
                    );

            error =
                result.error;
        }


        if (error) {

            console.error(
                '일정 저장 실패:',
                error
            );

            alert(
                '일정 저장에 실패했습니다.'
            );

            return;
        }


        eventModal.classList.add(
            'hidden'
        );

        editingEventId = null;


        await loadEvents();
    }
);


/* 삭제 */

deleteEventButton.addEventListener(
    'click',
    async () => {

        if (!isAdmin) {

            alert(
                '관리자 권한이 없습니다.'
            );

            return;
        }


        if (!editingEventId) {

            alert(
                '삭제할 일정 ID를 찾지 못했습니다.'
            );

            return;
        }


        const confirmed =
            confirm(
                '이 일정을 삭제할까요?'
            );


        if (!confirmed) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from('events')
                .delete()
                .eq(
                    'id',
                    editingEventId
                )
                .select();


        if (error) {

            console.error(
                '일정 삭제 실패:',
                error
            );

            alert(
                '일정 삭제에 실패했습니다.'
            );

            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            alert(
                '삭제 권한 또는 RLS 정책을 확인해야 합니다.'
            );

            return;
        }


        eventModal.classList.add(
            'hidden'
        );

        editingEventId = null;


        await loadEvents();
    }
);



/* ==================================================
   14. 상세보기 닫기
================================================== */

closeDetailModalButton.addEventListener(
    'click',
    () => {

        detailModal.classList.add(
            'hidden'
        );

        selectedDetailEvent =
            null;
    }
);



/* ==================================================
   15. 외부 캘린더 저장 (.ics)
================================================== */

/* ICS 문자열 안전 처리 */

function escapeICS(text) {

    if (!text) {
        return '';
    }

    return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/\r?\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}


/* 날짜만 ICS 형식 */

function formatICSDateOnly(
    dateString
) {

    return dateString
        .replace(/-/g, '');
}


/* 날짜 + 시간 ICS 형식 */

function formatICSDateTime(
    dateString,
    timeString
) {

    return (
        formatICSDateOnly(
            dateString
        )
        +
        'T'
        +
        timeString.replace(
            ':',
            ''
        )
        +
        '00'
    );
}


/* 다음 날짜 */

function getNextDateString(
    dateString
) {

    const date =
        parseLocalDate(
            dateString
        );

    date.setDate(
        date.getDate() + 1
    );

    return formatDate(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


/* ICS 다운로드 */

function downloadICS(event) {

    if (!event) {
        return;
    }


    const descriptionParts = [];


    if (event.category) {

        descriptionParts.push(
            `카테고리: ${event.category}`
        );
    }


    if (event.people_count) {

        descriptionParts.push(
            `인원: ${event.people_count}명`
        );
    }


    if (event.host_name) {

        descriptionParts.push(
            `벙주: ${event.host_name}`
        );
    }


    if (event.description) {

        descriptionParts.push(
            event.description
        );
    }


    const description =
        descriptionParts.join(
            '\n'
        );


    const lines = [

        'BEGIN:VCALENDAR',

        'VERSION:2.0',

        'PRODID:-//Workshop Calendar//KR//',

        'CALSCALE:GREGORIAN',

        'METHOD:PUBLISH',

        'BEGIN:VEVENT',

        `UID:${event.id}@workshop-calendar`,

        `SUMMARY:${escapeICS(
            event.title || '일정'
        )}`,

        `DESCRIPTION:${escapeICS(
            description
        )}`
    ];


    /*
       시간이 있는 일정:
       시작 시간부터 1시간 일정으로 저장
    */

    if (event.event_time) {

        const startDateTime =
            formatICSDateTime(
                event.start_date,
                event.event_time
            );


        const startDate =
            new Date(
                `${event.start_date}T${event.event_time}:00`
            );


        const endDate =
            new Date(
                startDate.getTime()
                +
                60 * 60 * 1000
            );


        const endDateString =
            formatDate(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate()
            );


        const endTimeString =
            `${String(
                endDate.getHours()
            ).padStart(2, '0')}:${String(
                endDate.getMinutes()
            ).padStart(2, '0')}`;


        lines.push(
            `DTSTART:${startDateTime}`
        );

        lines.push(
            `DTEND:${formatICSDateTime(
                endDateString,
                endTimeString
            )}`
        );
    }


    /*
       시간이 없는 일정:
       하루 종일 일정으로 저장
    */

    else {

        lines.push(
            `DTSTART;VALUE=DATE:${formatICSDateOnly(
                event.start_date
            )}`
        );

        lines.push(
            `DTEND;VALUE=DATE:${formatICSDateOnly(
                getNextDateString(
                    event.start_date
                )
            )}`
        );
    }


    lines.push(
        'END:VEVENT',
        'END:VCALENDAR'
    );


    const icsContent =
        lines.join('\r\n');


    const blob =
        new Blob(
            [icsContent],
            {
                type:
                    'text/calendar;charset=utf-8'
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            'a'
        );


    const safeFileName =
        String(
            event.title ||
            '일정'
        )
            .replace(
                /[\\/:*?"<>|]/g,
                '_'
            );


    link.href =
        url;

    link.download =
        `${safeFileName}.ics`;


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );
}


/* 캘린더에 저장 버튼 */

addToCalendarButton.addEventListener(
    'click',
    () => {

        if (!selectedDetailEvent) {

            alert(
                '일정 정보를 찾을 수 없습니다.'
            );

            return;
        }


        downloadICS(
            selectedDetailEvent
        );
    }
);



/* ==================================================
   16. 시작
================================================== */

async function init() {

    await checkLogin();

    await loadEvents();
}


init();
