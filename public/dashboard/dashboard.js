document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.status-form select').forEach(select => {
    select.addEventListener('change', function() {
      this.form.submit();
    });
  });
});