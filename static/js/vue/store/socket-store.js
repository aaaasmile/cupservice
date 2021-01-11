export default {
    state: {
        socket_url: '',
    },
    mutations: {
        changeSocketUrl(state, value) {
            state.socket_url = value
        },
    }
}