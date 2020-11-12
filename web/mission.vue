<template>
    <div class="mission">
        <div class="status" v-for="index in 5" :key="index" v-text="selectCountList[index - 1]" :class="{'success' : missions[index - 1] == 1, 'fail' : missions[index - 1] == 2}"></div>
    </div>
</template>

<script>
export default {
    props: {
        missions: {
            type: Array,
            required: true
        },
        selectCountList: {
            type: Array,
            required: true
        },
    }
};
</script>

<style>
:root {
    --missionResultRadius: 20px;
}
</style>

<style scoped>
.mission {
    display: inline-flex;
    background-color: blanchedalmond;
    border-radius: 5px;
    box-shadow: 0 0 2px #907130;
}
.mission .status {
    display: flex;
    height: calc(var(--missionResultRadius) * 2);
    width: calc(var(--missionResultRadius) * 2);
    border-radius: var(--missionResultRadius);
    margin: 5px;
    background-color: white;
    box-shadow: inset 0 0 1px grey;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    color: lightgray;
    font-weight: bold;
    font-family: monospace;
    user-select: none;
}

.mission .status.success {
    color: white;
    background-image: linear-gradient(#6fa2ff, #598ae4);
    box-shadow: 0 0 2px #000c8a;
}
.mission .status.fail {
    color: white;
    background-image: linear-gradient(#ff6f6f, #e45959);
    box-shadow: 0 0 2px #000c8a;
}
</style>