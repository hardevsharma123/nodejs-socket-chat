const socket = io();

const $chatForm = document.querySelector('#chat-form');
const $messageText = document.querySelector('#message');
const $messageBtn = document.querySelector('#btn-submit');
const $sendLocationBtn = document.querySelector('#send-location');
const $messageContainer = document.querySelector('#messageContainer');
const $sidebarContainer = document.querySelector('#sidebar');

// Templates
const $messageTemplate = document.querySelector('#template').innerHTML;
const $locationTemplate = document.querySelector('#message-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const $newMessage = $messageContainer.lastElementChild;

    const newMessagesStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messageContainer.offsetHeight;
    const contianerHeight = $messageContainer.scrollHeight;
    const scrollOffset = $messageContainer.scrollTop + visibleHeight;
    if(contianerHeight - newMessageHeight <= scrollOffset){
        $messageContainer.scrollTop = $messageContainer.scrollHeight;
    }
};

socket.emit('join', {
    username, room
}, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a'),
        message:message.text
    });
    $messageContainer.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('LocationMessage', (message) => {
    const html = Mustache.render($locationTemplate, {
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a'),
        message:message.url
    });
    $messageContainer.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    });
    $sidebarContainer.innerHTML = html;
})

$chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let message = e.target.elements.message.value;
    if(message == ''){ return } 
    $messageBtn.setAttribute('disabled', 'disabled');
    $messageText.value = '';
    socket.emit('sendMessage', message, (error, status) => {
        if(error){
            return console.log(error);
        }
        console.log('Message delivered', status);
        $messageBtn.removeAttribute('disabled');
    });
});


$sendLocationBtn.addEventListener('click', (e) => {
    if(!navigator.geolocation){
        return alert('Your browser doesn\'t support geolocation');
    }

    navigator.geolocation.getCurrentPosition((position) => {
       socket.emit('sendLocation', {
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
       });
    });
});