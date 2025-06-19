const socket = io('http://localhost:8000');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const userSelect = document.getElementById('user-select'); 
const audio = new Audio('ting.mp3');

const append = (message, position) => {
    const messageElement = document.createElement('div');
    const now = new Date(); 
    const time = now.toLocaleTimeString([],{hour: '2-digit', minute: '2-digit'});
    messageElement.innerText = `${message} (${time})`;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if (position === 'left') audio.play();
};

const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right'); 
});


socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

 
socket.on('receive-private', data => {
    append(`(Private) ${data.from}: ${data.message}`, 'left');
});


socket.on('left', name => {
    append(`${name} left the chat`, 'right');
});


socket.on('user-list', users => {
    userSelect.innerHTML = '<option value="">Everyone</option>';
    for (const [id, userName] of Object.entries(users)) {
        if (id !== socket.id) {
            const option = document.createElement('option');
            option.value = id;
            option.innerText = userName;
            userSelect.appendChild(option);
        }
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    const selectedUserId = userSelect.value;

    if (!message) return;
    if (selectedUserId) {

        const receiverName =  userSelect.options[userSelect.selectedIndex].text;
        append(`You to [${receiverName}]: ${message}`, 'right');
        socket.emit('private-message', { toSocketId: selectedUserId, message });
    } 
    else {
        
        append(`You: ${message}`, 'right');
        socket.emit('send', message);
    }

    messageInput.value = '';
});
 