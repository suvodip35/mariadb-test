const usersList = document.querySelector('#users-list');
const userForm = document.querySelector('#user-form');
const userIdInput = document.querySelector('#user-id');
const usernameInput = document.querySelector('#username');
const emailInput = document.querySelector('#email');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const passwordHashInput = document.querySelector('#password-hash');
const statusBox = document.querySelector('#status');
const resetButton = document.querySelector('#reset-btn');

async function fetchUsers() {
  const response = await fetch('/api/users');
  const users = await response.json();
  renderUsers(users);
}

function renderUsers(users) {
  usersList.innerHTML = '';

  if (!users.length) {
    usersList.innerHTML = '<li class="user-item">No users found.</li>';
    return;
  }

  users.forEach((user) => {
    const item = document.createElement('li');
    item.className = 'user-item';

    item.innerHTML = `
      <div class="user-meta">
        <strong>${user.first_name || ''} ${user.last_name || ''}</strong>
        <span>${user.username}</span>
        <small>${user.email}</small>
      </div>
      <div class="user-actions">
        <button class="edit-btn" data-id="${user.id}">Edit</button>
        <button class="delete-btn" data-id="${user.id}">Delete</button>
      </div>
    `;

    usersList.appendChild(item);
  });

  document.querySelectorAll('.edit-btn').forEach((button) => {
    button.addEventListener('click', () => loadUserForEdit(button.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', () => deleteUser(button.dataset.id));
  });
}

async function loadUserForEdit(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();

  userIdInput.value = user.id;
  usernameInput.value = user.username;
  emailInput.value = user.email;
  firstNameInput.value = user.first_name || '';
  lastNameInput.value = user.last_name || '';
  passwordHashInput.value = '********';
  usernameInput.focus();
}

async function deleteUser(id) {
  const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  const data = await response.json();
  setStatus(response.ok ? data.message : data.error, response.ok ? 'success' : 'error');
  if (response.ok) {
    fetchUsers();
    resetForm();
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const user = {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    password_hash: passwordHashInput.value.trim(),
  };

  const userId = userIdInput.value;
  const method = userId ? 'PUT' : 'POST';
  const url = userId ? `/api/users/${userId}` : '/api/users';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  const data = await response.json();
  setStatus(response.ok ? (userId ? 'User updated.' : 'User created.') : data.error, response.ok ? 'success' : 'error');

  if (response.ok) {
    fetchUsers();
    resetForm();
  }
}

function setStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = type;
}

function resetForm() {
  userForm.reset();
  userIdInput.value = '';
  passwordHashInput.value = '';
}

resetButton.addEventListener('click', resetForm);
userForm.addEventListener('submit', handleSubmit);

fetchUsers();
