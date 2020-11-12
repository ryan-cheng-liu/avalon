<template>
    <div id="lobby">
        <div id="player-list">
            <ul>
                <li v-for="(player, index) in $root.room.members" :key="index" v-text="player.name"></li>
            </ul>
        </div>
        <div id="room-panel">    
            <div id="create-room">
                <input type="text" v-model="roomName" :placeholder="$root.TEXT.LABEL_ROOM_NAME" autocomplete="off" id="room-name" />
                <button v-text="$root.TEXT.CREATE_ROOM" @click="createRoom($event, roomName)"></button>
            </div>
            <div id="rooms">
                <room v-for="room in $root.lobby.rooms" :key="room.id" v-bind:id="room.id" v-bind:name="room.name"></room>
            </div>
            <div id="chatroom">
                <chatroom v-bind:messageData="$root.room.messageData"></chatroom>
            </div>
        </div>
    </div>
</template>

<script>
import component_room from './room.vue';
import component_chatroom from './chatroom.vue';

export default {
    components: { room: component_room, chatroom: component_chatroom },
    data: () => { return {
        roomName: '',
    }},
    methods: {
        createRoom(event, roomName) {
            this.$root.server.createAndJoinRoom(roomName);
        },
    },
};
</script>

<style scoped>
#lobby {
    display: flex;
    background-color: #462600;
    box-sizing: content-box;
    padding: 10px;
}

#player-list {
    width: 20%;
    background: white;
    border-radius: var(--lobbyFrameBorderRadius);
    border: 5px solid #bb7119;
    box-sizing: border-box;
    box-shadow: inset 0 0 5px black;
}

#player-list ul {
    list-style: none;
    padding-left: 20px;
}

#room-panel {
    display: inline-flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-left: 10px;
}

#create-room {
    width: 100%;
    background-color: white;
    padding: 10px;
    border-top-left-radius: var(--lobbyFrameBorderRadius);
    border-top-right-radius: var(--lobbyFrameBorderRadius);
    border: 5px solid #bb7119;
    border-bottom: none;
    box-sizing: border-box;
    box-shadow: inset 0 0 5px black;
}

#rooms {
    flex: 1;
    width: 100%;
    background-color: #f3e4ce;
    padding: 10px;
    border: 5px solid #bb7119;
    box-sizing: border-box;
    box-shadow: inset 0 0 5px black;
}

#chatroom {
    width: 100%;
    height: 200px;
    border-bottom-left-radius: var(--lobbyFrameBorderRadius);
    border-bottom-right-radius: var(--lobbyFrameBorderRadius);
    border: 5px solid #bb7119;
    background-color: #f3e4ce;
    box-sizing: border-box;
    box-shadow: inset 0 0 5px black;
}

#chatroom > .chatroom {
    margin: 0;
    border-radius: 0;
}

#chatroom .type-area {
    margin-top: 5px;
}
</style>