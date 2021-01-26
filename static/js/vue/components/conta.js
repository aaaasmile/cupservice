
export default {
  data() {
    return {
    }
  },
  computed: {
    dialogConta: {
      get() {
        return this.$store.state.pl.dialogconta.is_active
      },
      set(newval) {
        if (!newval) {
          this.$store.commit('hideContaDialog')
        }
      }
    },
    ...Vuex.mapState({

    })
  },
  methods: {
    confirmConta() {
      console.log('Confirm the conta dialog')
      this.$store.commit('hideContaDialog')
    },
  },
  template: `
  <v-dialog v-model="dialogConta" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Conta le carte</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="confirmConta"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
`
}
