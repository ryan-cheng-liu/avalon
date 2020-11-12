const io = require('socket.io-client');
const EventEmitter = require('events');
const { ClientProxy, EventEmitterClient } = require('../src/client.js');

const serverUrl = "http://localhost/";

const CHARACTOR = {
    BLANK: 0,
    // team good
    LOYALTY: 1,
    MERLIN: 2,
    PERCIVAL: 3,
    // team evil
    ASSASSIN: 100,
    MORGANA: 101,
    MODRED: 102,
    OBERON: 103,
}

const KNOWN_STATUS = {
    NONE: 200,
    GOOD: 201,
    EVIL: 202,
    MEGLINA: 203,
}

const GAME_STATUS = {
    BLANK: 0,

    GAME_START: 1,
    INITILIZE: 2,

    ROUND_START: 3,
    SELECT_MISSION_MEMBER: 4,
    WAITING_FOR_SELECT_MISSION_MEMBER: 5,
    SELECT_MISSION_MEMBER_DONE: 6,

    VOTE_MISSION_MEMBER: 7,
    WATTING_FOR_VOTE_MISSION_MEMBER: 8,

    MISSION: 9,
    MISSION_DONE: 10,

    ASSASSIN: 11,

    GOOD_WIN: 12,
    EVIL_WIN: 13,
}

const MISSION = {
    BLANK: 0,
    SUCCESS: 1,
    FAIL: 2,
}

function clientModifyLeaf(data, bluePrint) {
    if (typeof data !== 'object' || typeof bluePrint !== 'object') return;
    if (bluePrint === null) return;

    for (let [key, value] of Object.entries(bluePrint)) {
        let isLeaf = false;
        if (key.startsWith('leaf_')) {
            isLeaf = true;
            key = key.substr(5);
        }

        
        if (isLeaf || typeof value !== 'object') {
            if (value === undefined) delete data[key];
            else data[key] = value;
        }
        else if (Array.isArray(value)) {
            if (!Array.isArray(data[key])) data[key] = [];
            for (const k of value.keys()) data[key][k] = bluePrint[key][k];
        }
        else {
            if (typeof data[key] !== 'object') data[key] = {};
            clientModifyLeaf(data[key], value);
        }
    }
}

function waitUntil(evalFunc, checkInterval = 1000) {
    return new Promise(res => {
        let timer = setInterval(() => {
            let result = false;

            try {
                result = evalFunc();
            } catch (ignored) {}

            if (result) {
                clearInterval(timer);
                res();
            }
        }, checkInterval);
    });
}

class Bot extends EventEmitter {
    constructor(name = 'bot') {
        super();

        this.name = name;
        this.socket = null;
        this.model = {};

        this.verbose = true;
    }

    start() {
        this.socket = io(serverUrl);
        this.socket.on('sync', bluePrint => {
            clientModifyLeaf(this.model, bluePrint);
            this.emit('modelchange', bluePrint);
        });
    }

    login(name = 'bot') {
        this.socket.emit('login', name);
        if (this.verbose) console.log(`[log] ${this.name} login`);
        return waitUntil(() => this.model.me.id);
    }

    createAndJoinRoom(name = 'room') {
        this.socket.emit('createAndJoinRoom', name);
        return waitUntil(() => this.model.location === 'room');
    }

    joinRoom(roomId) {
        if (this.verbose) console.log(`[log] ${this.name} joinRoom ${roomId}`);
        this.socket.emit('joinRoom', roomId);
    }

    joinFirstRoom() {
        try {
            let roomId = this.model.lobby.rooms[0].id;
            this.joinRoom(roomId);
        } catch (ignored) { }
    }
    
    leaveRoom() {
        this.socket.emit('leaveRoom');
    }

    startGame() {
        this.socket.emit('startGame');
    }
}

class AvalonBot extends Bot {
    constructor(name = 'bot') {
        super(name);

        this.model = {};
        this.on('modelchange', this.onmodelchange.bind(this));
    }

    selectPlayer(indexes) {
        for (let index of indexes) {
            this.playerSelectPlayer(index);
        }
        this.playerConfirmPlayer();
    }

    playerSelectPlayer(index) {
        this.socket.emit('playerSelectPlayer', index);
    }

    playerDeselectPlayer(index) {
        this.socket.emit('playerDeselectPlayer', index);
    }

    playerConfirmPlayer() {
        this.socket.emit('playerConfirmPlayer');
    }

    playerVoteMissionMember(isAccept) {
        this.socket.emit('playerVoteMissionMember', isAccept);
    }

    playerMission(isSuccess) {
        this.socket.emit('playerMission', isSuccess);
    }

    onmodelchange(bluePrint) {
        if (!bluePrint) return;

        if (bluePrint.game) {
            if (bluePrint.game.status) {
                switch (bluePrint.game.status) {
                    case GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER:
                        if (this.model.selfIndex === bluePrint.game.playerSelector) {
                            this.aiSelectMissionMember();
                        }
                        break;
                    case GAME_STATUS.WATTING_FOR_VOTE_MISSION_MEMBER:
                        this.aiVoteMissionMember();
                        break;
                    case GAME_STATUS.MISSION:
                        this.aiMission();
                        break;
                    case GAME_STATUS.ASSASSIN:
                        this.aiAssassin();
                        break;
                }
            }
        }
    }

    async aiSelectMissionMember() {
        if (this.verbose) console.log(`${this.name} 派票`);

        let selectPlayerCount = this._getSelectPlayerCount(this.model.room.members.length, this.model.game.roundCounter);
        for (let i = 0; i < selectPlayerCount; ++i) {
            this.playerSelectPlayer(i);
        }
        await waitUntil(() => this.model.game.selectedPlayerIndexes.length === selectPlayerCount);
        this.playerConfirmPlayer();
    }

    aiVoteMissionMember() {
        let selfIndex = this.model.room.members.findIndex(player => player.id === this.model.me.id);
        if (this.model.game.turnCounter === 5 || this.model.game.selectedPlayerIndexes.includes(selfIndex)) {
            this.playerVoteMissionMember(true);
        }
        else {
            this.playerVoteMissionMember(false);
        }
    }

    aiMission() {
        this.playerMission(true);
    }

    aiAssassin() {
        this.playerSelectPlayer(0);
        this.playerConfirmPlayer();
    }

    _getSelectPlayerCount(pPlayerCount, pRoundCounter) {
        let playerCount = pPlayerCount || this.playerCount;
        let roundCounter = pRoundCounter || this.roundCounter;

        if (playerCount < 5) return 1;

        return [
            [2, 3, 2, 3, 3],
            [2, 3, 4, 3, 4],
            [3, 3, 3, 4, 4],
            [3, 4, 4, 5, 5],
            [3, 4, 4, 5, 5],
            [3, 4, 4, 5, 5],
        ][playerCount - 5][roundCounter - 1];
    }
}

async function createBotsInRoom(botCount) {
    let bots = [];

    let loginPromises = [];
    for (let i = 0; i < botCount; ++i) {
        let bot = new AvalonBot(`Bot ${i + 1}`);
        bots.push(bot);

        bot.start();
        let p = bot.login(bot.name);
        loginPromises.push(p);
    }
    await Promise.all(loginPromises);

    await bots[0].createAndJoinRoom('[TEST] bot room');

    for (let i = 1; i < botCount; ++i) bots[i].joinFirstRoom();
    return bots;
}

async function main() {
    let bots = await createBotsInRoom(5);
    bots[0].startGame();
}

main();