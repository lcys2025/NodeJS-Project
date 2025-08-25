// 教練選擇邏輯
let selectedTrainer = null;
document.querySelectorAll('.trainer').forEach(el => {
  el.addEventListener('click', () => {
    selectedTrainer = el.dataset.name;
    document.querySelectorAll('.trainer').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
  });
});

// 課程選擇邏輯
let selectedCourse = null;
document.querySelectorAll('.course').forEach(el => {
  el.addEventListener('click', () => {
    selectedCourse = el.dataset.name;
    document.querySelectorAll('.course').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  });
});

// 初始化年份與月份選單
const yearSelect = document.getElementById('year-select');
const monthSelect = document.getElementById('month-select');
const calendar = document.getElementById('calendar');

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

for (let y = currentYear - 5; y <= currentYear + 5; y++) {
  const option = document.createElement('option');
  option.value = y;
  option.textContent = y;
  if (y === currentYear) option.selected = true;
  yearSelect.appendChild(option);
}

const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
monthNames.forEach((name, index) => {
  const option = document.createElement('option');
  option.value = index;
  option.textContent = name;
  if (index === currentMonth) option.selected = true;
  monthSelect.appendChild(option);
});

// 預約資料
let selectedDate = null;
let bookedDates = ['2025-08-24']; // 可改為從後端取得

// 渲染日曆函式（定義但尚未呼叫）
function renderCalendar(year, month) {
  calendar.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid = document.createElement('div');
  grid.className = 'calendar-grid';

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const day = document.createElement('div');
    day.textContent = d;
    day.className = 'day';

    if (bookedDates.includes(dateStr)) {
      day.classList.add('booked');
      day.title = '已預約';
    } else {
      day.addEventListener('click', () => {
        selectedDate = dateStr;
        document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
        day.classList.add('selected');
      });
    }

    grid.appendChild(day);
  }

  calendar.appendChild(grid);
}

// 初次渲染日曆
renderCalendar(currentYear, currentMonth);

// 監聽年份與月份變更
yearSelect.addEventListener('change', () => {
  renderCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
});

monthSelect.addEventListener('change', () => {
  renderCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
});

// 提交預約
document.getElementById('submitBtn').addEventListener('click', () => {
  if (!selectedTrainer || !selectedCourse || !selectedDate) {
    alert('請選擇教練、課程與日期');
    return;
  }

  if (bookedDates.includes(selectedDate)) {
    alert('此日期已被預約，請選擇其他日期');
    return;
  }

  // 模擬儲存預約（可改為送出至後端）
  bookedDates.push(selectedDate);
  renderCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));

  message.textContent = `成功預約 ${selectedTrainer} 的 ${selectedCourse}，日期：${selectedDate}`;
  message.style.color = 'green';

  // 顯示彈出視窗
  alert(`成功預約 ${selectedTrainer} 的 ${selectedCourse}，日期：${selectedDate}`);

  // 清除選擇
  selectedTrainer = null;
  selectedCourse = null;
  selectedDate = null;
  document.querySelectorAll('.trainer, .course, .day').forEach(el => el.classList.remove('selected'));
});
