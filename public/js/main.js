document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = loginForm.elements['username'].value;
    const password = loginForm.elements['password'].value;

    try {
      // Make a POST request to the server for authentication
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Authentication successful
        const result = await response.text();
        console.log(result); // For demonstration purposes
        window.location.href = (username === 'admin') ? '/admin.html' : '/sale.html';
      } else {
        // Authentication failed
        console.error('Authentication failed');
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      alert('An error occurred during authentication');
    }
  });
});
