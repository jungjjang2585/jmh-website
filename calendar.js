// === 상태 관리 ===
let currentDate = new Date();
let selectedDate = null;
let editingEventId = null;
let selectedColor = '#4285f4';

// localStorage에서 일정 불러오기
function loadEvents() {
    const data = localStorage.getItem('calendar-events');
    return data ? JSON.parse(data) : [];
}

function saveEvents(events) {
    localStorage.setItem('calendar-events', JSON.stringify(events));
}

// === 메인 캘린더 렌더링 ===
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 헤더 업데이트
    document.getElementById('current-month').textContent =
        `${year}년 ${month + 1}월`;

    // 그리드 생성
    const grid = document.getElementById('days-grid');
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    const today = new Date();
    const events = loadEvents();

    // 총 셀 수 계산 (6주 고정)
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';

        let date, cellMonth, cellYear;

        if (i < firstDay) {
            // 이전 달
            date = prevLastDate - firstDay + i + 1;
            cellMonth = month - 1;
            cellYear = cellMonth < 0 ? year - 1 : year;
            cellMonth = cellMonth < 0 ? 11 : cellMonth;
            cell.classList.add('other-month');
        } else if (i >= firstDay + lastDate) {
            // 다음 달
            date = i - firstDay - lastDate + 1;
            cellMonth = month + 1;
            cellYear = cellMonth > 11 ? year + 1 : year;
            cellMonth = cellMonth > 11 ? 0 : cellMonth;
            cell.classList.add('other-month');
        } else {
            // 이번 달
            date = i - firstDay + 1;
            cellMonth = month;
            cellYear = year;
        }

        // 요일 클래스
        const dayOfWeek = i % 7;
        if (dayOfWeek === 0) cell.classList.add('sunday');
        if (dayOfWeek === 6) cell.classList.add('saturday');

        // 오늘 표시
        if (cellYear === today.getFullYear() &&
            cellMonth === today.getMonth() &&
            date === today.getDate()) {
            cell.classList.add('today');
        }

        // 날짜 번호
        const dayNum = document.createElement('div');
        dayNum.className = 'day-number';
        dayNum.textContent = date;
        cell.appendChild(dayNum);

        // 해당 날짜의 일정 표시
        const dateStr = formatDate(cellYear, cellMonth, date);
        const dayEvents = events.filter(e => e.date === dateStr);
        dayEvents.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

        const maxShow = 3;
        dayEvents.slice(0, maxShow).forEach(event => {
            const bar = document.createElement('div');
            bar.className = 'event-bar';
            bar.style.background = event.color || '#4285f4';
            const timeStr = event.startTime ? event.startTime + ' ' : '';
            bar.textContent = timeStr + event.title;
            bar.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(event);
            });
            cell.appendChild(bar);
        });

        if (dayEvents.length > maxShow) {
            const more = document.createElement('div');
            more.className = 'more-events';
            more.textContent = `+${dayEvents.length - maxShow}개 더보기`;
            cell.appendChild(more);
        }

        // 셀 클릭 → 새 일정
        cell.addEventListener('click', () => {
            openNewModal(dateStr);
        });

        grid.appendChild(cell);
    }
}

// === 미니 캘린더 렌더링 ===
let miniDate = new Date();

function renderMiniCalendar() {
    const year = miniDate.getFullYear();
    const month = miniDate.getMonth();

    document.getElementById('mini-month-year').textContent =
        `${year}년 ${month + 1}월`;

    const container = document.getElementById('mini-days');
    container.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();
    const today = new Date();

    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
        const span = document.createElement('span');
        span.className = 'mini-day';

        let date, cellMonth, cellYear;

        if (i < firstDay) {
            date = prevLastDate - firstDay + i + 1;
            cellMonth = month - 1;
            cellYear = cellMonth < 0 ? year - 1 : year;
            cellMonth = cellMonth < 0 ? 11 : cellMonth;
            span.classList.add('other-month');
        } else if (i >= firstDay + lastDate) {
            date = i - firstDay - lastDate + 1;
            cellMonth = month + 1;
            cellYear = cellMonth > 11 ? year + 1 : year;
            cellMonth = cellMonth > 11 ? 0 : cellMonth;
            span.classList.add('other-month');
        } else {
            date = i - firstDay + 1;
            cellMonth = month;
            cellYear = year;
        }

        span.textContent = date;

        if (cellYear === today.getFullYear() &&
            cellMonth === today.getMonth() &&
            date === today.getDate()) {
            span.classList.add('today');
        }

        // 미니 캘린더 날짜 클릭 → 메인 캘린더 이동
        span.addEventListener('click', () => {
            currentDate = new Date(cellYear, cellMonth, 1);
            miniDate = new Date(cellYear, cellMonth, 1);
            renderCalendar();
            renderMiniCalendar();
        });

        container.appendChild(span);
    }
}

// === 모달 관련 ===
function openNewModal(dateStr) {
    editingEventId = null;
    document.getElementById('modal-title').textContent = '새 일정';
    document.getElementById('event-title').value = '';
    document.getElementById('event-date').value = dateStr;
    document.getElementById('event-start-time').value = '09:00';
    document.getElementById('event-end-time').value = '10:00';
    document.getElementById('event-memo').value = '';
    document.getElementById('btn-delete').style.display = 'none';
    selectColor('#4285f4');
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('event-title').focus();
}

function openEditModal(event) {
    editingEventId = event.id;
    document.getElementById('modal-title').textContent = '일정 수정';
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-start-time').value = event.startTime || '09:00';
    document.getElementById('event-end-time').value = event.endTime || '10:00';
    document.getElementById('event-memo').value = event.memo || '';
    document.getElementById('btn-delete').style.display = 'inline-block';
    selectColor(event.color || '#4285f4');
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    editingEventId = null;
}

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.classList.toggle('selected', dot.dataset.color === color);
    });
}

function saveEvent() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const startTime = document.getElementById('event-start-time').value;
    const endTime = document.getElementById('event-end-time').value;
    const memo = document.getElementById('event-memo').value.trim();

    if (!title) {
        document.getElementById('event-title').focus();
        return;
    }
    if (!date) return;

    const events = loadEvents();

    if (editingEventId) {
        // 수정
        const idx = events.findIndex(e => e.id === editingEventId);
        if (idx !== -1) {
            events[idx] = {
                ...events[idx],
                title, date, startTime, endTime,
                color: selectedColor, memo
            };
        }
    } else {
        // 새로 추가
        events.push({
            id: Date.now().toString(),
            title, date, startTime, endTime,
            color: selectedColor, memo
        });
    }

    saveEvents(events);
    closeModal();
    renderCalendar();
}

function deleteEvent() {
    if (!editingEventId) return;
    const events = loadEvents().filter(e => e.id !== editingEventId);
    saveEvents(events);
    closeModal();
    renderCalendar();
}

// === 유틸리티 ===
function formatDate(year, month, date) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(date).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

// === 이벤트 바인딩 ===
document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    miniDate = new Date(currentDate);
    renderCalendar();
    renderMiniCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    miniDate = new Date(currentDate);
    renderCalendar();
    renderMiniCalendar();
});

document.getElementById('btn-today').addEventListener('click', () => {
    currentDate = new Date();
    miniDate = new Date();
    renderCalendar();
    renderMiniCalendar();
});

document.getElementById('mini-prev').addEventListener('click', () => {
    miniDate.setMonth(miniDate.getMonth() - 1);
    renderMiniCalendar();
});

document.getElementById('mini-next').addEventListener('click', () => {
    miniDate.setMonth(miniDate.getMonth() + 1);
    renderMiniCalendar();
});

document.getElementById('btn-create').addEventListener('click', () => {
    const today = new Date();
    openNewModal(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
});

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

document.getElementById('btn-save').addEventListener('click', saveEvent);
document.getElementById('btn-delete').addEventListener('click', deleteEvent);

document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => selectColor(dot.dataset.color));
});

// Enter 키로 저장
document.getElementById('event-title').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEvent();
});

// === 초기 렌더링 ===
renderCalendar();
renderMiniCalendar();
