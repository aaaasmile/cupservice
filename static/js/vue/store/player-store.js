export default {
    state: {
        deck_type: 'piac',
        me_avatar: 'joe',
        opp_avatar: 'stevie',
        curr_game: 'briscola',
        namePl1: 'Luisa',
        namePl2: 'Mario',
        muted: true,
        auto_player_gfx: false,
        dialog_gfx_no_blocking: false,
        briscola_opt: { num_segni: 2 },
        dialog: { title: '', msg: '', fncb: null, is_active: false }, //  you can change fields but not the object dialog
        dialog_yesno: { title: '', msg: '', fncb: null, is_active: false }, //  you can change fields but not the object dialog
    },
    mutations: {
        changeAvatar(state, avatar) {
            state.me_avatar = avatar
        },
        toggleMute(state){
            state.muted = !state.muted
        },
        showDialog(state, data) {
            state.dialog.msg = data.msg
            state.dialog.fncb = data.fncb
            state.dialog.title = data.title
            state.dialog.is_active = true
        },
        showDialogYesNo(state, data) {
            state.dialog_yesno.msg = data.msg
            state.dialog_yesno.fncb = data.fncb
            state.dialog_yesno.title = data.title
            state.dialog_yesno.is_active = true
        },
        hideSimpleDialog(state) {
            console.log('Request to close the dialog')
            if (state.dialog.fncb) {
                state.dialog.fncb()
            }
            state.dialog.is_active = false
        },
        hideYesDialog(state, isyes) {
            console.log('Request to close the yes/no dialog: ', isyes)
            if (isyes) {
                if (state.dialog_yesno.fncb) {
                    state.dialog_yesno.fncb()
                }
            }
            state.dialog_yesno.is_active = false
        }
    }
}