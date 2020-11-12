<template>
    <div class="chatroom">
        <div class="message-area">
            <ul class="messages">
                <li v-for="(messageRecord, index) in messageData" v-bind:key="index">
                    <span class="message-name" :class="{'system': messageRecord.player.id === 0}" v-text="messageRecord.player.name"></span>
                    <span v-text="messageRecord.message"></span>
                </li>
            </ul>
        </div>
        <div class="type-area">
            <el-input class="type-area-input" v-model="text" @keyup.enter.native="sendMessage" size="mini">
                <el-button slot="append" v-text="$root.TEXT.SEND" @click="sendMessage"></el-button>
            </el-input>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        messageData: {
            type: Array,
            required: true
        },
    },
    data: () => { return {
        text: '',
    }},
    watch: {
        messageData: {
            handler() {
                // auto scroll to end
                const messageArea = document.querySelector('.message-area');
                messageArea.scrollTop = messageArea.scrollHeight;
            },
            deep: true
        },
    },
    methods: {
        sendMessage() {
            if (this.text === '') return;
            this.$root.server.chat(this.text);
            this.text = '';
        },
    },
};
</script>

<style scoped>
.chatroom {
    display: flex;
    flex-direction: column;
    background: #ffeace;
    margin: 5px;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 2px #9e6623;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}
.message-area {
    flex: 1;
    background: #ffffff;
    box-shadow: inset 0 0 2px #bb7934;
    overflow-y: auto;
}
.messages {
    list-style: none;
    margin: 0;
    padding: 5px;
    overflow-wrap: anywhere;
    height: 0;
}
.messages > li {
    margin: 5px 0;
}

.type-area {
    margin-top: 10px;
}
.type-area-input input {
    padding: 0 10px;
}
.message-name {
    display: inline-block;
    background: #ffd17d;
    border-radius: 5px;
    padding: 0 5px;
}
.system {
    background: #002fd8;
    color: white;
}
</style>