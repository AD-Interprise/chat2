const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const input = document.getElementById('msg');
const typingStatus = document.getElementById('typingStatus');

// Get name and room from URL
const { name, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { name, room });

// Get room name and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);
});

socket.on('info', (message) => {
  infoMessage(message);
});

//typing status msg
socket.on('typing', (message) => {
  typingStatus.textContent = message;
});
socket.on('nottyping', (message) => {
  typingStatus.textContent = '';
});

// On error in any case
socket.on('out', () => {
  window.location = '../index.html';
});

//msg typing
input.addEventListener('keypress', () => {
  socket.emit('typing');
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Get message text
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  //Emit Status
  socket.emit('nottyping');
  // Emit message to server
  socket.emit('chatMessage', msg);
  // Clear input
  sendmsg(msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Info message to DOM
function infoMessage(message) {
  let div = `<div class="info-message" ><p class="meta"> Hii `;
  if (message.name) {
    div += `<b>${message.name}</b>`;
  }
  div += ` <span>${message.text}</span></p></div>`;
  document.querySelector('.chat-messages').innerHTML += div;
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Output message to DOM
function outputMessage(message) {
  document.querySelector(
    '.chat-messages'
  ).innerHTML += `<div class="message" ><p class="meta">${
    message.name
  } </p><p><label class="text" style="text-align: left;">${
    message.text
  }<span>${getTime(new Date())}</span></label></p></div>`;
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
  // const div = document.createElement('div');
  // div.classList.add('message');
  // const p = document.createElement('p');
  // p.classList.add('meta');
  // p.innerText = message.name;
  // console.log(message.time)
  // p.innerHTML += ` <span>${getTime(new Date)}</span>`;
  // div.appendChild(p);
  // const para = document.createElement('p');
  // para.classList.add('text');
  // para.innerText = message.text;
  // div.appendChild(para);
  // document.querySelector('.chat-messages').appendChild(div);
}

//SELF message
function sendmsg(msg) {
  document.querySelector(
    '.chat-messages'
  ).innerHTML += `<div class="my-message" >
  <p><label style="text-align: right;" class="text">${msg} <span >${getTime(
    new Date()
  )}</span></label><p></div>`;
  // document.querySelector('.chat-messages').innerHTML += `<div class="my-message" >
  // <p class="meta">You </p><p><label style="text-align: right;" class="text">${msg} <span >${getTime(new Date)}</span></label><p></div>`;
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.name;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

//Get Time
function getTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
