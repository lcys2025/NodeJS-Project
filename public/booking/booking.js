// 預約資料
let selectedDate = null;
let bookedDates = []; // 從後端獲取已預約的日期
let bookedTrainers = []; // 存儲已被預約的教練

document.addEventListener("DOMContentLoaded", function () {
	// 教練選擇邏輯
	let selectedTrainer = null;
	const trainers = document.querySelectorAll(".trainer");
	trainers.forEach((el) => {
		el.addEventListener("click", async () => {
			// 檢查教練是否已被預約
			const trainerId = el.dataset.id;
			if (bookedTrainers.includes(trainerId)) {
				alert("此教練在當前月份已被預約");
				return;
			}

			selectedTrainer = {
				id: trainerId,
				name: el.dataset.name,
			};

			trainers.forEach((t) => t.classList.remove("selected"));
			el.classList.add("selected");

			// 顯示日历、备注和提交按钮部分
			document.getElementById("calendar-section").style.display = "block";
			document.getElementById("notes-section").style.display = "block";
			document.getElementById("actions-section").style.display = "flex";

			// 獲取教練的已預約日期
			if (trainerId) {
				await fetchTrainerBookedDates(trainerId);
				// 重新渲染日曆
				const yearSelect = document.getElementById("year-select");
				const monthSelect = document.getElementById("month-select");
				const calendar = document.getElementById("calendar");
				if (yearSelect && monthSelect && calendar) {
					renderCalendar(calendar, parseInt(yearSelect.value), parseInt(monthSelect.value), selectedTrainer);
				}
			}
		});
	});

	// 初始化年份與月份選單
	const yearSelect = document.getElementById("year-select");
	const monthSelect = document.getElementById("month-select");
	const calendar = document.getElementById("calendar");
	const message = document.getElementById("message");
	const submitBtn = document.getElementById("submitBtn");

	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();

	for (let y = currentYear - 5; y <= currentYear + 5; y++) {
		const option = document.createElement("option");
		option.value = y;
		option.textContent = y;
		if (y === currentYear) option.selected = true;
		yearSelect.appendChild(option);
	}

	const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
	monthNames.forEach((name, index) => {
		const option = document.createElement("option");
		option.value = index;
		option.textContent = name;
		if (index === currentMonth) option.selected = true;
		monthSelect.appendChild(option);
	});

	// 初次渲染日曆（不传递 selectedTrainer，所以日期不可选）
	renderCalendar(calendar, currentYear, currentMonth, null);

	// 監聽年份變更
	yearSelect.addEventListener("change", () => {
		renderCalendar(calendar, parseInt(yearSelect.value), parseInt(monthSelect.value), selectedTrainer);
		// 當月份變更時，重新獲取教練的已預約日期
		if (selectedTrainer && selectedTrainer.id) {
			fetchTrainerBookedDates(selectedTrainer.id);
		}
	});

	// 監聽月份變更
	monthSelect.addEventListener("change", () => {
		renderCalendar(calendar, parseInt(yearSelect.value), parseInt(monthSelect.value), selectedTrainer);
		// 當月份變更時，重新獲取教練的已預約日期
		if (selectedTrainer && selectedTrainer.id) {
			fetchTrainerBookedDates(selectedTrainer.id);
		}
	});

	// 提交預約 - 正確的方式是在點擊時才獲取值
	if (submitBtn) {
		submitBtn.addEventListener("click", () => {
			// 在點擊時才獲取 textarea 的值
			const notesEl = document.getElementById("notes");
			const notes = notesEl ? notesEl.value : "";

			// 在點擊時獲取 userId 的值
			const userIdEl = document.getElementById("userId");
			const userId = userIdEl ? userIdEl.value : null;

			fetchBookings(selectedTrainer, selectedDate, message, notes, userId);
		});
	}
});

// 獲取教練的已預約日期 API
async function fetchTrainerBookedDates(trainerId) {
	if (!trainerId) return;

	try {
		const yearSelect = document.getElementById("year-select");
		const monthSelect = document.getElementById("month-select");

		if (!yearSelect || !monthSelect) return;

		const year = yearSelect.value;
		const month = parseInt(monthSelect.value) + 1; // JS 月份從 0 開始
		const monthStr = `${year}-${String(month).padStart(2, "0")}`;

		const response = await fetch(`/booking/trainer/${trainerId}?month=${monthStr}`);
		const result = await response.json();

		if (result.success) {
			bookedDates = result.data.bookedDates || [];
		} else {
			bookedDates = [];
		}
	} catch (error) {
		console.error("獲取教練已預約日期失敗:", error);
		bookedDates = [];
	}
}

// 渲染日曆函式
function renderCalendar(calendar, year, month, selectedTrainer) {
	if (!calendar) return;

	calendar.innerHTML = "";
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const grid = document.createElement("div");
	grid.className = "calendar-grid";

	for (let i = 0; i < firstDay; i++) {
		grid.appendChild(document.createElement("div"));
	}

	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
		const day = document.createElement("div");
		day.textContent = d;
		day.className = "day";

		// 檢查是否是過去的日期
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const cellDate = new Date(year, month, d);

		if (cellDate < currentDate) {
			day.classList.add("past");
			day.title = "過去日期";
		} else if (bookedDates.includes(dateStr)) {
			day.classList.add("booked");
			day.title = "已預約";
		} else if (selectedTrainer) {
			// 只有在選擇了教練的情況下才能點擊日期
			day.addEventListener("click", () => {
				selectedDate = dateStr;
				document.querySelectorAll(".day").forEach((d) => d.classList.remove("selected"));
				day.classList.add("selected");
			});
		} else {
			// 沒有選擇教練時，日期顯示為不可選
			day.classList.add("disabled");
			day.title = "請先選擇教練";
		}

		grid.appendChild(day);
	}

	calendar.appendChild(grid);
}

// 提交預約 API
async function fetchBookings(selectedTrainer, selectedDate, message, notes, userId) {
	if (!selectedTrainer || !selectedDate) {
		alert("請選擇教練與日期");
		return;
	}

	if (bookedDates.includes(selectedDate)) {
		alert("此日期已被預約，請選擇其他日期");
		return;
	}

	try {
		// 提交預約請求到後端
		const response = await fetch("/booking/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userId: userId,
				trainerId: selectedTrainer.id,
				bookingDate: selectedDate,
				sessionType: "personal", // 默認會話類型,
				notes: notes,
			}),
		});

		const result = await response.json();

		if (result.success) {
			// 更新已預約日期
			bookedDates.push(selectedDate);

			// 重新渲染日曆
			const yearSelect = document.getElementById("year-select");
			const monthSelect = document.getElementById("month-select");
			const calendar = document.getElementById("calendar");

			if (yearSelect && monthSelect && calendar) {
				renderCalendar(calendar, parseInt(yearSelect.value), parseInt(monthSelect.value), selectedTrainer);
			}

			if (message) {
				message.textContent = `成功預約 ${selectedTrainer.name}，日期：${selectedDate}`;
				message.style.color = "green";
			}

			// 顯示彈出視窗
			alert(`成功預約 ${selectedTrainer.name}，日期：${selectedDate}`);

			// 清除選擇
			selectedDate = null;
			document.querySelectorAll(".day").forEach((el) => el.classList.remove("selected"));

			// 清空 notes 輸入框
			const notesEl = document.getElementById("notes");
			if (notesEl) {
				notesEl.value = "";
			}

			// 預約成功後跳轉到儀表板頁面
			window.location.href = "/dashboard?booking=success";
		} else {
			alert(`預約失敗: ${result.message || "請稍後再試"}`);
		}
	} catch (error) {
		console.error("預約請求失敗:", error);
		alert("預約過程中發生錯誤，請稍後再試");
	}
}