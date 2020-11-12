<template>
    <div class="room" @click="joinRoom">
        <div class="roomName" v-text="name"></div>
    </div>
</template>

<script>
export default {
    props: {
        id: '',
        name: '',
    },
    methods: {
        joinRoom() {
            this.$root.server.joinRoom(this.id);
        },
    }
};
</script>

<style>
.room {
    width: 40%;
    min-height: 70px;
    cursor: pointer;
    background-color: #e8a84a;
    box-shadow: 0 0 10px grey;
    margin: 5px;
    padding: 10px;
    border-radius: 5px;
}

.roomName {
    display: inline-block;
    background-color: white;
    min-width: 100px;
    border-radius: 5px;
    padding: 5px;
    box-shadow: inset 0 0 2px black;
    border: 1px solid #f5a85e;
}
</style>