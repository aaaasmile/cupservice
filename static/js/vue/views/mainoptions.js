export default {
  data() {
    return {
      avatar_path: './static/assets/images/avatar/',
      deck_path: './static2/carte/',
      selgame: 'briscola',
      nomegiocatore: 'Mario',
      avatargiocatore: 'joe'
    }
  },
  computed: {
    tipomazzo: {
      get() {
        return this.$store.state.pl.deck_type
      },
      set(newVal) {
        this.$store.commit('setNewDeckType', newVal)
      }
    },
    sample_carte_url: {
      get() {
        const mazzo = this.$store.state.pl.deck_type
        let url = this.deck_path + mazzo + '/02_basto.png'
        return url
      }
    },
    avatar_gioc_url: {
      get() {
        const avatar = this.$store.state.pl.me_avatar
        let url = this.avatar_path + avatar + '.jpg'
        return url
      }
    },
    ...Vuex.mapState({

    })
  },
  created() {
  },
  mounted() {
  },
  methods: {
    reserve() {
    }
  },
  template: `
  <v-card id="create">
    <v-card-title>Opzioni e preferenze</v-card-title>
    <v-container fluid>
      <v-row class="child-flex">
        <v-col cols="12" sm="6" md="4">
          <v-subheader>Gioco selezionato</v-subheader>
          <v-radio-group v-model="selgame" hide-details>
            <v-radio value="briscola" label="Briscola"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-subheader>Carte</v-subheader>
          <v-radio-group v-model="tipomazzo" hide-details>
            <v-radio value="piac" label="Piacentine"></v-radio>
            <v-radio value="milano" label="Milanesi"></v-radio>
            <v-radio value="napoli" label="Napoletane"></v-radio>
            <v-radio value="bergamo" label="Bergamasche"></v-radio>
            <v-radio value="sicilia" label="Siciliane"></v-radio>
            <v-radio value="treviso" label="Trevigiane"></v-radio>
          </v-radio-group>
          <v-img class="mt-5" style="width: 80px;height=120px;" :src=sample_carte_url> </v-img>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-subheader>Giocatore</v-subheader>
          <v-text-field v-model="nomegiocatore" label="Nome"></v-text-field>
          <v-subheader>Avatar</v-subheader>
          <v-radio-group v-model="avatargiocatore" hide-details>
            <v-radio value="ade" label="Ade"></v-radio>
            <v-radio value="christian" label="Christian"></v-radio>
            <v-radio value="elliot" label="Elliot"></v-radio>
            <v-radio value="jenny" label="Jenny"></v-radio>
            <v-radio value="joe" label="Joe"></v-radio>
            <v-radio value="nan" label="Nan"></v-radio>
            <v-radio value="stevie" label="Stevie"></v-radio>
            <v-radio value="zoe" label="Zoe"></v-radio>
          </v-radio-group>
          <v-img class="mt-5" style="width: 64px;height:64px;" :src=avatar_gioc_url> </v-img>
        </v-col>
      </v-row>
    </v-container>
  </v-card>`
}