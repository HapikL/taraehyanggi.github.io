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
   02. DOM - 월별 관리
================================================== */

const historyMonth =
    document.getElementById(
        'historyMonth'
    );

const prevMonthButton =
    document.getElementById(
        'prevMonthButton'
    );

const nextMonthButton =
    document.getElementById(
        'nextMonthButton'
    );

const currentMonthButton =
    document.getElementById(
        'currentMonthButton'
    );

const refreshButton =
    document.getElementById(
        'refreshButton'
    );

const monthlySettlementList =
    document.getElementById(
        'monthlySettlementList'
    );

const monthlyCountBadge =
    document.getElementById(
        'monthlyCountBadge'
    );

const statusTabs =
    document.querySelectorAll(
        '.status-tab'
    );



/* ==================================================
   03. DOM - 월별 요약
================================================== */

const monthEventTotal =
    document.getElementById(
        'monthEventTotal'
    );

const monthReceivedTotal =
    document.getElementById(
        'monthReceivedTotal'
    );

const monthUnpaidTotal =
    document.getElementById(
        'monthUnpaidTotal'
    );

const monthParkingTotal =
    document.getElementById(
        'monthParkingTotal'
    );



/* ==================================================
   04. DOM - 날짜별 상세
================================================== */

const settlementDate =
    document.getElementById(
        'settlementDate'
    );

const prevDayButton =
    document.getElementById(
        'prevDayButton'
    );

const nextDayButton =
    document.getElementById(
        'nextDayButton'
    );

const todayButton =
    document.getElementById(
        'todayButton'
    );

const dailyDetailTitle =
    document.getElementById(
        'dailyDetailTitle'
    );

const dailyDetailSection =
    document.getElementById(
        'dailyDetailSection'
    );

const eventSettlementList =
    document.getElementById(
        'eventSettlementList'
    );

const eventCount =
    document.getElementById(
        'eventCount'
    );

const parkingList =
    document.getElementById(
        'parkingList'
    );

const eventTotal =
    document.getElementById(
        'eventTotal'
    );

const parkingTotal =
    document.getElementById(
        'parkingTotal'
    );

const receivedTotal =
    document.getElementById(
        'receivedTotal'
    );

const unpaidTotal =
    document.getElementById(
        'unpaidTotal'
    );

const dayTotal =
    document.getElementById(
        'dayTotal'
    );



/* ==================================================
   05. DOM - 주차
================================================== */

const addParkingButton =
    document.getElementById(
        'addParkingButton'
    );

const addParkingTopButton =
    document.getElementById(
        'addParkingTopButton'
    );

const parkingModal =
    document.getElementById(
        'parkingModal'
    );

const parkingModalTitle =
    document.getElementById(
        'parkingModalTitle'
    );

const parkingName =
    document.getElementById(
        'parkingName'
    );

const parkingCarNumber =
    document.getElementById(
        'parkingCarNumber'
    );

const parkingHours =
    document.getElementById(
        'parkingHours'
    );

const parkingPreview =
    document.getElementById(
        'parkingPreview'
    );

const saveParkingButton =
    document.getElementById(
        'saveParkingButton'
    );

const cancelParkingButton =
    document.getElementById(
        'cancelParkingButton'
    );



/* ==================================================
   06. DOM - 계정
================================================== */

const logoutButton =
    document.getElementById(
        'logoutButton'
    );

const headerLogoutButton =
    document.getElementById(
        'headerLogoutButton'
    );



/* ==================================================
   07. 상태
================================================== */

let monthlyEvents = [];

let monthlyPayments = [];

let monthlyParkingRecords = [];

let dailyEvents = [];

let dailyPayments = [];

let dailyParkingRecords = [];

let currentFilter =
    'all';

let editingParkingId =
    null;


/* ==================================================
   08. 날짜 / 금액 공통 함수
================================================== */

function formatDate(
    year,
    month,
    day
) {

    return (
        `${year}-` +
        `${String(month + 1)
            .padStart(2, '0')}-` +
        `${String(day)
            .padStart(2, '0')}`
    );
}


function parseDate(
    dateString
) {

    const [
        year,
        month,
        day
    ] =
        dateString
            .split('-')
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );
}


function formatMoney(
    amount
) {

    return (
        Number(amount || 0)
            .toLocaleString('ko-KR')
        +
        '원'
    );
}


function formatMonthValue(
    date
) {

    return (
        `${date.getFullYear()}-` +
        `${String(
            date.getMonth() + 1
        ).padStart(2, '0')}`
    );
}



/* ==================================================
   09. 한글 날짜 표시
================================================== */

function formatKoreanDate(
    dateString
) {

    const date =
        parseDate(
            dateString
        );


    const weekdays = [
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
        `${weekdays[date.getDay()]}`
    );
}



/* ==================================================
   10. HTML 안전 처리
================================================== */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

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
   11. 카테고리 스타일
================================================== */

function getCategoryClass(
    category
) {

    if (category === '머미') {
        return 'category-meomi';
    }

    if (category === '보겜') {
        return 'category-bogem';
    }

    if (category === '협추') {
        return 'category-hyeobchu';
    }

    return 'category-etc';
}



/* ==================================================
   12. 관리자 접근 확인
================================================== */

async function checkAdmin() {

    const {
        data: { user }
    } =
        await supabaseClient.auth
            .getUser();


    if (!user) {

        alert(
            '관리자 로그인이 필요합니다.'
        );

        location.href =
            'index.html';

        return false;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from('profiles')
            .select('role')
            .eq(
                'id',
                user.id
            )
            .single();


    if (
        error ||
        data?.role !== 'admin'
    ) {

        alert(
            '관리자만 접근할 수 있습니다.'
        );

        location.href =
            'index.html';

        return false;
    }


    return true;
}



/* ==================================================
   13. 로그아웃
================================================== */

async function logout() {

    await supabaseClient.auth
        .signOut();

    location.href =
        'index.html';
}


logoutButton.addEventListener(
    'click',
    logout
);


headerLogoutButton.addEventListener(
    'click',
    logout
);



/* ==================================================
   14. 이용료 계산
================================================== */

/*
   평일:
   1명당 10,000원

   토 / 일:
   1명당 12,000원
*/

function getEventPrice(
    event,
    payment = null
) {

    const date =
        parseDate(
            event.start_date
        );


    const weekday =
        date.getDay();


    const weekend =
        weekday === 0 ||
        weekday === 6;


    const pricePerPerson =
        weekend
            ? 12000
            : 10000;


    const people =
        Number(
            event.people_count
        ) || 0;


    const excludedPeople =
        Math.max(
            0,
            Number(
                payment?.excluded_people
            ) || 0
        );


    const chargedPeople =
        Math.max(
            0,
            people -
            excludedPeople
        );


    return {

        people,

        excludedPeople,

        chargedPeople,

        pricePerPerson,

        total:
            chargedPeople *
            pricePerPerson
    };
} {

    const date =
        parseDate(
            event.start_date
        );


    const weekday =
        date.getDay();


    const weekend =
        weekday === 0 ||
        weekday === 6;


    const pricePerPerson =
        weekend
            ? 12000
            : 10000;


    const people =
        Number(
            event.people_count
        ) || 0;


    return {

        people,

        pricePerPerson,

        total:
            people *
            pricePerPerson
    };
}



/* ==================================================
   15. 월 시작 / 마지막 날짜
================================================== */

function getMonthRange(
    monthValue
) {

    const [
        year,
        month
    ] =
        monthValue
            .split('-')
            .map(Number);


    const lastDay =
        new Date(
            year,
            month,
            0
        ).getDate();


    return {

        start:
            `${year}-${String(month)
                .padStart(2, '0')}-01`,

        end:
            `${year}-${String(month)
                .padStart(2, '0')}-${String(lastDay)
                .padStart(2, '0')}`
    };
}



/* ==================================================
   16. 월별 데이터 불러오기
================================================== */

async function loadMonthlySettlement() {

    const monthValue =
        historyMonth.value;


    if (!monthValue) {
        return;
    }


    const range =
        getMonthRange(
            monthValue
        );


    const [
        eventResult,
        paymentResult,
        parkingResult
    ] =
        await Promise.all([

            supabaseClient
                .from('events')
                .select('*')
                .gte(
                    'start_date',
                    range.start
                )
                .lte(
                    'start_date',
                    range.end
                )
           .neq(
              'category',
              '기타'
              )
                .order(
                    'start_date',
                    {
                        ascending: true
                    }
                )
                .order(
                    'event_time',
                    {
                        ascending: true
                    }
                ),

            supabaseClient
                .from(
                    'event_payments'
                )
                .select('*'),

            supabaseClient
                .from(
                    'parking_records'
                )
                .select('*')
                .gte(
                    'parking_date',
                    range.start
                )
                .lte(
                    'parking_date',
                    range.end
                )
        ]);


    if (eventResult.error) {

        console.error(
            '월별 일정 조회 실패:',
            eventResult.error
        );

        return;
    }


    if (paymentResult.error) {

        console.error(
            '월별 수납 조회 실패:',
            paymentResult.error
        );
    }


    if (parkingResult.error) {

        console.error(
            '월별 주차 조회 실패:',
            parkingResult.error
        );
    }


    monthlyEvents =
        eventResult.data || [];

    monthlyPayments =
        paymentResult.data || [];

    monthlyParkingRecords =
        parkingResult.data || [];


    renderMonthlySettlement();

    renderMonthSummary();
}



/* ==================================================
   17. 월별 필터 적용
================================================== */

function getFilteredMonthlyEvents() {

    if (
        currentFilter ===
        'all'
    ) {

        return monthlyEvents;
    }


    return monthlyEvents.filter(
        event => {

            const payment =
                monthlyPayments.find(
                    item =>
                        item.event_id ===
                        event.id
                );


            const received =
                payment?.received ===
                true;


            if (
                currentFilter ===
                'received'
            ) {

                return received;
            }


            if (
                currentFilter ===
                'unpaid'
            ) {

                return !received;
            }


            return true;
        }
    );
}



/* ==================================================
   18. 월별 리스트 표시
================================================== */

function renderMonthlySettlement() {

    const filteredEvents =
        getFilteredMonthlyEvents();


    monthlyCountBadge.textContent =
        `${filteredEvents.length}건`;


    if (
        filteredEvents.length === 0
    ) {

        monthlySettlementList.innerHTML = `
            <div class="empty-message">
                조건에 맞는 정산 기록이 없습니다.
            </div>
        `;

        return;
    }


    monthlySettlementList.innerHTML =
        '';


    filteredEvents.forEach(
        event => {

            const payment =
                monthlyPayments.find(
                    item =>
                        item.event_id ===
                        event.id
                );


            const received =
                payment?.received ===
                true;


    const price =
    getEventPrice(
        event,
        payment
    );


            const row =
                document.createElement(
                    'div'
                );


            row.className =
                'table-row table-item';


            if (
                settlementDate.value ===
                event.start_date
            ) {

                row.classList.add(
                    'selected-row'
                );
            }


            row.innerHTML = `

                <div class="table-date">

                    ${escapeHTML(
                        formatKoreanDate(
                            event.start_date
                        )
                    )}

                </div>


                <div>

                    ${escapeHTML(
                        event.event_time ||
                        '--:--'
                    )}

                </div>


                <div>

                    <span class="
                        category-badge
                        ${getCategoryClass(
                            event.category
                        )}
                    ">

                        ${escapeHTML(
                            event.category ||
                            '기타'
                        )}

                    </span>

                </div>


                <div
                    class="table-title"
                    title="${escapeHTML(
                        event.title || ''
                    )}"
                >

                    ${escapeHTML(
                        event.title || ''
                    )}

                </div>


                <div>

                    ${price.people}명

                </div>


                <div class="table-money">

                    ${formatMoney(
                        price.total
                    )}

                </div>


                <div>

                    <button
                        class="
                            payment-status-button
                            ${
                                received
                                    ? 'received'
                                    : 'unpaid'
                            }
                        "
                        data-event-id="${event.id}"
                        data-received="${received}"
                        type="button"
                    >

                        ${
                            received
                                ? '✓ 받음'
                                : '아직 못받음'
                        }

                    </button>

                </div>


                <div>

                    <button
                        class="row-open-button"
                        type="button"
                        title="상세 정산 보기"
                    >
                        ›
                    </button>

                </div>
            `;


            /*
               행 클릭 시 해당 날짜
               상세 정산으로 이동
            */

            row.addEventListener(
                'click',
                () => {

                    openDailySettlement(
                        event.start_date,
                        true
                    );
                }
            );


            /*
               받음 / 미수 버튼 클릭
            */

            const paymentButton =
                row.querySelector(
                    '.payment-status-button'
                );


            paymentButton.addEventListener(
                'click',
                async clickEvent => {

                    clickEvent
                        .stopPropagation();


                    const currentReceived =
                        paymentButton.dataset
                            .received ===
                            'true';


                    await setPaymentStatus(
                        event.id,
                        !currentReceived
                    );
                }
            );


            monthlySettlementList
                .appendChild(
                    row
                );
        }
    );
}



/* ==================================================
   19. 월별 합계
================================================== */

function renderMonthSummary() {

    let eventAmount =
        0;

    let receivedAmount =
        0;


    monthlyEvents.forEach(
        event => {

  const payment =
    monthlyPayments.find(
        item =>
            item.event_id ===
            event.id
    );


const amount =
    getEventPrice(
        event,
        payment
    ).total;


            eventAmount +=
                amount;


            if (
                payment?.received ===
                true
            ) {

                receivedAmount +=
                    amount;
            }
        }
    );


    const parkingAmount =
        monthlyParkingRecords.reduce(
            (
                total,
                record
            ) => {

                return (
                    total
                    +
                    Number(
                        record.parking_hours
                    )
                    *
                    100
                );
            },
            0
        );


    monthEventTotal.textContent =
        formatMoney(
            eventAmount
        );

    monthReceivedTotal.textContent =
        formatMoney(
            receivedAmount
        );

    monthUnpaidTotal.textContent =
        formatMoney(
            eventAmount -
            receivedAmount
        );

    monthParkingTotal.textContent =
        formatMoney(
            parkingAmount
        );
}



/* ==================================================
   20. 월별 필터 버튼
================================================== */

statusTabs.forEach(
    button => {

        button.addEventListener(
            'click',
            () => {

                currentFilter =
                    button.dataset
                        .filter;


                statusTabs.forEach(
                    tab => {

                        tab.classList.remove(
                            'active'
                        );
                    }
                );


                button.classList.add(
                    'active'
                );


                renderMonthlySettlement();
            }
        );
    }
);



/* ==================================================
   21. 월 이동
================================================== */

function moveMonth(
    amount
) {

    const [
        year,
        month
    ] =
        historyMonth.value
            .split('-')
            .map(Number);


    const newDate =
        new Date(
            year,
            month - 1 + amount,
            1
        );


    historyMonth.value =
        formatMonthValue(
            newDate
        );


    loadMonthlySettlement();
}


prevMonthButton.addEventListener(
    'click',
    () => {

        moveMonth(-1);
    }
);


nextMonthButton.addEventListener(
    'click',
    () => {

        moveMonth(1);
    }
);


currentMonthButton.addEventListener(
    'click',
    () => {

        historyMonth.value =
            formatMonthValue(
                new Date()
            );


        loadMonthlySettlement();
    }
);


historyMonth.addEventListener(
    'change',
    loadMonthlySettlement
);



/* ==================================================
   22. 날짜별 상세 데이터 불러오기
================================================== */

async function loadDailySettlement() {

    const selectedDate =
        settlementDate.value;


    if (!selectedDate) {
        return;
    }


    const [
        eventResult,
        paymentResult,
        parkingResult
    ] =
        await Promise.all([

            supabaseClient
                .from('events')
                .select('*')
                .eq(
                    'start_date',
                    selectedDate
                )
               .neq(
        'category',
        '기타'
    )
                .order(
                    'event_time',
                    {
                        ascending: true
                    }
                ),

            supabaseClient
                .from(
                    'event_payments'
                )
                .select('*'),

            supabaseClient
                .from(
                    'parking_records'
                )
                .select('*')
                .eq(
                    'parking_date',
                    selectedDate
                )
                .order(
                    'created_at',
                    {
                        ascending: true
                    }
                )
        ]);


    if (eventResult.error) {

        console.error(
            '일별 일정 조회 실패:',
            eventResult.error
        );

        return;
    }


    dailyEvents =
        eventResult.data || [];

    dailyPayments =
        paymentResult.data || [];

    dailyParkingRecords =
        parkingResult.data || [];


    renderDailySettlement();

    renderMonthlySettlement();
}



/* ==================================================
   23. 하루 상세 열기
================================================== */

async function openDailySettlement(
    dateString,
    scrollToDetail = false
) {

    settlementDate.value =
        dateString;


    await loadDailySettlement();


    if (scrollToDetail) {

        dailyDetailSection
            .scrollIntoView({
                behavior:
                    'smooth',

                block:
                    'start'
            });
    }
}



/* ==================================================
   24. 하루 일정 표시
================================================== */

function renderDailyEvents() {

    eventCount.textContent =
        `${dailyEvents.length}건`;


    if (
        dailyEvents.length === 0
    ) {

        eventSettlementList.innerHTML = `
            <div class="empty-message">
                이 날짜에는 일정이 없습니다.
            </div>
        `;

        return;
    }


    eventSettlementList.innerHTML =
        '';


    dailyEvents.forEach(
        event => {

const payment =
    dailyPayments.find(
        item =>
            item.event_id ===
            event.id
    );


const price =
    getEventPrice(
        event,
        payment
    );


            const received =
                payment?.received ===
                true;


            const row =
                document.createElement(
                    'div'
                );


            row.className =
                'daily-event-row';


            row.innerHTML = `

                <div>

                    <div class="daily-event-title">

                        ${escapeHTML(
                            event.category ||
                            '기타'
                        )}
                        ·
                        ${escapeHTML(
                            event.title ||
                            ''
                        )}

                    </div>


                    <div class="daily-event-meta">

                        ${escapeHTML(
                            event.event_time ||
                            '--:--'
                        )}

                        ·

                        벙주
                        ${escapeHTML(
                            event.host_name ||
                            '-'
                        )}

                    </div>

                </div>


               <div>

    총 ${price.people}명

    <div class="daily-event-meta">
        실제 정산 ${price.chargedPeople}명
    </div>

</div>


<div class="exclude-people-control">

    <span class="exclude-label">
        제외
    </span>

    <button
        class="exclude-minus"
        type="button"
    >
        −
    </button>

    <span class="exclude-count">
        ${price.excludedPeople}
    </span>

    <button
        class="exclude-plus"
        type="button"
    >
        +
    </button>

</div>


<div class="daily-event-amount">

    ${formatMoney(
        price.total
    )}

</div>


                <button
                    class="
                        payment-status-button
                        ${
                            received
                                ? 'received'
                                : 'unpaid'
                        }
                    "
                    type="button"
                >

                    ${
                        received
                            ? '✓ 받음'
                            : '아직 못받음'
                    }

                </button>
            `;

const minusButton =
    row.querySelector(
        '.exclude-minus'
    );

const plusButton =
    row.querySelector(
        '.exclude-plus'
    );


minusButton.addEventListener(
    'click',
    async () => {

        const current =
            price.excludedPeople;


        await setExcludedPeople(
            event.id,
            Math.max(
                0,
                current - 1
            )
        );
    }
);


plusButton.addEventListener(
    'click',
    async () => {

        const current =
            price.excludedPeople;


        /*
           전체 인원보다 많이 제외되지 않도록 제한
        */

        const next =
            Math.min(
                price.people,
                current + 1
            );


        await setExcludedPeople(
            event.id,
            next
        );
    }
);
            const button =
                row.querySelector(
                    '.payment-status-button'
                );


            button.addEventListener(
                'click',
                async () => {

                    await setPaymentStatus(
                        event.id,
                        !received
                    );
                }
            );


            eventSettlementList
                .appendChild(
                    row
                );
        }
    );
}



/* ==================================================
   25. 주차 표시
================================================== */

function renderDailyParking() {

    if (
        dailyParkingRecords.length === 0
    ) {

        parkingList.innerHTML = `
            <div class="empty-message">
                주차 기록이 없습니다.
            </div>
        `;

        return;
    }


    parkingList.innerHTML =
        '';


    dailyParkingRecords.forEach(
        record => {

            const amount =
                Number(
                    record.parking_hours
                )
                *
                100;


            const row =
                document.createElement(
                    'div'
                );


            row.className =
                'parking-row';


            row.innerHTML = `

                <div>

                    <div class="parking-name">

                        ${escapeHTML(
                            record.person_name
                        )}

                    </div>


                    <div class="parking-sub">

                        ${
                            record.car_number
                                ? escapeHTML(
                                    record.car_number
                                )
                                : '차번호 없음'
                        }

                    </div>

                </div>


                <div>

                    ${record.parking_hours}시간

                </div>


                <div class="parking-money">

                    ${formatMoney(
                        amount
                    )}

                </div>

<button
    class="edit-parking-button"
    type="button"
>
    수정
</button>
                <button
                    class="delete-parking-button"
                    type="button"
                >
                    삭제
                </button>
            `;

const editButton =
    row.querySelector(
        '.edit-parking-button'
    );


editButton.addEventListener(
    'click',
    () => {

        openParkingModal(
            record
        );
    }
);
            const deleteButton =
                row.querySelector(
                    '.delete-parking-button'
                );


            deleteButton.addEventListener(
                'click',
                async () => {

                    const confirmed =
                        confirm(
                            '이 주차 기록을 삭제할까요?'
                        );


                    if (!confirmed) {
                        return;
                    }


                    const {
                        error
                    } =
                        await supabaseClient
                            .from(
                                'parking_records'
                            )
                            .delete()
                            .eq(
                                'id',
                                record.id
                            );


                    if (error) {

                        console.error(
                            '주차 삭제 실패:',
                            error
                        );

                        alert(
                            '주차 기록 삭제에 실패했습니다.'
                        );

                        return;
                    }


                    await loadDailySettlement();

                    await loadMonthlySettlement();
                }
            );


            parkingList.appendChild(
                row
            );
        }
    );
}



/* ==================================================
   26. 하루 합계
================================================== */

function renderDailyTotals() {

    let eventAmount =
        0;

    let receivedAmount =
        0;


    dailyEvents.forEach(
        event => {

const payment =
    dailyPayments.find(
        item =>
            item.event_id ===
            event.id
    );


const amount =
    getEventPrice(
        event,
        payment
    ).total;


            eventAmount +=
                amount;

                );


            if (
                payment?.received ===
                true
            ) {

                receivedAmount +=
                    amount;
            }
        }
    );


    const parkingAmount =
        dailyParkingRecords.reduce(
            (
                total,
                record
            ) => {

                return (
                    total
                    +
                    Number(
                        record.parking_hours
                    )
                    *
                    100
                );
            },
            0
        );


    const unpaidAmount =
        eventAmount -
        receivedAmount;


    eventTotal.textContent =
        formatMoney(
            eventAmount
        );

    parkingTotal.textContent =
        formatMoney(
            parkingAmount
        );

    receivedTotal.textContent =
        formatMoney(
            receivedAmount
        );

    unpaidTotal.textContent =
        formatMoney(
            unpaidAmount
        );

    dayTotal.textContent =
        formatMoney(
            eventAmount +
            parkingAmount
        );
}



/* ==================================================
   27. 하루 상세 전체 렌더링
================================================== */

function renderDailySettlement() {

    const selectedDate =
        settlementDate.value;


    dailyDetailTitle.textContent =
        formatKoreanDate(
            selectedDate
        );


    renderDailyEvents();

    renderDailyParking();

    renderDailyTotals();
}

/* ==================================================
   27-1. 이용료 제외 인원 저장
================================================== */

async function setExcludedPeople(
    eventId,
    excludedPeople
) {

    const existingPayment =
        dailyPayments.find(
            item =>
                item.event_id ===
                eventId
        );


    const received =
        existingPayment?.received ===
        true;


    const {
        error
    } =
        await supabaseClient
            .from(
                'event_payments'
            )
            .upsert({

                event_id:
                    eventId,

                received:
                    received,

                excluded_people:
                    excludedPeople,

                updated_at:
                    new Date()
                        .toISOString()
            });


    if (error) {

        console.error(
            '제외 인원 저장 실패:',
            error
        );

        alert(
            '제외 인원 저장에 실패했습니다.'
        );

        return;
    }


    await loadMonthlySettlement();

    await loadDailySettlement();
}

/* ==================================================
   28. 수납 상태 저장
================================================== */

async function setPaymentStatus(
    eventId,
    received
) {

    const {
        error
    } =
        await supabaseClient
            .from(
                'event_payments'
            )
           .upsert({

    event_id:
        eventId,

    received,

    excluded_people:
        (
            dailyPayments.find(
                item =>
                    item.event_id ===
                    eventId
            )?.excluded_people
            ??
            monthlyPayments.find(
                item =>
                    item.event_id ===
                    eventId
            )?.excluded_people
            ??
            0
        ),

    updated_at:
        new Date()
            .toISOString()
});


    if (error) {

        console.error(
            '수납 상태 저장 실패:',
            error
        );

        alert(
            '수납 상태 저장에 실패했습니다.'
        );

        return;
    }


    await loadMonthlySettlement();

    await loadDailySettlement();
}



/* ==================================================
   29. 하루 날짜 이동
================================================== */

function moveDay(
    amount
) {

    const date =
        parseDate(
            settlementDate.value
        );


    date.setDate(
        date.getDate() +
        amount
    );


    settlementDate.value =
        formatDate(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    loadDailySettlement();
}


prevDayButton.addEventListener(
    'click',
    () => {

        moveDay(-1);
    }
);


nextDayButton.addEventListener(
    'click',
    () => {

        moveDay(1);
    }
);


todayButton.addEventListener(
    'click',
    () => {

        const today =
            new Date();


        settlementDate.value =
            formatDate(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );


        loadDailySettlement();
    }
);


settlementDate.addEventListener(
    'change',
    loadDailySettlement
);



/* ==================================================
   30. 주차 팝업 열기
================================================== */

function openParkingModal(
    record = null
) {

    if (record) {

        editingParkingId =
            record.id;

        parkingModalTitle.textContent =
            '주차 정산 수정';

        parkingName.value =
            record.person_name || '';

        parkingCarNumber.value =
            record.car_number || '';

        parkingHours.value =
            record.parking_hours || '';

        parkingPreview.textContent =
            formatMoney(
                Number(
                    record.parking_hours
                ) * 100
            );

    } else {

        editingParkingId =
            null;

        parkingModalTitle.textContent =
            '주차 정산 추가';

        parkingName.value =
            '';

        parkingCarNumber.value =
            '';

        parkingHours.value =
            '';

        parkingPreview.textContent =
            '0원';
    }


    parkingModal.classList.remove(
        'hidden'
    );


    setTimeout(
        () => {

            parkingName.focus();
        },
        50
    );
}


addParkingButton.addEventListener(
    'click',
    () => openParkingModal()
);


addParkingTopButton.addEventListener(
    'click',
    () => openParkingModal()
);



/* ==================================================
   31. 주차비 미리보기
================================================== */

parkingHours.addEventListener(
    'input',
    () => {

        const hours =
            Number(
                parkingHours.value
            ) || 0;


        parkingPreview.textContent =
            formatMoney(
                hours * 100
            );
    }
);



/* ==================================================
   32. 주차 저장
================================================== */

saveParkingButton.addEventListener(
    'click',
    async () => {

        const name =
            parkingName
                .value
                .trim();


        const carNumber =
            parkingCarNumber
                .value
                .trim();


        const hours =
            Number(
                parkingHours.value
            );


        if (!name) {

            alert(
                '이름을 입력하세요.'
            );

            return;
        }


        if (
            !hours ||
            hours <= 0
        ) {

            alert(
                '주차시간을 입력하세요.'
            );

            return;
        }


let error;


/* 기존 주차 수정 */

if (editingParkingId) {

    const result =
        await supabaseClient
            .from(
                'parking_records'
            )
            .update({

                parking_date:
                    settlementDate.value,

                person_name:
                    name,

                car_number:
                    carNumber,

                parking_hours:
                    hours
            })
            .eq(
                'id',
                editingParkingId
            );


    error =
        result.error;

}


/* 새 주차 추가 */

else {

    const result =
        await supabaseClient
            .from(
                'parking_records'
            )
            .insert({

                parking_date:
                    settlementDate.value,

                person_name:
                    name,

                car_number:
                    carNumber,

                parking_hours:
                    hours
            });


    error =
        result.error;
}


        if (error) {

            console.error(
                '주차 저장 실패:',
                error
            );

            alert(
                '주차 기록 저장에 실패했습니다.'
            );

            return;
        }


        parkingModal.classList.add(
            'hidden'
        );
       
editingParkingId =
    null;

        await loadDailySettlement();

        await loadMonthlySettlement();
    }
);



/* ==================================================
   33. 주차 팝업 취소
================================================== */

cancelParkingButton.addEventListener(
    'click',
    () => {

        parkingModal.classList.add(
            'hidden'
           editingParkingId =
    null;
        );
    }
);



/* ==================================================
   34. 새로고침
================================================== */

refreshButton.addEventListener(
    'click',
    async () => {

        await loadMonthlySettlement();

        await loadDailySettlement();
    }
);



/* ==================================================
   35. 시작
================================================== */

async function init() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    const today =
        new Date();


    /* 월별 목록 */

    historyMonth.value =
        formatMonthValue(
            today
        );


    /* 하루 상세 */

    settlementDate.value =
        formatDate(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    await loadMonthlySettlement();

    await loadDailySettlement();
}


init();
