document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const monthDisplay = document.getElementById("monthDisplay");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const selectedDateEl = document.getElementById("selectedDate");

  let currentDate = new Date();
  let selectedDate = null;
  let trainerId = document.getElementById("trainerSelect").value;

  // Initialize calendar
  renderCalendar(currentDate);

  // Event listeners
  document.getElementById("trainerSelect").addEventListener("change", function () {
    trainerId = this.value;
    selectedDate = null;
    selectedDateEl.textContent = "No date selected";
    renderCalendar(currentDate);
  });

  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  document.getElementById("bookingForm").addEventListener("submit", handleBookingSubmit);

  async function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    monthDisplay.textContent = monthName;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get booked dates from server
    const bookedDates = await fetchTrainerAvailability(year, month + 1);

    // Clear calendar
    calendarEl.innerHTML = '';

    // Add header for week days
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      const dayEl = document.createElement("div");
      dayEl.className = "calendar-header-day";
      dayEl.textContent = day;
      calendarEl.appendChild(dayEl);
    });

    // Add empty cells for days before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "calendar-day empty";
      calendarEl.appendChild(emptyEl);
    }

    // Add days of month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dateStr = formatDate(dayDate);

      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = day;
      dayEl.dataset.date = dateStr;

      // Check if date is in past
      if (dayDate < today) {
        dayEl.classList.add("past");
        dayEl.title = "Past date";
      }
      // Check if date is booked
      else if (bookedDates.includes(dateStr)) {
        dayEl.classList.add("booked");
        dayEl.title = "Already booked";
      }
      // Available date
      else {
        dayEl.classList.add("available");
        dayEl.addEventListener("click", () => selectDate(dayDate));
      }

      // Highlight selected date
      if (selectedDate && formatDate(selectedDate) === dateStr) {
        dayEl.classList.add("selected");
      }

      calendarEl.appendChild(dayEl);
    }
  }

  async function fetchTrainerAvailability(year, month) {
    if (!trainerId) return [];

    try {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const response = await fetch(`/booking/trainer/${trainerId}?month=${monthStr}`);
      const result = await response.json();

      if (result.success) {
        return result.data.bookedDates;
      }
      return [];
    } catch (error) {
      console.error("Error fetching availability:", error);
      return [];
    }
  }

  function selectDate(date) {
    selectedDate = date;
    selectedDateEl.textContent = formatDate(date);

    // Re-render calendar to show selection
    renderCalendar(currentDate);
  }

  function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();

    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    const userId = document.getElementById("userId").value;
    const trainerId = document.getElementById("trainerSelect").value;
    const sessionType = document.getElementById("sessionType").value;
    const notes = document.getElementById("notes").value;
    const bookingDate = formatDate(selectedDate);
    console.log(userId);
    console.log(trainerId);
    console.log(sessionType);
    console.log(notes);
    console.log(bookingDate);

    try {
      const response = await fetch("/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          trainerId,
          bookingDate,
          sessionType,
          notes
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Booking created successfully!");
        // Store booking success in session storage
        sessionStorage.setItem('bookingSuccess', 'true');
        //window.location.href = '/dashboard';
        window.location.href = '/dashboard?booking=success'; 
      } else {
        alert(`Booking failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Error creating booking");
    }
  }
});