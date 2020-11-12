
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

    GAME_END: 14,
}

const MISSION = {
    BLANK: 0,
    SUCCESS: 1,
    FAIL: 2,
}

const MAXIMUM_SELECT_MEMBER_TIMES = 5;

const SELECT_PLAYER_COUNT = [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [2, 3, 2, 3, 3],
    [2, 3, 2, 3, 3],
    [2, 3, 4, 3, 4],
    [3, 3, 3, 4, 4],
    [3, 4, 4, 5, 5],
    [3, 4, 4, 5, 5],
    [3, 4, 4, 5, 5],
];

module.exports = {
    CHARACTOR,
    KNOWN_STATUS,
    GAME_STATUS,
    MISSION,
    MAXIMUM_SELECT_MEMBER_TIMES,
    SELECT_PLAYER_COUNT,
};