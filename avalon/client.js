class AvalonPlugin {
    constructor() {
        this.apiNames = [
            'playerSelectPlayer',
            'playerDeselectPlayer',
            'playerConfirmPlayer',
            'playerVoteMissionMember',
            'playerMission',
        ];
    }
}

module.exports = {
    PLUGIN_AVALON: new AvalonPlugin(),
}