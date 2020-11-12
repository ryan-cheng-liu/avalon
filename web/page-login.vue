<template>
    <div id="login">
        <div id="loginBox">
            <h1 v-text="$root.TEXT.ONLINE_AVALON" id="title"></h1>
            <input type="text" v-model="name" :placeholder="$root.TEXT.LABEL_LOGIN_NAME" autocomplete="off" id="name" />
            <button @click="login" v-text="$root.TEXT.LOGIN_BUTTON" id="login-button"></button>
        </div>
        <div>
            <p id="bulletin-text">
                嗨，這是一個可以遊玩阿瓦隆遊戲的網站。<br>
                目前是在測試階段，現在的版本是 0.2.1，可能會有一些功能上的缺少以及程式錯誤，敬請見諒！<br>
                <br>
                [更新日誌]<br>
                0.2.1<br>
                修復開始第二次遊戲時，任務燈號未熄滅<br>
                修復刺殺階段壞人未現身<br>
                特別感謝<b>梅粉</b>幫忙測試！<br>
                <br>
                <br>
                和<a target="_blank" href="http://avalon.signage-cloud.org/">友站</a>相較，<br>
                想得到的部分缺少 1. 漂亮的圖片 2. 派票紀錄 3. 斷線重連 4. 機器人 5. 觀戰 6. 教學房 7. 選擇角色 8. 湖中女神<br>
                多出的部分 1. 大廳聊天視窗 2. 可以固定座位<br>
                <br>
                [聯繫方式]<br>
                Discord: <a target="_blank" href="https://discord.gg/UjvJWNc">阿瓦隆遊玩群組</a><br>
                Email: <a target="_blank" href="mailto:ryan.cheng.liu@gmail.com">ryan.cheng.liu@gmail.com</a>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    data: () => { return {
        name: '',
    }},
    methods: {
        login() {
            this.$root.server.login(this.name);
        },
    },
};
</script>

<style scoped>
#login {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-image: url("asset/castle.jpg");
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    filter: contrast(0.75);
}

#loginBox {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 500px;
    height: 300px;
    padding: 20px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 5px black;
    margin: 50px;
}

#title {
    text-align: center;
    margin: -20px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 10px 0;
    background-image: linear-gradient(#ffd49f, #de963e);
    text-shadow: 0 0 3px black;
    color: white;
    user-select: none;
}

#name {
    height: 30px;
    margin: 10px 0;
    padding: 2px 10px;
}

#login-button {
    height: 30px;
    cursor: pointer;
    user-select: none;
}

#bulletin-text {
    background: #ffffff;
    border: 3px solid #ff7000;
    width: 500px;
    padding: 20px;
    border-radius: 10px;
    font-family: monospace;
    font-size: large;
}
</style>