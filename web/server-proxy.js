import io from 'socket.io-client';

class ServerProxy {
    constructor(serverUrl) {
        this.socket = io(serverUrl);

        // sync data
        this.on = this.socket.on.bind(this.socket);
        this.once = this.socket.once.bind(this.socket);
        this.emit = this.socket.emit.bind(this.socket);
    }

    sendRequest(...args) {
        this.socket.emit.apply(this.socket, ['api', ...args]);
    }

    login() {
        const api = 'login';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    createAndJoinRoom() {
        const api = 'createAndJoinRoom';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    joinRoom() {
        const api = 'joinRoom';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    leaveRoom() {
        const api = 'leaveRoom';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    startGame() {
        const api = 'startGame';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    chat() {
        const api = 'chat';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    playerSelectPlayer() {
        const api = 'playerSelectPlayer';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    playerDeselectPlayer() {
        const api = 'playerDeselectPlayer';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    playerConfirmPlayer() {
        const api = 'playerConfirmPlayer';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    playerVoteMissionMember() {
        const api = 'playerVoteMissionMember';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }

    playerMission() {
        const api = 'playerMission';
        return this.sendRequest.apply(this, [api, ...arguments]);
    }
}

export default ServerProxy;