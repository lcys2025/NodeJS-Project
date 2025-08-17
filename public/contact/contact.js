function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").innerText.trim();

  if (!name || !email || !message) {
    alert("請輸入 name, email 和 message！");
    return;
  }

  alert(`Thank you for your message, ${name}!`);
  window.location.href = "index.html";
});


export default router;