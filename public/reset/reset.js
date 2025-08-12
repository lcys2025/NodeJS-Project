document.getElementById("resetForm").addEventListener("submit", handleResetPassword);
document.getElementById("backButton").addEventListener("click", returnToLogin);

async function handleResetPassword(e) {
	e.preventDefault();
	const newPassword = document.getElementById("newPassword").value.trim();
	const confirmPassword = document.getElementById("confirmPassword").value.trim();
	const email = document.getElementById("email").value.trim();

	const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

	if (!strongPassword.test(newPassword)) {
		alert("密碼需包含大、小寫英文字母、數字，並至少八個字元！");
		document.getElementById("newPassword").value = "";
		document.getElementById("confirmPassword").value = "";
		document.getElementById("newPassword").focus();
		return;
	}

	if (newPassword !== confirmPassword) {
		alert("兩次輸入的密碼不一致！");
		document.getElementById("newPassword").value = "";
		document.getElementById("confirmPassword").value = "";
		return;
	}

	try {
		// send request to server
		const response = await fetch("/auth/resetPassword", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
				newPassword: newPassword,
				confirmPassword: confirmPassword,
			}),
		});
    const responseData = await response.json();
		if (responseData.success) {
			alert("密碼重設成功！你將返回登入頁面。");
			setTimeout(() => {
				window.location.href = "/auth/login";
			}, 1500);
		} else {
			alert("密碼重設失敗！請稍後再試！");
		}
	} catch (error) {
		// network or server error
		alert("重置密碼過程中發生錯誤，請稍後再試！");
		console.error("Registration error:", error);
	}
}

function returnToLogin() {
	window.location.href = "/auth/login";
}
