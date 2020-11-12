<template>
    <div id="room">
        <div id="game-area">
            <div id="player-area-left">
                <player v-for="data in displayedPlayerDataLeft"
                    @click.native="playerSelectOrDeselectMissionMember(data.index)" :key="data.player.id"
                    :class="{'missionLead' : $root.game.missionLead === data.index, 'clickable': $root.selfIndex === $root.game.playerSelector && ($root.game.selectedPlayerIndexes.length < selectCount || $root.game.selectedPlayerIndexes.includes(data.index)), 'selected': $root.game.selectedPlayerIndexes.includes(data.index)}"
                    v-bind:index="data.index" v-bind:name="data.player.name" v-bind:charactorInfo="getCharactorInfo($root.game.knownInfo[data.index])" v-bind:missionMemberAccpetStatus="$root.game.missionMemberAccpetStatus[data.index]"></player>
            </div>
            <div id="area-middle">
                <div id="player-area-middle">
                    <player v-for="data in displayedPlayerDataMiddle"
                        @click.native="playerSelectOrDeselectMissionMember(data.index)" :key="data.player.id"
                        :class="{'missionLead' : $root.game.missionLead === data.index, 'clickable': $root.selfIndex === $root.game.playerSelector && ($root.game.selectedPlayerIndexes.length < selectCount || $root.game.selectedPlayerIndexes.includes(data.index)), 'selected': $root.game.selectedPlayerIndexes.includes(data.index)}"
                        v-bind:index="data.index" v-bind:name="data.player.name" v-bind:charactorInfo="getCharactorInfo($root.game.knownInfo[data.index])" v-bind:missionMemberAccpetStatus="$root.game.missionMemberAccpetStatus[data.index]"></player>
                </div>
                <div id="game-panel">
                    <div class="game-panel-left">
                        <mission :missions="$root.game.missions" :selectCountList="selectCountList"></mission>
                        <div id="game-buttons">
                            <el-button type="primary" @click="playerConfirmPlayer" v-if="$root.selfIndex === $root.game.playerSelector && ($root.game.status === CONST.GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER || $root.game.status === CONST.GAME_STATUS.ASSASSIN) && ($root.game.selectedPlayerIndexes.length === selectCount)" v-text="$root.TEXT.CONFIRM_MISSION_MEMBER"></el-button>
                            <el-button type="success" @click="playerVoteMissionMember(true)" v-if="$root.game.status === CONST.GAME_STATUS.WATTING_FOR_VOTE_MISSION_MEMBER" v-text="$root.TEXT.ACCEPT_MISSION_MEMBER"></el-button>
                            <el-button type="danger" @click="playerVoteMissionMember(false)" v-if="$root.game.status === CONST.GAME_STATUS.WATTING_FOR_VOTE_MISSION_MEMBER" v-text="$root.TEXT.REFUSE_MISSION_MEMBER"></el-button>
                            <el-button type="success" @click="playerMission(true)" v-if="$root.game.status === CONST.GAME_STATUS.MISSION && $root.game.missionMembers.includes($root.selfIndex)" v-text="$root.TEXT.MISSION_SUCCESS"></el-button>
                            <el-button type="danger" @click="playerMission(false)" v-if="$root.game.status === CONST.GAME_STATUS.MISSION && $root.game.missionMembers.includes($root.selfIndex)" v-text="$root.TEXT.MISSION_FAIL" :disabled="selfTeamGood"></el-button>
                        </div>
                    </div>
                    <div class="game-panel-right">
                        <chatroom v-bind:messageData="$root.room.messageData"></chatroom>
                    </div>
                </div>
            </div>
            
            <div id="player-area-right">
                <player v-for="data in displayedPlayerDataRight"
                    @click.native="playerSelectOrDeselectMissionMember(data.index)" :key="data.player.id"
                    :class="{'missionLead' : $root.game.missionLead === data.index, 'clickable': $root.selfIndex === $root.game.playerSelector && ($root.game.selectedPlayerIndexes.length < selectCount || $root.game.selectedPlayerIndexes.includes(data.index)), 'selected': $root.game.selectedPlayerIndexes.includes(data.index)}"
                    v-bind:index="data.index" v-bind:name="data.player.name" v-bind:charactorInfo="getCharactorInfo($root.game.knownInfo[data.index])" v-bind:missionMemberAccpetStatus="$root.game.missionMemberAccpetStatus[data.index]"></player>
            </div>
        </div>
        <div id="room-setting-area">
            <div id="room-lead" v-text="'室長: '+ $root.room.lead.name"></div>
            <div id="room-lead-buttons" v-if="$root.room.lead.id === $root.me.id">
                <el-button type="primary" @click="startGame" v-if="!isGameRunning" v-text="$root.TEXT.GAME_START" :disabled="!canStartGame"></el-button>
            </div>
            <div id="room-buttons">
                <el-button type="danger" @click="leaveRoom" v-if="!isGameRunning" v-text="$root.TEXT.LEAVE_ROOM"></el-button>
            </div>
            <div id="room-setting-client">
                <el-switch v-model="$root.roomSettings.enableFixedSelfSeat" :active-text="$root.TEXT.FIXED_SEAT" :inactive-text="$root.TEXT.REAL_SEAT"></el-switch>
            </div>
        </div>
    </div>
</template>

<script>
import component_player from './player.vue';
import component_mission from './mission.vue';
import component_chatroom from './chatroom.vue';

import CONST from '../avalon/const.js';

export default {
    components: { player: component_player, mission: component_mission, chatroom: component_chatroom },
    data: () => { return { CONST }},
    computed: {
        displayedPlayerData() {
            let players = this.$root.room.members;
            let enableFixedSelfSeat = this.$root.roomSettings.enableFixedSelfSeat;
            let selfIndex = this.$root.selfIndex;

            let playerData = players.map((player, index) => { return { player, index }; });
            if (enableFixedSelfSeat) playerData = playerData.slice(selfIndex, playerData.length).concat(playerData.slice(0, selfIndex));

            return playerData;
        },
        displayedPlayerDataLeft() {
            let displayedPlayerData = this.displayedPlayerData;
            let playerCount = displayedPlayerData.length;
            let leftLen = [1, 1, 1, 1, 1, 2, 2, 2, 3, 3][playerCount - 1];
            return displayedPlayerData.slice(0, leftLen);
        },
        displayedPlayerDataMiddle() {
            let displayedPlayerData = this.displayedPlayerData;
            let playerCount = displayedPlayerData.length;
            let leftLen = [1, 1, 1, 1, 1, 2, 2, 2, 3, 3][playerCount - 1];
            let middleLen = [0, 0, 1, 2, 3, 2, 3, 4, 3, 4][playerCount - 1];
            return displayedPlayerData.slice(leftLen, leftLen + middleLen);
        },
        displayedPlayerDataRight() {
            let displayedPlayerData = this.displayedPlayerData;
            let playerCount = displayedPlayerData.length;
            let rightLen = [0, 1, 1, 1, 1, 2, 2, 2, 3, 3][playerCount - 1];
            return displayedPlayerData.slice(playerCount - rightLen, playerCount);
        },
        isGameRunning() {
            return !(this.$root.game.status === this.CONST.GAME_STATUS.BLANK || this.$root.game.status === this.CONST.GAME_STATUS.GAME_END);
        },
        selectCountList() {
            let playerCount = this.displayedPlayerData.length;
            return CONST.SELECT_PLAYER_COUNT[playerCount - 1];
        },
        selectCount() {
            if (this.$root.game.status === this.CONST.GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER) {
                return this.selectCountList[this.$root.game.roundCounter - 1];
            }

            // assassin status
            return 1;
        },
        canStartGame() {
            return this.$root.room.members.length >= 5;
        },
        selfTeamGood() {
            return this.$root.game.selfCharactor === this.CONST.CHARACTOR.LOYALTY || this.$root.game.selfCharactor === this.CONST.CHARACTOR.MERLIN || this.$root.game.selfCharactor === this.CONST.CHARACTOR.PERCIVAL;
        }
    },
    methods: {
        startGame() {
            this.$root.server.startGame();
        },
        leaveRoom() {
            this.$root.server.leaveRoom();
        },
        playerSelectOrDeselectMissionMember(index) {
            if (this.$root.selfIndex !== this.$root.game.playerSelector) return;

            let server = this.$root.server;
            if (!this.$root.game.selectedPlayerIndexes.includes(index)) {
                if (this.$root.game.selectedPlayerIndexes.length < this.selectCount) server.playerSelectPlayer(index);
            }
            else server.playerDeselectPlayer(index);
        },
        playerConfirmPlayer() {
            if (this.$root.selfIndex !== this.$root.game.playerSelector) return;

            let server = this.$root.server;
            server.playerConfirmPlayer();
        },
        playerVoteMissionMember(isAccept) {
            let server = this.$root.server;
            server.playerVoteMissionMember(isAccept);
        },
        playerMission(isSuccess) {
            let server = this.$root.server;
            server.playerMission(isSuccess);
        },
        getCharactorInfo(code) {
            let CHARACTOR = this.CONST.CHARACTOR;
            let KNOWN_STATUS = this.CONST.KNOWN_STATUS;
            
            switch (code) {
                case CONST.CHARACTOR.BLANK: return '';
                // team good
                case CONST.CHARACTOR.LOYALTY: return '亞瑟的忠臣';
                case CONST.CHARACTOR.MERLIN: return '梅林';
                case CONST.CHARACTOR.PERCIVAL: return '派西維爾';
                // team evil
                case CONST.CHARACTOR.ASSASSIN: return '刺客';
                case CONST.CHARACTOR.MORGANA: return '莫甘娜';
                case CONST.CHARACTOR.MODRED: return '莫德雷德';
                case CONST.CHARACTOR.OBERON: return '奧伯倫';

                // known info
                case CONST.KNOWN_STATUS.NONE: return '';
                case CONST.KNOWN_STATUS.GOOD: return '正義陣營';
                case CONST.KNOWN_STATUS.EVIL: return '邪惡陣營';
                case CONST.KNOWN_STATUS.MEGLINA: return '梅林或莫甘娜';

                default: return '';
            }
        },
    },
};
</script>

<style scoped>
#room {
    display: flex;
}

#game-area {
    display: inline-flex;
    width: 1280px;
    height: 100%;
    box-sizing: border-box;
    background: antiquewhite;
    padding: 40px 10px 0 10px;
    border-right: 1px solid white;
}

#player-area-left {
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-around;
    min-width: 150px;
    padding-top: 200px;
}

#player-area-middle {
    display: flex;
    justify-content: space-around;
    min-height: 200px;
}

#player-area-right {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    min-width: 150px;
    padding-top: 200px;
}

#area-middle {
    display: flex;
    flex: 1;
    flex-direction: column;
}

#game-panel {
    flex: 1;
    background: burlywood;
    margin: 10px 10px 0 10px;
    padding: 20px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    box-shadow: 0 0 3px #98814f;
}

#room-setting-area {
    flex: 1;
    background: #ffe6b9;
}

#game-panel {
    display: flex;
}

.game-panel-left {
    flex: 1;
}

.game-panel-right {
    flex: 1;
    display: flex;
}
</style>