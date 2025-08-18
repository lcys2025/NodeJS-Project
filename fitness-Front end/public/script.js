let selectedCoach = null;

document.querySelectorAll('.coach').forEach(coach => {
  coach.addEventListener('click', () => {
    document.querySelectorAll('.coach').forEach(c => c.classList.remove('selected'));
    coach.classList.add('selected');
    selectedCoach = coach.getAttribute('data-name');
  });
});

document.getElementById('submitBtn').addEventListener('click', async () => {
  const course = document.getElementById('courseSelect').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  if (!selectedCoach || !course || !date || !time) {
    alert('請完整選擇所有項目');
    return;
  }

  const booking = {
    coach: selectedCoach,
    course,
    date,
    time
  };

  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });

  const result = await res.json();
  alert(result.message);
});
