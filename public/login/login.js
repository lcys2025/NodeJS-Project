function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("請輸入 Email 和密碼！");
    return;
  }

  if (!isValidPassword(password)) {
    alert("密碼需包含至少8個字元、大小寫字母及數字！");
    return;
  }

  alert(`歡迎回來，${email}！`);
  window.location.href = '/dashboard';
});