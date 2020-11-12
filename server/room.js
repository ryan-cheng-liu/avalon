const uuid = require('uuid-random');
const { Client, SYSTEM } = require('./client.js');
const AvalonGame = require('../avalon/main.js');

const LOCATION = {
    LOGIN: 'login',
    LOBBY: 'lobby',
    ROOM: 'room'
};

function shuffle(arr) {
    let i, j, temp;
    for (i = arr.length - 1; i > 0; --i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};

class Room {
    constructor(name, lead = null) {
        this.id = uuid();
        this.name = name;
        this.lead = lead;
        this.members = [];

        this.messageData = [];

        this.game = null;
        this.roomInfo = {
            knownInfo: []
        };
    }

    playerJoin(player) {
        let previousRoom = player.room;
        if (previousRoom) previousRoom.playerLeave(player);

        this.members.push(player);
        this.members.forEach(player => player.room = this);
        player.location = LOCATION.ROOM;

        // gain public room info
        player.emit('sync', { game: this.roomInfo });
    }

    playerLeave(player) {
        let leaveIndex = this.members.findIndex(e => e === player);
        if (leaveIndex !== -1) this.members.splice(leaveIndex, 1);
        
        if (this.lead === player) {
            this.lead = this.members.length > 0 ? this.members[0] : null;
        }

        player.room = null;
        this.members.forEach(player => player.room = this);
    }

    startGame(player) {
        if (player !== this.lead) return;

        this.roomInfo = {};

        this.game = new AvalonGame(this.members.length);

        shuffle(this.members);
        this.members.forEach(player => player.room = this);

        this.game.on('game_update', data => {
            this.members.forEach(player => player.emit('sync', { game: data }));
            Object.assign(this.roomInfo, data);
        });
        this.game.on('game_update_private', (receiverIndex, data) => {
            this.members[receiverIndex].emit('sync', { game: data });
        });
        this.game.on('game_announce', data => {
            this.chat(SYSTEM, data.message);
        });

        this.game.start();
    }

    chat(player, message) {
        this.messageData.push({
            message,
            player: player.serialize(),
            timestamp: Date.now(),
        });
        this.members.forEach(player => player.room = this);
    }

    playerSelectPlayer(player, targetPlayerIndex) {
        this.game.playerSelectPlayer(this.getIndexFromPlayer(player), targetPlayerIndex)
    }

    playerDeselectPlayer(player, targetPlayerIndex) {
        this.game.playerDeselectPlayer(this.getIndexFromPlayer(player), targetPlayerIndex)
    }

    playerConfirmPlayer(player, targetPlayerIndex) {
        this.game.playerConfirmPlayer(this.getIndexFromPlayer(player), targetPlayerIndex)
    }

    playerVoteMissionMember(player, targetPlayerIndex) {
        this.game.playerVoteMissionMember(this.getIndexFromPlayer(player), targetPlayerIndex)
    }

    playerMission(player, targetPlayerIndex) {
        this.game.playerMission(this.getIndexFromPlayer(player), targetPlayerIndex)
    }

    isEmpty() {
        return this.members.length === 0;
    }

    getPlayerFromIndex(index) {
        return this.members[index];
    }

    getIndexFromPlayer(player) {
        return this.members.indexOf(player);
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            lead: this.lead && this.lead.serialize(),
            members: this.members.map(player => player.serialize()),
            messageData: this.messageData,
        }
    }
}

class LobbyRoom extends Room {
    constructor(name, lead) {
        super(name, lead);

        let lobby = this;
        function broadcastRooms() {
            lobby.members.forEach(player => player.rooms = lobby._rooms);
        }

        this._rooms = {};
        this.rooms = new Proxy(this._rooms, {
            get(target, prop) {
                return target[prop];
            },
            set(target, prop, value) {
                target[prop] = value;
                broadcastRooms();
                return true;
            },
            deleteProperty(target, prop) {
                if (!(prop in target)) return true;
                delete target[prop];
                broadcastRooms();
                return true;
            },
        });
    }

    createRoom(name, lead) {
        let room = new Room(name, lead);
        this.rooms[room.id] = room;
        return room;
    }

    playerJoinRoom(player, roomId) {
        let room = this.rooms[roomId];
        if (!room) return;
        room.playerJoin(player);
    }

    playerLeaveRoom(player) {
        this.playerLeaveCurrentRoom(player);
        // join lobby
        this.playerJoin(player);
    }

    playerJoin(player) {
        super.playerJoin(player);
        player.location = LOCATION.LOBBY;
        player.rooms = this.rooms;
    }

    playerLeaveCurrentRoom(player) {
        let room = player.room;
        if (!room) return;
        room.playerLeave(player);
        if (room.isEmpty()) delete this.rooms[room.id];
    }

    playerLogout(player) {
        this.playerLeaveCurrentRoom(player);
    }
}

module.exports = {
    Room,
    LobbyRoom,
}