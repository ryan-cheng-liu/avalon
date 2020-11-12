const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const EventEmitter = require('events');

const uuid = require('uuid-random');

const { Client, PLUGIN_ROOM, PLUGIN_CHATROOM } = require('./client.js');
const { PLUGIN_AVALON } = require('../avalon/client.js');
const { Room, LobbyRoom } = require('./room.js');

let PORT = 80;
process.argv.forEach((val, index) => {
    if (val.startsWith("--port=")) {
        let port = val.substr(7);
        PORT = +port;
    }
});

// static web
app.use(express.static('dist'));

class Avalon extends EventEmitter {
    constructor() {
        super();
        this.lobby = new LobbyRoom();
    }

    register(client) {
        client.on('api', (apiName, ...args) => {
            if (!apiName || typeof this[apiName] !== 'function') return;
            const apiFunc = this[apiName];
            apiFunc.apply(this, [client, ...args]);
        });
    }
    
    login(client, name) {
        client.name = name;
        this.lobby.playerJoin(client);
    }

    logout(client) {
        if (client.room) this.leaveRoom(client);
    }

    createAndJoinRoom(client, roomName) {
        let room = this.lobby.createRoom(roomName, client);
        this.joinRoom(client, room.id);
    }

    joinRoom(client, roomId) {
        return this.lobby.playerJoinRoom(client, roomId);
    }

    leaveRoom(client) {
        return this.lobby.playerLeaveRoom(client);
    }

    startGame(client) {
        let room = client.room;
        if (room && room.startGame) room.startGame(client);
    }
    
    chat(client) {
        let room = client.room;
        if (room && room.chat) room.chat.apply(room, arguments);
    }

    playerSelectPlayer(client) {
        let room = client.room;
        if (room && room.playerSelectPlayer) room.playerSelectPlayer.apply(room, arguments);
    }

    playerDeselectPlayer(client) {
        let room = client.room;
        if (room && room.playerDeselectPlayer) room.playerDeselectPlayer.apply(room, arguments);
    }

    playerConfirmPlayer(client) {
        let room = client.room;
        if (room && room.playerConfirmPlayer) room.playerConfirmPlayer.apply(room, arguments);
    }

    playerVoteMissionMember(client) {
        let room = client.room;
        if (room && room.playerVoteMissionMember) room.playerVoteMissionMember.apply(room, arguments);
    }

    playerMission(client) {
        let room = client.room;
        if (room && room.playerMission) room.playerMission.apply(room, arguments);
    }

    clientDisconnect(client) {
        let room = client.room;
        if (room) this.lobby.playerLogout.apply(this.lobby, arguments);
    }
}

const avalon = new Avalon();
io.on('connection', socket => {
    const client = new Client();
    client.installPlugin(PLUGIN_ROOM);
    client.installPlugin(PLUGIN_CHATROOM);
    client.installPlugin(PLUGIN_AVALON);
    client.pipeEventEmitter(socket);
    avalon.register(client);
});

server.listen(PORT);