document.getElementById("resetForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!strongPassword.test(newPassword)) {
    alert("密碼需包含大、小寫英文字母、數字，並至少八個字元！");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("兩次輸入的密碼不一致！");
    return;
  }

  alert("密碼重設成功！你將返回登入頁面。");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500); 
});
