export default {
    state: {
      card_type: 'piac',
      me_avatar: 'joe',
      opp_avatar: 'stevie',
    },
    mutations: {
      changeAvatar(state, avatar) {
        state.me_avatar = avatar
      },
    }
  }