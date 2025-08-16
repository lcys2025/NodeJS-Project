document.addEventListener("DOMContentLoaded", () => {
  // Initialize any dashboard-specific functionality
  console.log("Dashboard loaded");
  
  // Add event listeners for status updates
  document.querySelectorAll('.status-form select').forEach(select => {
    select.addEventListener('change', function() {
      this.form.submit();
    });
  });
});