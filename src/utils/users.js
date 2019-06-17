const users = [];

const addUser = ({id, username, room}) => {

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room){
        return { error: 'Username or Room can\'t be empty'};
    }

    const exixtedUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    if(exixtedUser){
        return {error: 'Username already taken!'};
    }

    const user = {id, username, room};
    users.push(user);
    return user;
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id);
    if(!user){
        return {error: 'User not found!'};
    }
    return user;
}

const getUserInRoom = (room) => {
    const allUsers = users.filter((user) => user.room === room);
    if(!allUsers){ return { error: "User not found!" }}
    return allUsers;
}

const getAllUsers = () => {
    return users;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom,
    getAllUsers
};