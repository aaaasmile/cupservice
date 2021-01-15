export default {
  state: {
    action1: { enabled: false, title: '', fncb: null, ask_before: { val: false, msg: '', title: '' } },
    match_state: 'st_undef', // st_waitforstart, st_match_ongoing 
  },
  mutations: {
    changeGameState(state, val) {
      console.log('Changing the game state to', val)
      state.match_state = val
      state.action1.enabled = (val === 'st_match_ongoing ') && state.action1.enabled
    },
    callGameActionState(state, id) {
      if (id === 1 && state.action1.fncb) {
        console.log('Call action 1')
        state.action1.fncb()
      }
    },
    modifyGameActionState(state, data) {
      if (data.id === 1) {
        state.action1.enabled = data.enabled
        state.action1.title = data.title
        state.action1.fncb = data.fncb
        state.action1.ask_before.val = data.ask.val
        state.action1.ask_before.msg = data.ask.msg
        state.action1.ask_before.title = data.ask.title
      }
    }
  }
}