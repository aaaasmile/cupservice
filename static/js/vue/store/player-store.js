export default {
    state: {
        deck_type: 'piac',
        me_avatar: 'joe',
        opp_avatar: 'stevie',
        me_name: 'Mario',
        curr_game: 'briscola',
        curr_opt: { num_segni: 2, namePl1: 'Laura' }
    },
    mutations: {
        changeAvatar(state, avatar) {
            state.me_avatar = avatar
        },
    }
}