const EventEmitter = require('events');

const {
    CHARACTOR,
    KNOWN_STATUS,
    GAME_STATUS,
    MISSION,
    MAXIMUM_SELECT_MEMBER_TIMES,
    SELECT_PLAYER_COUNT,
} = require('./const.js');

class Game extends EventEmitter {
    constructor(playerCount) {
        super();

        this.playerCount = playerCount;
        this._gameStatus = GAME_STATUS.BLANK;

        this._charactors = [];
        this._knownInformation = [];

        this._missionResult = [];

        this._roundCounter = 0;
        this._turnCounter = 0;
        this.selectCount = 0;
        this._missionLeadIndex = null;
        this._selectedPlayerIndexes = new Set();
        this._missionMemberAccpetStatus = [];

        this._doMissionMemberIndexes = new Set();
        this._missionFailedCount = 0;
    }

    get missionLeadIndex() {
        return this._missionLeadIndex;
    }

    set missionLeadIndex(value) {
        this._missionLeadIndex = value;
        this.emit('game_update', { missionLead: value });
    }

    get roundCounter() {
        return this._roundCounter;
    }

    set roundCounter(value) {
        this._roundCounter = value;
        this.emit('game_update', { roundCounter: value });
    }

    get turnCounter() {
        return this._turnCounter;
    }

    set turnCounter(value) {
        this._turnCounter = value;
        this.emit('game_update', { turnCounter: value });
    }

    start() {
        if (this.playerCount >= 5) {
            this._gameStatus = GAME_STATUS.GAME_START;
            this._nextStage();
        }
    }

    _nextStage() {
        this.emit('game_update', { status: this._gameStatus });

        switch (this._gameStatus) {
            case GAME_STATUS.GAME_START:
                this._gameStatus = GAME_STATUS.INITILIZE;
                this._nextStage();
                break;
            case GAME_STATUS.INITILIZE:
                this._initialize();
                this._gameStatus = GAME_STATUS.ROUND_START;
                this._nextStage();
                break;
            case GAME_STATUS.ROUND_START:
                this.selectCount = this.getSelectPlayerCount();
                ++this.roundCounter;
                this.turnCounter = 0;

                this.emit('game_announce', { message: `第 ${this.roundCounter} 輪開始` });

                this._gameStatus = GAME_STATUS.SELECT_MISSION_MEMBER;
                this._nextStage();
                break;
            case GAME_STATUS.SELECT_MISSION_MEMBER:
                ++this.turnCounter;
                if (this.turnCounter > MAXIMUM_SELECT_MEMBER_TIMES) {
                    this._gameStatus = GAME_STATUS.EVIL_WIN;
                    this.emit('game_announce', { message: `亞瑟王的忠臣們猶豫不決，莫德雷德的爪牙們取得先機` });
                }
                else {
                    this._gameStatus = GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER;
                    this.emit('game_announce', { message: `回合 ${this.roundCounter}-${this.turnCounter}，隊長 ${this.missionLeadIndex + 1} 家請派票` });
                }
                this._nextStage();
                break;
            case GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER:
                this.clearSelectedPlayer();
                this.emit('game_update', { playerSelector: this.missionLeadIndex });
                break;
            case GAME_STATUS.SELECT_MISSION_MEMBER_DONE:
                this._gameStatus = GAME_STATUS.WATTING_FOR_VOTE_MISSION_MEMBER;
                this._nextStage();
                break;
            case GAME_STATUS.WATTING_FOR_VOTE_MISSION_MEMBER:
                this._missionMemberAccpetStatus = [];                
                this.missionMemberVoteCount = 0;
                break;
            case GAME_STATUS.MISSION:
                this._doMissionMemberIndexes = new Set();
                this._missionFailedCount = 0;
                let selectedPlayer = this.getSelectedPlayer();
                this.emit('game_announce', { message: `${selectedPlayer.map(i => i + 1)} 家正祕密的進行任務` });
                this.emit('game_update', { missionMembers: selectedPlayer });
                break;
            case GAME_STATUS.MISSION_DONE:
                if (this._isMissionSuccess()) {
                    this.addMissionResult(MISSION.SUCCESS);
                    this.emit('game_announce', { message: `任務成功${this._missionFailedCount > 0 ? ', ' + this._missionFailedCount + ' 張失敗' : ''}` });
                }
                else {
                    this.addMissionResult(MISSION.FAIL);
                    this.emit('game_announce', { message: `任務失敗, ${this._missionFailedCount} 張失敗` });
                }

                let successCount = this._missionResult.reduce((totalSuccess, currentStatus) => currentStatus === MISSION.SUCCESS ? totalSuccess + 1 : totalSuccess, 0);
                let failCount = this._missionResult.reduce((totalFail, currentStatus) => currentStatus === MISSION.FAIL ? totalFail + 1 : totalFail, 0);

                if (successCount >= 3) {
                    this._gameStatus = GAME_STATUS.ASSASSIN;
                    this.emit('game_announce', { message: `正義方獲得三次任務成功，刺客請選擇刺殺目標` });
                }
                else if (failCount >= 3) {
                    this._gameStatus = GAME_STATUS.EVIL_WIN;
                    this.emit('game_announce', { message: `邪惡方破壞三次任務` });
                }
                else {
                    this._gameStatus = GAME_STATUS.ROUND_START;
                    this._nextMissionLead();
                }

                this._nextStage();
                break;
            case GAME_STATUS.ASSASSIN:
                this.missionLeadIndex = null;
                this.clearSelectedPlayer();
                this.selectCount = 1;

                this.showCharactor(CHARACTOR.ASSASSIN);
                this.showCharactor(CHARACTOR.MORGANA);
                this.showCharactor(CHARACTOR.MODRED);
                this.showCharactor(CHARACTOR.OBERON);

                let assassinIndex = this._charactors.findIndex(c => c === CHARACTOR.ASSASSIN);
                this.emit('game_update', { playerSelector: assassinIndex });
                break;
            case GAME_STATUS.GOOD_WIN:
                this.emit('game_announce', { message: '正義方獲勝' });
                this._gameStatus = GAME_STATUS.GAME_END;
                this._nextStage();
                break;
            case GAME_STATUS.EVIL_WIN:
                this.emit('game_announce', { message: '邪惡方獲勝' });
                this._gameStatus = GAME_STATUS.GAME_END;
                this._nextStage();
                break;
            case GAME_STATUS.GAME_END:
                this.missionLeadIndex = null;
                this.clearSelectedPlayer();
                this.emit('game_update', { playerSelector: -1 });

                this.showAllCharactor();
                break;
        }
    }

    _initialize() {
        this._charactors = this._getCharactors();

        this.roundCounter = 0;
        this.turnCounter = 0;
        this.missionLeadIndex = 0;

        this.clearMissionResult();

        for (let i = 0; i < this.playerCount; ++i) {
            let knownInfo = [];
            let charactor = this._charactors[i];
            
            switch (charactor) {
                case CHARACTOR.MERLIN:
                    this._charactors.forEach((charactor, index) => {
                        if (i === index) {
                            knownInfo.push(CHARACTOR.MERLIN);
                        }
                        else if (charactor === CHARACTOR.ASSASSIN
                            || charactor === CHARACTOR.MORGANA
                            || charactor === CHARACTOR.OBERON) {
                            knownInfo.push(KNOWN_STATUS.EVIL);
                        }
                        else {
                            knownInfo.push(KNOWN_STATUS.NONE);
                        }
                    });
                    break;
                case CHARACTOR.PERCIVAL:
                    this._charactors.forEach((charactor, index) => {
                        if (i === index) {
                            knownInfo.push(CHARACTOR.PERCIVAL);
                        }
                        else if (charactor === CHARACTOR.MERLIN
                            || charactor === CHARACTOR.MORGANA) {
                                knownInfo.push(KNOWN_STATUS.MEGLINA);
                        }
                        else {
                            knownInfo.push(KNOWN_STATUS.NONE);
                        }
                    });
                    break;                
                case CHARACTOR.ASSASSIN:
                    this._charactors.forEach((charactor, index) => {
                        if (i === index) {
                            knownInfo.push(CHARACTOR.ASSASSIN);
                        }
                        else if (charactor === CHARACTOR.MORGANA
                            || charactor === CHARACTOR.MODRED) {
                                knownInfo.push(KNOWN_STATUS.EVIL);
                        }
                        else {
                            knownInfo.push(KNOWN_STATUS.NONE);
                        }
                    });
                    break;
                case CHARACTOR.MORGANA:
                    this._charactors.forEach((charactor, index) => {
                        if (i === index) {
                            knownInfo.push(CHARACTOR.MORGANA);
                        }
                        else if (charactor === CHARACTOR.ASSASSIN
                            || charactor === CHARACTOR.MODRED) {
                                knownInfo.push(KNOWN_STATUS.EVIL);
                        }
                        else {
                            knownInfo.push(KNOWN_STATUS.NONE);
                        }
                    });
                    break;
                case CHARACTOR.MODRED:
                    this._charactors.forEach((charactor, index) => {
                        if (i === index) {
                            knownInfo.push(CHARACTOR.MODRED);
                        }
                        else if (charactor === CHARACTOR.ASSASSIN
                            || charactor === CHARACTOR.MORGANA) {
                                knownInfo.push(KNOWN_STATUS.EVIL);
                        }
                        else {
                            knownInfo.push(KNOWN_STATUS.NONE);
                        }
                    });
                    break;
                case CHARACTOR.OBERON:
                    this._charactors.forEach((charactor, index) => {
                        if (i === index) {
                            knownInfo.push(CHARACTOR.OBERON);
                        }
                        else {
                            knownInfo.push(KNOWN_STATUS.NONE);
                        }
                    });
                    break;
                case CHARACTOR.LOYALTY:
                    this._charactors.forEach((charactor, index) => {
                        if (i === index) {
                            knownInfo.push(CHARACTOR.LOYALTY);
                        }
                        else {
                            knownInfo.push(KNOWN_STATUS.NONE);
                        }
                    });
                    break;
            }

            this._knownInformation.push(knownInfo);
            this.emit('game_update_private', i, { selfCharactor: this._charactors[i] });
            this.emit('game_update_private', i, { knownInfo: knownInfo });
        }
    }

    playerSelectPlayer(playerIndex, targetPlayerIndex) {
        let assassinIndex = this._charactors.findIndex(c => c === CHARACTOR.ASSASSIN);
        // WAITING_FOR_SELECT_MISSION_MEMBER
        if (!((this._gameStatus === GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER && this._isMissionSelectAvaliable(playerIndex))
        // ASSASSIN
            || (this._gameStatus === GAME_STATUS.ASSASSIN && playerIndex === assassinIndex))) return;

        this.addSelectedPlayer(targetPlayerIndex)
    }

    playerDeselectPlayer(playerIndex, targetPlayerIndex) {
        let assassinIndex = this._charactors.findIndex(c => c === CHARACTOR.ASSASSIN);
        // WAITING_FOR_SELECT_MISSION_MEMBER
        if (!((this._gameStatus === GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER && this._isMissionSelectAvaliable(playerIndex))
        // ASSASSIN
            || (this._gameStatus === GAME_STATUS.ASSASSIN && playerIndex === assassinIndex))) return;

        this.removeSelectedPlayer(targetPlayerIndex);
    }

    playerConfirmPlayer(playerIndex) {
        // valid check
        if (this.getSelectedPlayerSize() !== this.selectCount) return;

        // WAITING_FOR_SELECT_MISSION_MEMBER
        if (this._gameStatus === GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER && this._isMissionSelectAvaliable(playerIndex)) {
            this._gameStatus = GAME_STATUS.SELECT_MISSION_MEMBER_DONE;
            this._nextStage();
            return;
        }
        // ASSASSIN
        let assassinIndex = this._charactors.findIndex(c => c === CHARACTOR.ASSASSIN);
        if (this._gameStatus === GAME_STATUS.ASSASSIN && playerIndex === assassinIndex) {
            let selectedIndex = this.getSelectedPlayer()[0];
            let merlinIndex = this._charactors.findIndex(c => c === CHARACTOR.MERLIN);

            if (merlinIndex === selectedIndex) {
                this._gameStatus = GAME_STATUS.EVIL_WIN;
                this.emit('game_announce', { message: `刺殺成功！` });
            }
            else {
                this._gameStatus = GAME_STATUS.GOOD_WIN;
                this.emit('game_announce', { message: `刺殺失敗。` });
            }
            this._nextStage();
        }
    }

    playerVoteMissionMember(playerIndex, isAccept) {
        if (this._gameStatus !== GAME_STATUS.WATTING_FOR_VOTE_MISSION_MEMBER) return;
        if (this._missionMemberAccpetStatus[playerIndex] !== undefined) return;
        this._missionMemberAccpetStatus[playerIndex] = isAccept;

        this.emit('game_announce', { message: `${playerIndex + 1} 家投票` });
        ++this.missionMemberVoteCount;
        if (this.missionMemberVoteCount >= this.playerCount) {
            let accpetCount = this._missionMemberAccpetStatus.reduce((allAccept, nowAccept) => nowAccept ? allAccept + 1 : allAccept, 0);

            this.emit('game_update', { missionMemberAccpetStatus: this._missionMemberAccpetStatus });

            let acceptDisplayIndexes = [];
            this._missionMemberAccpetStatus.forEach((isAccept, index) => { if (isAccept) acceptDisplayIndexes.push(index + 1); });
            let missionMemberDisplayIndexes = this.getSelectedPlayer().map(i => i + 1);

            // is accept count large than half of player count?
            if (accpetCount > Math.floor(this.playerCount / 2)) {
                this._gameStatus = GAME_STATUS.MISSION;
                this.emit('game_announce', { message: `任務人選通過！${acceptDisplayIndexes} 同意 ${missionMemberDisplayIndexes} 出任務` });
            }
            else {
                this._gameStatus = GAME_STATUS.SELECT_MISSION_MEMBER;
                this._nextMissionLead();
                this.emit('game_announce', { message: `任務人選否決。${acceptDisplayIndexes} 同意 ${missionMemberDisplayIndexes} 出任務` });
            }

            this._nextStage();
        }
    }

    playerMission(playerIndex, isSuccess) {
        if (this._doMissionMemberIndexes.has(playerIndex)) return;
        if (!this._selectedPlayerIndexes.has(playerIndex)) return;

        // team good should not do a fail mission
        if (this._charactors[playerIndex] < 100 && !isSuccess) return;

        this._doMissionMemberIndexes.add(playerIndex);
        if (!isSuccess) ++this._missionFailedCount;

        if (this._doMissionMemberIndexes.size === this._selectedPlayerIndexes.size) {
            this._gameStatus = GAME_STATUS.MISSION_DONE;
            this._nextStage();
        }
    }

    getSelectedPlayerSize() {
        return this._selectedPlayerIndexes.size;
    }

    getSelectedPlayer() {
        return Array.from(this._selectedPlayerIndexes).sort((a, b) => a > b);
    }

    addSelectedPlayer(index) {
        this._selectedPlayerIndexes.add(index);
        this.emit('game_update', { leaf_selectedPlayerIndexes: this.getSelectedPlayer() });
    }

    removeSelectedPlayer(index) {
        this._selectedPlayerIndexes.delete(index);
        this.emit('game_update', { leaf_selectedPlayerIndexes: this.getSelectedPlayer() });
    }

    clearSelectedPlayer() {
        this._selectedPlayerIndexes.clear();
        this.emit('game_update', { leaf_selectedPlayerIndexes: [] });
    }

    addMissionResult(result) {
        this._missionResult.push(result);
        this.emit('game_update', { leaf_missions: this._missionResult });
    }

    clearMissionResult() {
        this._missionResult = [];
        this.emit('game_update', { leaf_missions: this._missionResult });
    }

    showCharactor(charactor) {
        for (let i = 0; i < this.playerCount; ++i) {
            if (this._charactors[i] === charactor) {
                this._knownInformation.forEach((knownInfo, index) => {
                    knownInfo[i] = charactor;
                    this.emit('game_update_private', index, { knownInfo });
                });
            }
        }
    }

    showAllCharactor() {
        for (let i = 0; i < this.playerCount; ++i) {
            this._knownInformation.forEach(knownInfo => knownInfo = this._charactors);
            this.emit('game_update', { knownInfo: this._charactors });
        }        
    }

    _isEvil(charactor) {
        return charactor >= 100;
    }

    _isMissionSelectAvaliable(playerIndex) {
        // check game status
        return this._gameStatus === GAME_STATUS.WAITING_FOR_SELECT_MISSION_MEMBER
        // check mission lead
            && this.missionLeadIndex === playerIndex;
    }

    _nextMissionLead() {
        ++this.missionLeadIndex;
        if (this.missionLeadIndex >= this.playerCount) this.missionLeadIndex = 0;
    }

    _isMissionSuccess() {
        return this._missionFailedCount === 0 || this.playerCount >= 7 && this.roundCounter === 4 && this._missionFailedCount < 2;
    }

    _getGameStatusName(gameStatusCode) {
        for (let [key, value] of Object.entries(GAME_STATUS)) {
            if (gameStatusCode === value) return key;
        }
    }

    getSelectPlayerCount(pPlayerCount, pRoundCounter) {
        let playerCount = pPlayerCount || this.playerCount;
        let roundCounter = pRoundCounter || this.roundCounter;
        return SELECT_PLAYER_COUNT[playerCount - 1][roundCounter];
    }

    _getCharactors() {
        let charactors = [];

        // team good
        charactors.push(CHARACTOR.MERLIN);
        charactors.push(CHARACTOR.PERCIVAL);

        // team evil
        charactors.push(CHARACTOR.ASSASSIN);
        charactors.push(CHARACTOR.MORGANA);

        if (this.playerCount >= 7) {
            charactors.push(CHARACTOR.MODRED);
        }

        if (this.playerCount >= 10) {
            charactors.push(CHARACTOR.OBERON);
        }

        // fill with loyalty
        while (charactors.length < this.playerCount) {
            charactors.push(CHARACTOR.LOYALTY);
        }

        this._shuffle(charactors);

        return charactors;
    }
    
    _shuffle(arr) {
        let i, j, temp;
        for (i = arr.length - 1; i > 0; --i) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    };
}

module.exports = Game;