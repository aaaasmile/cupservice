export default {
  state: {
    action1: { enabled: false, title: '', fncb: null, ask_before: { enabled: false, val: false, msg: '', title: '' } },
    action2: { enabled: false, title: '', fncb: null, ask_before: { enabled: false, val: false, msg: '', title: '' } },
    action3: { enabled: false, title: '', fncb: null, ask_before: { enabled: false, val: false, msg: '', title: '' } },
    action4: { enabled: false, title: '', fncb: null, ask_before: { enabled: false, val: false, msg: '', title: '' } },
    action5: { enabled: false, title: '', fncb: null, ask_before: { enabled: false, val: false, msg: '', title: '' } },
    match_state: 'st_undef', // st_waitforstart, st_match_ongoing 
  },
  mutations: {
    changeGameState(state, val) {
      console.log('Changing the game state to', val)
      state.match_state = val
      state.action1.enabled = (val === 'st_match_ongoing ') && state.action1.enabled
    },
    callGameActionState(state, id) {
      switch (id) {
        case 1:
          if (state.action1.fncb) {
            console.log('Call action 1')
            state.action1.fncb()
          }
          break;
        case 2:
          if (state.action2.fncb) {
            console.log('Call action 2')
            state.action2.fncb()
          }
          break;
        case 3:
          if (state.action3.fncb) {
            console.log('Call action 3')
            state.action3.fncb()
          }
          break;
        case 4:
          if (state.action4.fncb) {
            console.log('Call action 4')
            state.action3.fncb()
          }
          break;
        case 5:
          if (state.action5.fncb) {
            console.log('Call action 5')
            state.action3.fncb()
          }
          break;
        default:
          throw (new Error(`Action not supported for call ${id}`))
      }
    },
    modifyGameActionState(state, data) {
      switch (data.id) {
        case 1:
          state.action1.enabled = data.enabled
          state.action1.title = data.title
          state.action1.fncb = data.fncb
          state.action1.ask_before.val = data.ask.val
          state.action1.ask_before.msg = data.ask.msg
          state.action1.ask_before.title = data.ask.title
          break;
        case 2:
          state.action2.enabled = data.enabled
          state.action2.title = data.title
          state.action2.fncb = data.fncb
          state.action2.ask_before.val = data.ask.val
          state.action2.ask_before.msg = data.ask.msg
          state.action2.ask_before.title = data.ask.title
          break;
        case 3:
          state.action3.enabled = data.enabled
          state.action3.title = data.title
          state.action3.fncb = data.fncb
          state.action3.ask_before.enabled = false
          if (data.ask) {
            state.action3.ask_before.val = data.ask.val
            state.action3.ask_before.msg = data.ask.msg
            state.action3.ask_before.title = data.ask.title
            state.action3.ask_before.enabled = true
          }
          break;
        case 4:
          state.action4.enabled = data.enabled
          state.action4.title = data.title
          state.action4.fncb = data.fncb
          state.action4.ask_before.val = data.ask.val
          state.action4.ask_before.msg = data.ask.msg
          state.action4.ask_before.title = data.ask.title
          break;
        case 5:
          state.action5.enabled = data.enabled
          state.action5.title = data.title
          state.action5.fncb = data.fncb
          state.action5.ask_before.val = data.ask.val
          state.action5.ask_before.msg = data.ask.msg
          state.action5.ask_before.title = data.ask.title
          break;
        default:
          throw (new Error(`Action not supported for modify ${id}`))
      }
    }
  }
}