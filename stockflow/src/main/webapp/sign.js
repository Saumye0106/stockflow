const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Toggle between sign-up and sign-in views
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Sign-up form submission
document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    fetch("http://localhost:8080/stockflow/signup", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${name}&email=${email}&password=${password}`, // Corrected parameter name
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                alert("Registration successful!");
                container.classList.remove("active"); // Switch to login form
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => console.error("Error:", error));
});

// Sign-in form submission
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch("http://localhost:8080/stockflow/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${email}&password=${password}`,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                alert("Login successful!");
                window.location.href = 'home.html'; // Redirect to home page
            } else {
                alert("Invalid email or password.");
            }
        })
        .catch(error => console.error("Error:", error));
});
