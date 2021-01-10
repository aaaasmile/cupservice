export default {
    state: {
        deck_type: 'piac',
        me_avatar: 'joe',
        opp_avatar: 'stevie',
        curr_game: 'briscola',
        auto_player_gfx: true,
        briscola_opt: { num_segni: 2, namePl1: 'Luisa', namePl2: 'Mario' },
        dialog: { title: '', msg: '', fncb: null, is_active: false }, //  you can change fields but not the object dialog
    },
    mutations: {
        changeAvatar(state, avatar) {
            state.me_avatar = avatar
        },
        showDialog(state, data) {
            state.dialog.msg = data.msg
            state.dialog.fncb = data.fncb
            state.dialog.title = data.title
            state.dialog.is_active = true
        },
        hideSimpleDialog(state) {
            console.log('Request to close the dialog')
            if (state.dialog.fncb) {
                state.dialog.fncb()
            }
            state.dialog.is_active = false
        }
    }
}