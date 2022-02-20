function get_game_tilte(nn){
  switch(nn){
    case 'briscola':
      return 'Briscola in due'
    case 'briscolascoperta':
      return 'Briscola Scoperta'
  }
  throw new Error(`game not recognized: ${nn}`)
}

export default {
  state: {
    cache_version: '1.0.0',
    deck_type: 'piac',
    me_avatar: 'joe',
    opp_avatar: 'stevie',
    curr_game: 'briscola',
    curr_game_title: get_game_tilte('briscola'),
    namePl1: 'Luisa',
    namePl2: 'Mario',
    screen_mode: '',
    muted: true,
    auto_player_gfx: false,
    dialog_gfx_no_blocking: false,
    briscola_opt: { num_segni: 2 },
    dialog: { title: '', msg: '', fncb: null, is_active: false }, //  you can change fields but not the object dialog
    dialog_yesno: { title: '', msg: '', fncb: null, is_active: false }, //  you can change fields but not the object dialog
    dialogconta: { deck_cards_lbl: [], fncb: null, is_active: false, deck_info: null, left_url: '', right_url: '', },
    dialogopt: { title: '', opt: {}, fncb: null, is_active: false },
  },
  mutations: {
    initialiseStore(state) {
      
      if (localStorage.getItem('cache_version') !== state.cache_version) {
        localStorage.setItem('cache_version', state.cache_version)
        console.warn('Cache has been changed, please update your options to ', state.cache_version )
        return
      }
        
      if (localStorage.getItem('curr_game')) {
        state.curr_game = localStorage.getItem('curr_game')
      }
      state.curr_game_title = get_game_tilte(state.curr_game)
      if (localStorage.getItem('namePl2')) {
        state.namePl2 = localStorage.getItem('namePl2')
      }
      if (localStorage.getItem('me_avatar')) {
        state.me_avatar = localStorage.getItem('me_avatar')
      }
      if (localStorage.getItem('deck_type')) {
        state.deck_type = localStorage.getItem('deck_type')
      }
      if (localStorage.getItem('screen_mode')) {
        state.screen_mode = localStorage.getItem('screen_mode')
      }
    },
    changeAvatar(state, avatar) {
      state.me_avatar = avatar
    },
    toggleMute(state) {
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
    },
    showContaDialog(state, data) {
      console.log('show dialog conta')
      state.dialogconta.deck_cards_lbl = []
      if (data.deck_cards_lbl) {
        data.deck_cards_lbl.forEach(element => {
          state.dialogconta.deck_cards_lbl.push(element)
        });
      }
      state.dialogconta.fncb = data.fncb
      state.dialogconta.deck_info = data.deck_info
      state.dialogconta.is_active = true
    },
    hideContaDialog(state) {
      console.log('Request to close the conta dialog')
      if (state.dialogconta.fncb) {
        state.dialogconta.fncb()
      }
      state.dialogconta.is_active = false
    },
    contarighturi(state, newval) {
      state.dialogconta.right_url = newval
    },
    contaleftturi(state, newval) {
      state.dialogconta.left_url = newval
    },
    showOptGameDialog(state) {
      console.log('Show option game')
      switch (state.curr_game) {
        case 'briscolascoperta':
        case 'briscola':
          if (state.screen_mode === 'small'){
            state.dialogopt.title = `${state.curr_game_title}`    
          }else{
            state.dialogopt.title = `Opzioni ${state.curr_game_title}`
          }
          
          state.dialogopt.opt = [
            { val: state.briscola_opt.num_segni, caption: 'Numero dei segni', type: 'int' },
          ]
          state.dialogopt.fncb = () => {
            console.log('Assign options')
            const parsed = parseInt(state.dialogopt.opt[0].val, 10)
            if (!isNaN(parsed) && parsed > 0 && parsed < 6) {
              state.briscola_opt.num_segni = parsed
            }
          }
          break;
        default:
          throw (new Error(`option not supported on ${state.curr_game}`))
      }

      state.dialogopt.is_active = true
    },
    hideOptGameDialog(state, ok) {
      console.log('Hide option game')
      if (ok) {
        state.dialogopt.fncb()
      }
      state.dialogopt.is_active = false
    },
    setNewDeckType(state, newVal) {
      console.log('new deck ', newVal)
      state.deck_type = newVal
      localStorage.setItem('deck_type', newVal);
    },
    setAvatarMe(state, newVal) {
      console.log('new avatar me ', newVal)
      state.me_avatar = newVal
      localStorage.setItem('me_avatar', newVal);
    },
    setNameMe(state, newVal) {
      console.log('new name me ', newVal)
      state.namePl2 = newVal
      localStorage.setItem('namePl2', newVal);
    },
    setSelGame(state, newVal) {
      console.log('new game selected ', newVal)
      state.curr_game = newVal
      state.curr_game_title = get_game_tilte(state.curr_game)
      localStorage.setItem('curr_game', newVal);
    },
    setScreenMode(state, newVal){
      console.log('new screen mode ', newVal)
      state.screen_mode = newVal
      localStorage.setItem('screen_mode', newVal);
    }
  }
}