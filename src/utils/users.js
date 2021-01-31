const users = [];

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required',
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: 'Username is in use for that room',
    };
  }

  // Store the user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  if (id == null) {
    return {
      error: 'No id has been supplied',
    };
  }

  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  if (id == null) {
    return {
      error: 'No id has been supplied',
    };
  }
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  if (room == null) {
    return {
      error: 'No room has been supplied',
    };
  }
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom;
};

/* addUser({ id: 0, username: 'Lily', room: 'Dev' });
addUser({ id: 1, username: 'Luke', room: 'Dev' });
addUser({ id: 2, username: 'Lady', room: 'Dev' });
addUser({ id: 3, username: 'JS Dev', room: 'js' });
console.log(getUsersInRoom('dev'));
 */

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
