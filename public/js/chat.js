const socket = io();

// Elements
const messageForm = document.querySelector('#chat-message-form');
const messageFormInput = document.querySelector('input');
const messageFormButton = document.querySelector('button');
const locationButton = document.querySelector('#send-location');
const messages = document.querySelector('#chat-messages');

// Templates
const chatMessageTemplate = document.querySelector('#chat-message-template')
  .innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template',
).innerHTML;

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(chatMessageTemplate, {
    createdAt: moment(message.createdAt).format('HH:mm:ss'),
    message: message.text,
  });
  messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationMessageTemplate, {
    location: location.text,
    createdAt: moment(location.createdAt).format('HH:mm:ss'),
  });
  messages.insertAdjacentHTML('beforeend', html);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageFormInput.value;

  messageFormButton.disabled = true;

  socket.emit('sendMessage', message, (error) => {
    messageFormButton.disabled = false;
    messageFormInput.value = '';
    messageFormInput.focus();

    // This callback is running when after the message was acknowledged on the
    //    backend and it's own callback has run
    // You can add more than own parameter into the 'sendMessage' emitter but the cb
    // must be the last in the list e.g.
    //    'sendMessage', message, arg2, arg3, (cbMessage) =>..
    if (error) {
      return console.log(error);
    }
    console.log('Message delivered');
  });
});

locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Your browser does not support geolocation');
  }

  locationButton.disabled = true;

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const location = { latitude, longitude };

    socket.emit('sendLocation', location, () => {
      locationButton.disabled = false;
      console.log('Location shared');
    });
  });
});
