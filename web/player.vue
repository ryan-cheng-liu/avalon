<template>
    <div class="player">
        <div class="name text center" v-text="name"></div>
        <div class="portrait"></div>
        <div class="charactor-info text center" v-text="charactorInfo"></div>
        <div class="index" v-text="index + 1"></div>
        <div class="vote" v-if="typeof missionMemberAccpetStatus === 'boolean'" :class="{'vote-yes': missionMemberAccpetStatus}" v-text="missionMemberAccpetStatus ? 'Y' : 'N'"></div>
    </div>
</template>

<script>
export default {
    props: {
        index: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        charactorInfo: {
            type: String
        },
        missionMemberAccpetStatus: {
            type: Boolean
        },
    },
};
</script>

<style scoped>
.player {
    display: inline-flex;
    position: relative;
    flex-direction: column;
    width: var(--playerFrameWidth);
    height: calc(var(--playerFrameWidth) * 1.3);
    margin: 5px;
    background-color: rgb(231, 213, 172);
    box-shadow: 0 0 2px black;
    color: #885000;
    border: 1px solid rgba(134, 72, 0, 1);
    user-select: none;
}

.name {
    height: 20px;
    border-bottom: 1px solid rgba(134, 72, 0, 1);
    background-color: white;
}

.portrait {
    position: relative;
    flex: 1;
    height: var(--playerFrameWidth);
}

.charactor-info {
    border-top: 1px solid rgba(134, 72, 0, 1);
    background-color: white;
    height: 30px;
}

.clickable {
    cursor: pointer;
}

.selected > .portrait::before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    background: transparent;
    border: 8px solid #eca410;
    box-sizing: border-box;
}

.missionLead::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 40px;
    transform: translate(47px, -38px);
    background-image: url('asset/crown.png');
    background-size: contain;
    background-repeat: no-repeat;
}

.index {
    position: absolute;
    background: linear-gradient(#ffc182, #f1b679);
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    font-size: 25px;
    font-family: monospace;
    color: #d46e04;
    border: 1px solid #e4ab69;
    border-radius: 5px;
    box-shadow: 0 0 3px #482f00;
    transform: translate(-10px, -7px);
}

.vote {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: black;
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    font-size: 25px;
    font-family: monospace;
    color: white;
    border: 1px solid #444444;
    border-radius: 15px;
    box-shadow: 0 0 3px #482f00;
    transform: translate(15px, 15px);
}

.vote-yes {
    color: black;
    background-color: white;
}

</style>