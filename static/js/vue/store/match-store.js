export default {
    state: {
        action1: { enabled: false, title: '' },
        match_state: 'st_undef', // st_waitforstart, st_match_ongoing 
    },
    mutations: {
        changeGameState(state, val) {
            console.log('Changing the game state to', val)
            state.match_state = val
        }
    }
}