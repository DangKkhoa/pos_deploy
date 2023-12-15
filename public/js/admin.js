// admin.js

document.addEventListener('DOMContentLoaded', function () {
    const addSalespersonForm = document.getElementById('addSalespersonForm');
    const salespersonList = document.getElementById('salespersonList');
  
    // Function to fetch and display salespersons
    function fetchAndDisplaySalespersons() {
      // Make a GET request to fetch existing salespersons
      fetch('/api/salespersons')
        .then(response => response.json())
        .then(data => {
          // Update the UI by displaying the fetched salespersons
          salespersonList.innerHTML = ''; // Clear the list
          data.forEach(salesperson => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `${salesperson.name} - ${salesperson.email}`;
            salespersonList.appendChild(listItem);
          });
        })
        .catch(error => {
          console.error('Error fetching salespersons:', error);
        });
    }
    
    // Event listener for form submission
    addSalespersonForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent default form submission
  
      // Get form data
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
  
      // Make a POST request to add a salesperson
      fetch('/api/salespersons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })
        .then(response => response.json())
        .then(data => {
          // Handle the response data (e.g., update the UI)
          console.log('Salesperson added:', data);
  
          // Fetch and display salespersons again after adding a new one
          fetchAndDisplaySalespersons();
          $('#addSalespersonModal').modal('hide');
          addSalespersonForm.reset();
        })
        .catch(error => {
          console.error('Error adding salesperson:', error);
        });
    });
    // Fetch and display salespersons when the page loads
    fetchAndDisplaySalespersons();
     // Hide the "Add Salesperson" modal using jQuery
     
  // Function to show a notification
  function showNotification(message, type) {
    const notificationArea = document.getElementById('notificationArea');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';

    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
      ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    `;

    notificationArea.innerHTML = '';
    notificationArea.appendChild(alert);
  }

    // Event listener for changing the password
  const changePasswordForm = document.getElementById('changePasswordForm');
  changePasswordForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validate that the new password and confirm new password match
    if (newPassword !== confirmNewPassword) {
      alert('New password and confirm new password do not match');
      return;
    }

    // Make a POST request to change the password
    fetch('/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
      .then(response => response.text())
      .then(data => {
        console.log('Password change response:', data);
        showNotification('Password changed successfully', 'success');
        $('#changePasswordModal').modal('hide'); // Hide the modal after showing the notification
        changePasswordForm.reset(); // Reset the form
      })
      .catch(error => {
        console.error('Error changing password:', error);
        showNotification('Error changing password', 'danger');
      });
  });
});
  