// trainer.js
document.addEventListener("DOMContentLoaded", function () {
	const dashboardData = window.dashboardData;
	const bookedData = dashboardData?.data?.bookings || [];

	const yearSelect = document.getElementById("yearSelect");
	const monthSelect = document.getElementById("monthSelect");
	const calendar = document.getElementById("calendar");
	const appointmentsList = document.getElementById("appointmentsList");
	const logContainer = document.getElementById("logContainer");
	const studentStatsDiv = document.getElementById("studentStats");

	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth();

	// 預約資料 & 學生上課次數
	let bookedAppointments = [];
	let studentStats = {};
	if (bookedData && bookedData.length > 0) {
		bookedAppointments = bookedData.map((item) => {
			const userName = item?.userId?.name || "";
			return {
				bookingId: item._id,
				studentName: userName,
				date: formatDate(new Date(item.bookingDate)),
				status: item.status,
			};
		});

		studentStats = bookedData.reduce((stats, item) => {
			const userName = item?.userId?.name || "";
			if (userName) {
				if (item.status === "confirmed") {
					stats[userName] = (stats[userName] || 0) + 1;
				}
			}
			return stats;
		}, {});
	}

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
			const emptyDiv = document.createElement("div");
			emptyDiv.className = "day";
			emptyDiv.classList.add("past");
			calendar.appendChild(emptyDiv);
		}

		for (let d = 1; d <= daysInMonth; d++) {
			const dayDiv = document.createElement("div");
			dayDiv.className = "day";

			const dayNumber = document.createElement("div");
			dayNumber.className = "day-number";
			dayNumber.textContent = d;
			dayDiv.appendChild(dayNumber);

			const dateObj = new Date(year, month, d);
			const dateStr = formatDate(dateObj);
			const now = new Date();
			now.setHours(0, 0, 0, 0);

			const appointment = bookedAppointments.find((a) => {
				return a.date === dateStr && a.status !== "cancelled";
			});
			const isPast = dateObj < now;
			const isConfirmed = appointment && appointment.status === "confirmed";

			if (isPast) {
				dayDiv.classList.add("past");
			} else if (isConfirmed) {
				dayDiv.classList.add("booked");
				dayDiv.style.cursor = "pointer";
				dayDiv.onclick = () => loadAppointments(year, month, d);
			} else if (appointment) {
				dayDiv.classList.add("booked");
				dayDiv.style.cursor = "pointer";
				dayDiv.onclick = () => loadAppointments(year, month, d);
			} else {
				dayDiv.classList.add("available");
				dayDiv.onclick = () => loadAppointments(year, month, d);
			}

			calendar.appendChild(dayDiv);
		}
	}

	// 顯示當日預約
	function loadAppointments(year, month, day) {
		appointmentsList.innerHTML = "";
		const dateStr = formatDate(new Date(year, month, day));
		const appointment = bookedAppointments.find((a) => a.date === dateStr);

		if (appointment && appointment.status === "pending") {
			const li = document.createElement("li");
			li.innerHTML = `
        <div class="appointment-card">
          <div class="appointment-header">
            <div class="appointment-details">
              <p><strong>Gymer:</strong> ${appointment.studentName}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
            </div>
            <div class="appointment-status pending">Pending</div>
          </div>
          <div class="appointment-actions">
            <button class="accept-btn" onclick="acceptAppointment('${dateStr}')">Accept</button>
            <button class="cancel-btn" onclick="cancelAppointment('${dateStr}')">Cancel</button>
          </div>
        </div>
      `;
			appointmentsList.appendChild(li);
		} else if (appointment.status === "confirmed") {
			const li = document.createElement("li");
			li.innerHTML = `
        <div class="appointment-card">
          <div class="appointment-header">
            <div class="appointment-details">
              <p><strong>Gymer:</strong> ${appointment.studentName}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
            </div>
            <div class="appointment-status confirmed">Confirmed</div>
          </div>
        </div>
      `;
			appointmentsList.appendChild(li);
		} else if (appointment.status === "cancelled") {
			const li = document.createElement("li");
			li.innerHTML = `
        <div class="appointment-card">
          <div class="appointment-header">
            <div class="appointment-details">
              <p><strong>Gymer:</strong> ${appointment.studentName}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
            </div>
            <div class="appointment-status cancelled">Cancelled</div>
          </div>
        </div>
      `;
			appointmentsList.appendChild(li);
		} else {
			appointmentsList.textContent = "No Booking Information";
		}
	}

	// 顯示操作紀錄
	function renderLogAction(bookedData) {
		if (bookedData && bookedData.length > 0) {
			bookedData.forEach((booked) => {
				const bookedDate = new Date(booked.bookingDate);
				const createdDate = new Date(booked.createdAt);
				const userName = booked.userId?.name || "";
				let logEntry = "";

				if (booked.status === "confirmed") {
					logEntry = `${formatDate(createdDate)} - Accept Booking ${userName} (${formatDate(bookedDate)})`;
				} else if (booked.status === "cancelled") {
					logEntry = `${formatDate(createdDate)} - Cancel Booking ${userName} (${formatDate(bookedDate)})`;
				}

				if (logEntry) {
					const p = document.createElement("p");
					p.textContent = logEntry;
					logContainer.appendChild(p);
				}
			});
		}
	}

	// 操作紀錄
	function logAction(action, studentName, date) {
		const logEntry = `${formatDate(new Date())} - ${action} ${studentName} (${formatDate(new Date(date))})`;

		const p = document.createElement("p");
		p.textContent = logEntry;
		logContainer.appendChild(p);
	}

	// 接受預約
	window.acceptAppointment = function (date) {
		const appointment = bookedAppointments.find((a) => a.date === date);
		if (appointment) {
			let success = updateStatus(appointment.bookingId, 'confirmed');
			if (success) {
				appointmentsList.innerHTML = "";
				renderCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
				alert("Booking Confirmed！");
				window.location.href = "/dashboard";
			}
		}
	};

	// 取消預約
	window.cancelAppointment = function (date) {
		const appointment = bookedAppointments.find((a) => a.date === date);
		if (appointment) {
			let success = updateStatus(appointment.bookingId, 'cancelled');
			if (success) {
				appointmentsList.innerHTML = "";
				renderCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
				alert("Booking Cancelled！");
				window.location.href = "/dashboard";
			}
		}
	};

	// 顯示學生上課次數
	function showStudentStats() {
		studentStatsDiv.innerHTML = "<h2>Number of Classes Attended</h2>";
		for (const [name, count] of Object.entries(studentStats)) {
			const p = document.createElement("p");
			p.textContent = `${name}：${count} session(s)`;
			studentStatsDiv.appendChild(p);
		}
	}

	// 事件監聽器
	yearSelect.addEventListener("change", () => {
		renderCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
	});

	monthSelect.addEventListener("change", () => {
		renderCalendar(parseInt(yearSelect.value), parseInt(monthSelect.value));
	});

	// 初始化
	renderCalendar(currentYear, currentMonth);
	renderLogAction(bookedData);
	showStudentStats();
});

function formatDate(date) {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Hong_Kong",
	});
	return formatter.format(date);
}

async function updateStatus(bookingId, status) {
	try {
		const response = await fetch("/dashboard/update-status", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				bookingId: bookingId,
				status: status,
			}),
		});

		const result = await response.json();

		if (result.success) {
			return true;
		} else {
			console.error("Failed to update booking status");
			alert("Failed to update booking status");
			return false;
		}
	} catch (error) {
		console.error("Error updating booking status:", error);
		alert("Error occurred while updating booking status");
		return false;
	}
}
