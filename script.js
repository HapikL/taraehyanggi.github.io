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


let currentDate = new Date();

let events = [];


/* -----------------------------
   Supabase 일정 불러오기
------------------------------ */

async function loadEvents() {

    const { data, error } = await supabaseClient
        .from('events')
        .select('*');

    if (error) {
        console.error('일정 불러오기 실패:', error);
        return;
    }

    events = data;

    renderCalendar();
}


/* -----------------------------
   날짜 YYYY-MM-DD 형태 변환
------------------------------ */

function formatDate(year, month, day) {

    const monthString = String(month + 1).padStart(2, '0');
    const dayString = String(day).padStart(2, '0');

    return `${year}-${monthString}-${dayString}`;
}


/* -----------------------------
   달력 그리기
------------------------------ */

function renderCalendar() {

    calendarGrid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();


    calendarTitle.textContent =
        `${year}년 ${month + 1}월`;


    const firstDay =
        new Date(year, month, 1).getDay();

    const lastDate =
        new Date(year, month + 1, 0).getDate();

    const previousMonthLastDate =
        new Date(year, month, 0).getDate();


    const today = new Date();

    const totalCells = 42;


    for (let i = 0; i < totalCells; i++) {

        const dayElement =
            document.createElement('div');

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

            displayDay =
                i - firstDay + 1;

        }


        /* 다음 달 */

        else {

            displayDay =
                i - firstDay - lastDate + 1;

            cellMonth = month + 1;

            if (cellMonth > 11) {
                cellMonth = 0;
                cellYear++;
            }

            dayElement.classList.add('other-month');
        }


        const dateString =
            formatDate(
                cellYear,
                cellMonth,
                displayDay
            );


        dayElement.dataset.date = dateString;


        /* 오늘 표시 */

        if (
            cellYear === today.getFullYear() &&
            cellMonth === today.getMonth() &&
            displayDay === today.getDate()
        ) {
            dayElement.classList.add('today');
        }


        /* 날짜 숫자 */

        const numberElement =
            document.createElement('div');

        numberElement.classList.add('day-number');

        numberElement.textContent =
            displayDay;

        dayElement.appendChild(numberElement);


        /* 해당 날짜 일정 */

        const dayEvents =
            events.filter(event =>
                event.start_date === dateString
            );


        dayEvents.forEach(event => {

            const eventElement =
                document.createElement('div');

            eventElement.classList.add('event');

            eventElement.textContent =
                event.title;

            eventElement.title =
                event.description || event.title;

            dayElement.appendChild(eventElement);
        });


        calendarGrid.appendChild(dayElement);
    }
}


/* -----------------------------
   이전 달
------------------------------ */

prevMonthButton.addEventListener(
    'click',
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
    }
);


/* -----------------------------
   다음 달
------------------------------ */

nextMonthButton.addEventListener(
    'click',
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
    }
);


/* -----------------------------
   오늘
------------------------------ */

todayButton.addEventListener(
    'click',
    () => {

        currentDate = new Date();

        renderCalendar();
    }
);


/* -----------------------------
   시작
------------------------------ */

loadEvents();
