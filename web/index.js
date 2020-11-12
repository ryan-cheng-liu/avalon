import Vue from 'vue';
import router from './router.js';

import ElementUI from 'element-ui';
import '../node_modules/element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import ServerProxy from './server-proxy.js';
const serverUrl = location.href;

require('./style.css');

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
            if (value === undefined) Vue.delete(data, key);
            else Vue.set(data, key, value);
        }
        else if (Array.isArray(value)) {
            if (!Array.isArray(data[key])) Vue.set(data, key, []);
            for (const k of value.keys()) Vue.set(data[key], k, bluePrint[key][k]);
        }
        else {
            if (typeof data[key] !== 'object') Vue.set(data, key, {});
            clientModifyLeaf(data[key], value);
        }
    }
}

const app = new Vue({
    el: '#app',
    data: {
        server: new ServerProxy(serverUrl),
        me: {},

        lobby: {
            rooms: [],
        },

        room: {
            id: '',
            name: '',
            lead: {},
            members: [],
            messageData: [],
        },

        game: {
            status: 0,

            selfCharactor: 0,
            knownInfo: [],

            roundCounter: 0,
            turnCounter: 0,

            playerSelector: null,
            missionLead: null,
            selectedPlayerIndexes: [],

            missionMemberAccpetStatus: [],

            missionMembers: [],
            missions: [],
        },

        roomSettings: {
            enableFixedSelfSeat: true,
        },

        TEXT: {
            ONLINE_AVALON: '線上阿瓦隆',
            LABEL_LOGIN_NAME: '你的暱稱',
            LOGIN_BUTTON: '登入',
            CREATE_ROOM: '建立房間',
            LABEL_ROOM_NAME: '房間名稱',
            GAME_START: '遊戲開始',
            LEAVE_ROOM: '離開房間',
            FIXED_SEAT: '固定座位',
            REAL_SEAT: '真實座位',
            CONFIRM_MISSION_MEMBER: '確認隊伍成員',
            ACCEPT_MISSION_MEMBER: '白球',
            REFUSE_MISSION_MEMBER: '黑球',
            MISSION_SUCCESS: '任務成功',
            MISSION_FAIL: '任務失敗',
            SEND: '送出',
        },

        roomName: '',
    },
    computed: {
        selfIndex() {
            return this.room.members.findIndex(member => this.me.id === member.id);
        },
        location: {
            get: () => 'avalon',
            set: name => router.push({ path: '/' + name })
        },
    },
    router,
    mounted: function () {
        // debuging
        window.server = this.server;
        
        // init location
        if (!window.location.href.endsWith('login')) this.location = 'login';

        this.server.on('sync', bluePrint => {
            console.log(`Receive bluePrint:`, bluePrint);
            clientModifyLeaf(this, bluePrint);
        });
    }
});