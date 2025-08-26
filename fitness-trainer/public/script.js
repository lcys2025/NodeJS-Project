const coachName = "王小明";
document.getElementById("coachName").textContent = coachName;

const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const calendar = document.getElementById("calendar");
const appointmentsList = document.getElementById("appointmentsList");
const logContainer = document.getElementById("logContainer");
const studentStatsDiv = document.getElementById("studentStats");

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDateStr = `${currentYear}-${currentMonth + 1}-${today.getDate()}`;

// 模擬預約資料
const mockAppointments = [
  { studentName: "陳大文", date: "2025-8-26", status: "pending" },
  { studentName: "李美麗", date: "2025-8-27", status: "pending" },
  { studentName: "張小強", date: "2025-8-28", status: "pending" }
];

// 模擬學生上課次數
const studentStats = {
  "陳大文": 3,
  "李美麗": 5,
  "張小強": 2
};

// 初始化年份與月份選單
for (let y = currentYear - 5; y <= currentYear + 5; y++) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}
yearSelect.value = currentYear;

for (let m = 0; m < 12; m++) {
  const option = document.createElement("option");
  option.value = m;
  option.textContent = m + 1;
  monthSelect.appendChild(option);
}
monthSelect.value = currentMonth;

// 渲染月曆
function renderCalendar(year, month) {
  calendar.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.textContent = d;

    const dateStr = `${year}-${month + 1}-${d}`;
    const dateObj = new Date(year, month, d);
    const now = new Date();

    const appointment = mockAppointments.find(a => a.date === dateStr);
    const isPast = dateObj < now;
    const isConfirmed = appointment && appointment.status === "confirmed";

    if (isPast || isConfirmed) {
      dayDiv.classList.add("disabled");
    } else {
      dayDiv.classList.add(appointment ? "booked" : "available");
      dayDiv.onclick = () => loadAppointments(year, month, d);
    }

    calendar.appendChild(dayDiv);
  }
}

// 顯示當日預約
function loadAppointments(year, month, day) {
  appointmentsList.innerHTML = "";
  const dateStr = `${year}-${month + 1}-${day}`;
  const appointment = mockAppointments.find(a => a.date === dateStr);

  if (appointment && appointment.status === "pending") {
    const li = document.createElement("li");
    li.innerHTML = `
      Student：${appointment.studentName}<br>
      Date：${dateStr}<br>
      <button onclick="acceptAppointment('${appointment.studentName}', '${dateStr}')">accept</button>
      <button onclick="cancelAppointment('${appointment.studentName}', '${dateStr}')">cancel</button>
    `;
    appointmentsList.appendChild(li);
  } else {
    appointmentsList.textContent = "No Booking Information";
  }
}

// 操作紀錄
function logAction(action, studentName, date) {
  const logEntry = `${new Date().toLocaleString()} - ${action} ${studentName} (${date})`;
  const p = document.createElement("p");
  p.textContent = logEntry;
  logContainer.appendChild(p);
}

// 接受預約
function acceptAppointment(studentName, date) {
  logAction("Accept Booking", studentName, date);
  studentStats[studentName] = (studentStats[studentName] || 0) + 1;

  const appointment = mockAppointments.find(a => a.date === date);
  if (appointment) appointment.status = "confirmed";

  showStudentStats();
  appointmentsList.innerHTML = "";
  renderCalendar(+yearSelect.value, +monthSelect.value);
  alert("Booking Confirmed！");
}

// 取消預約
function cancelAppointment(studentName, date) {
  logAction("Cancel Booking", studentName, date);
  const index = mockAppointments.findIndex(a => a.date === date);
  if (index !== -1) mockAppointments.splice(index, 1);
  appointmentsList.innerHTML = "";
  renderCalendar(+yearSelect.value, +monthSelect.value);
  alert("Booking Cancelled！");
}

// 顯示學生上課次數
function showStudentStats() {
  studentStatsDiv.innerHTML = "<h2>	Number of Classes Attended</h2>";
  for (const [name, count] of Object.entries(studentStats)) {
    const p = document.createElement("p");
    p.textContent = `${name}：${count} session(s)`;
    studentStatsDiv.appendChild(p);
  }
}

renderCalendar(currentYear, currentMonth);
showStudentStats();
yearSelect.onchange = () => renderCalendar(+yearSelect.value, +monthSelect.value);
monthSelect.onchange = () => renderCalendar(+yearSelect.value, +monthSelect.value);

