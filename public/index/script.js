document.addEventListener("DOMContentLoaded", () => {
	const form = document.querySelector(".member-form");
	if (form) {
		form.removeEventListener("submit", handleFormSubmit);
		form.addEventListener("submit", handleFormSubmit);
	}

	const loginButton = document.getElementById("login-button");
	console.log(loginButton);
	
	if (loginButton) {
		loginButton.removeEventListener("click", handleLoginSubmit);
		loginButton.addEventListener("click", handleLoginSubmit);
	}
});

async function handleFormSubmit(event) {
	event.preventDefault();

	const name = document.getElementById("name").value.trim();
	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value.trim();
	const confirmPassword = document.getElementById("confirmPassword").value.trim();
	const plan = document.getElementById("plan").value;

	// validate required fields
	if (!name || !email || !password) {
		alert("請填寫姓名、電子郵件和密碼！");
		return;
	}

	// validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		alert("請輸入有效的電子郵件地址！");
		document.getElementById("email").value = "";
		document.getElementById("email").focus();
		return;
	}

	// validate password strength
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
	if (!passwordRegex.test(password)) {
		alert("密碼需包含大、小寫英文字母、數字，並至少八個字元！");
		return;
	}
	if (password !== confirmPassword) {
		alert("兩次輸入的密碼不一致！");
		document.getElementById("password").value = "";
		document.getElementById("confirmPassword").value = "";
		return;
	}

	try {
		// fetch API to submit the form data
		const response = await fetch("/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: name,
				email: email,
				password: password,
				plan: plan,
			}),
		});

		const result = await response.json();

		// registration success
		if (response.ok) {
			alert(`感謝你的申請，${name}！我們將透過 ${email} 聯絡你關於「${plan}」會員計劃。`);
			event.target.reset();
			window.location.href = "/auth/login";
		} else {
			// registration failed
			alert(`註冊失敗: ${result.message || "請稍後再試"}`);
		}
	} catch (error) {
		// network or server error
		alert("註冊過程中發生錯誤，請稍後再試！");
		console.error("Registration error:", error);
	}
}

async function handleLoginSubmit(event) {
	event.preventDefault();

	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value.trim();

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		alert("請輸入有效的電子郵件地址！");
		document.getElementById("email").value = "";
		document.getElementById("email").focus();
		return;
	}

	try {
		const response = await fetch("/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
				password: password,
			}),
		});

		const result = await response.json();

		if (result.success) {
			window.location.href = "/dashboard";
		} else {
			alert(`帳號或密碼不正確，請重新輸入。`);
		}
	} catch (error) {
		// network or server error
		event.target.reset();
		console.error("Registration error:", error);
	}
}

function scrollToTop() {
	window.scrollTo({ top: 0, behavior: "smooth" });
}
