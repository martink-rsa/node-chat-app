const socket = io();

socket.on('message', (message) => {
  console.log('Message:', message);
});

document.querySelector('#chat-message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const message = e.target.elements['chat-message'].value;

  socket.emit('sendMessage', message, (error) => {
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

document.querySelector('#send-location').addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Your browser does not support geolocation');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const location = { latitude, longitude };
    socket.emit('sendLocation', location, () => {
      console.log('Location shared');
    });
  });
});
