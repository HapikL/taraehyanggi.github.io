/* ==================================================
   01. Supabase
================================================== */

const SUPABASE_URL =
    '네 기존 SUPABASE_URL';

const SUPABASE_KEY =
    '네 기존 Publishable Key';

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/* ==================================================
   02. DOM
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

const eventSettlementList =
    document.getElementById(
        'eventSettlementList'
    );

const parkingList =
    document.getElementById(
        'parkingList'
    );

const eventCount =
    document.getElementById(
        'eventCount'
    );

const eventTotal =
    document.getElementById(
        'eventTotal'
    );

const parkingTotal =
    document.getElementById(
        'parkingTotal'
    );

const dayTotal =
    document.getElementById(
        'dayTotal'
    );

const receivedTotal =
    document.getElementById(
        'receivedTotal'
    );

const unpaidTotal =
    document.getElementById(
        'unpaidTotal'
    );


/* 주차 */

const addParkingButton =
    document.getElementById(
        'addParkingButton'
    );

const parkingModal =
    document.getElementById(
        'parkingModal'
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
   03. 상태
================================================== */

let events = [];

let payments = [];

let parkingRecords = [];



/* ==================================================
   04. 공통 함수
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
        Number(amount)
            .toLocaleString(
                'ko-KR'
            )
        +
        '원'
    );
}



/* ==================================================
   05. 관리자 확인
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
   06. 이용료 계산
================================================== */

function getEventPrice(
    event
) {

    const date =
        parseDate(
            event.start_date
        );

    const day =
        date.getDay();


    const isWeekend =
        day === 0 ||
        day === 6;


    const pricePerPerson =
        isWeekend
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
   07. 데이터 불러오기
================================================== */

async function loadSettlement() {

    const date =
        settlementDate.value;


    if (!date) {
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
                    date
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
                    date
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
            eventResult.error
        );

        return;
    }


    if (paymentResult.error) {

        console.error(
            paymentResult.error
        );
    }


    if (parkingResult.error) {

        console.error(
            parkingResult.error
        );
    }


    events =
        eventResult.data || [];

    payments =
        paymentResult.data || [];

    parkingRecords =
        parkingResult.data || [];


    renderSettlement();
}



/* ==================================================
   08. 일정 정산 표시
================================================== */

function renderEvents() {

    eventCount.textContent =
        `${events.length}건`;


    if (
        events.length === 0
    ) {

        eventSettlementList
            .textContent =
                '이 날짜에는 일정이 없습니다.';

        return;
    }


    eventSettlementList
        .innerHTML = '';


    events.forEach(event => {

        const price =
            getEventPrice(
                event
            );


        const payment =
            payments.find(
                item =>
                    item.event_id ===
                    event.id
            );


        const received =
            payment?.received === true;


        const item =
            document.createElement(
                'div'
            );

        item.className =
            'payment-item';


        item.innerHTML = `
            <div>

                <div class="payment-title">
                    ${event.category || '기타'}
                    ·
                    ${event.title || ''}
                </div>

                <div class="payment-meta">

                    ${price.people}명
                    ×
                    ${formatMoney(
                        price.pricePerPerson
                    )}

                </div>

            </div>


            <div class="payment-amount">

                ${formatMoney(
                    price.total
                )}

            </div>


            <button
                class="
                    payment-status
                    ${
                        received
                            ? 'received'
                            : 'unpaid'
                    }
                "
                data-event-id="${event.id}"
                data-received="${received}"
            >

                ${
                    received
                        ? '✓ 받음'
                        : '아직 못받음'
                }

            </button>
        `;


        eventSettlementList
            .appendChild(
                item
            );
    });


    document
        .querySelectorAll(
            '.payment-status'
        )
        .forEach(button => {

            button
                .addEventListener(
                    'click',
                    async () => {

                        const eventId =
                            button.dataset
                                .eventId;

                        const current =
                            button.dataset
                                .received ===
                                'true';


                        await setPaymentStatus(
                            eventId,
                            !current
                        );
                    }
                );
        });
}



/* ==================================================
   09. 받음 / 미수 상태 저장
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

                received:
                    received,

                updated_at:
                    new Date()
                        .toISOString()
            });


    if (error) {

        console.error(
            error
        );

        alert(
            '수납 상태 저장에 실패했습니다.'
        );

        return;
    }


    await loadSettlement();
}



/* ==================================================
   10. 주차 표시
================================================== */

function renderParking() {

    if (
        parkingRecords.length === 0
    ) {

        parkingList.textContent =
            '주차 기록이 없습니다.';

        return;
    }


    parkingList.innerHTML = '';


    parkingRecords.forEach(record => {

        const amount =
            Number(
                record.parking_hours
            )
            *
            100;


        const item =
            document.createElement(
                'div'
            );

        item.className =
            'parking-item';


        item.innerHTML = `
            <div>

                <div class="parking-name">

                    ${record.person_name}

                    ${
                        record.car_number
                            ? `(${record.car_number})`
                            : ''
                    }

                </div>

                <div class="parking-info">

                    ${record.parking_hours}시간
                    ·
                    시간당 100원

                </div>

            </div>


            <div class="parking-amount">

                ${formatMoney(
                    amount
                )}

            </div>


            <button
                class="delete-parking"
                data-id="${record.id}"
            >
                삭제
            </button>
        `;


        parkingList
            .appendChild(
                item
            );
    });


    document
        .querySelectorAll(
            '.delete-parking'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                async () => {

                    const confirmed =
                        confirm(
                            '이 주차 기록을 삭제할까요?'
                        );


                    if (!confirmed) {
                        return;
                    }


                    await supabaseClient
                        .from(
                            'parking_records'
                        )
                        .delete()
                        .eq(
                            'id',
                            button.dataset.id
                        );


                    await loadSettlement();
                }
            );
        });
}



/* ==================================================
   11. 총액 계산
================================================== */

function renderTotals() {

    let eventAmount = 0;

    let receivedAmount = 0;


    events.forEach(event => {

        const price =
            getEventPrice(
                event
            ).total;


        eventAmount += price;


        const payment =
            payments.find(
                item =>
                    item.event_id ===
                    event.id
            );


        if (
            payment?.received ===
            true
        ) {

            receivedAmount +=
                price;
        }
    });


    const parkingAmount =
        parkingRecords.reduce(
            (sum, record) => {

                return (
                    sum
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

    dayTotal.textContent =
        formatMoney(
            eventAmount +
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
}



/* ==================================================
   12. 전체 표시
================================================== */

function renderSettlement() {

    renderEvents();

    renderParking();

    renderTotals();
}



/* ==================================================
   13. 날짜 이동
================================================== */

function moveDate(
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


    loadSettlement();
}


prevDayButton.addEventListener(
    'click',
    () => moveDate(-1)
);


nextDayButton.addEventListener(
    'click',
    () => moveDate(1)
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

        loadSettlement();
    }
);


settlementDate.addEventListener(
    'change',
    loadSettlement
);



/* ==================================================
   14. 주차 추가
================================================== */

addParkingButton.addEventListener(
    'click',
    () => {

        parkingName.value = '';

        parkingCarNumber.value = '';

        parkingHours.value = '';

        parkingPreview.textContent =
            '0원';

        parkingModal.classList.remove(
            'hidden'
        );
    }
);


/* 주차비 미리보기 */

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


/* 주차 저장 */

saveParkingButton.addEventListener(
    'click',
    async () => {

        const name =
            parkingName.value
                .trim();

        const carNumber =
            parkingCarNumber.value
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


        const {
            error
        } =
            await supabaseClient
                .from(
                    'parking_records'
                )
                .insert({

                    parking_date:
                        settlementDate
                            .value,

                    person_name:
                        name,

                    car_number:
                        carNumber,

                    parking_hours:
                        hours
                });


        if (error) {

            console.error(
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


        await loadSettlement();
    }
);


/* 주차 취소 */

cancelParkingButton.addEventListener(
    'click',
    () => {

        parkingModal.classList.add(
            'hidden'
        );
    }
);



/* ==================================================
   15. 시작
================================================== */

async function init() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    const today =
        new Date();


    settlementDate.value =
        formatDate(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    await loadSettlement();
}


init();
