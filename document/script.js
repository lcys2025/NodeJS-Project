// 頁面載入完成後執行
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".member-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // 防止表單跳頁
    alert("感謝您的加入！我們將盡快與您聯絡。");
  });
});

const form = document.querySelector('.member-form');

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表單預設提交行為

    // 簡單的驗證檢查
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const plan = document.getElementById('plan').value;

    if (!name || !email) {
      alert("請填寫姓名和電子郵件！");
      return;
    }

    // 顯示感謝訊息
    alert(`感謝你的申請，${name}！我們將透過 ${email} 聯絡你關於「${plan}」會員計劃。`);
    
    form.reset(); // 清空表單
  });



  function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}