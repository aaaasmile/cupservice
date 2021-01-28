
export default {
  data() {
    return {
      left_url: '',
      right_url: '',
      curr_ix: 0,
      emtpy_url: './static/assets/images/symbols/01_vuoto_trasp.png',
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
    prevCard() {
      console.log('Previous card')
    },
    nextCard() {
      console.log('Next card')
      this.showCards()
    },
    showCards() {
      const deck = this.$store.state.pl.dialogconta.deck_cards_lbl
      let lu = this.emtpy_url
      let ru = this.emtpy_url
      let path_to_img = "./static2/carte/"
      path_to_img += this.$store.state.pl.deck_type + '/'
      if (this.curr_ix < deck.length) {
        const fninfo = this.info_tofilename(deck[this.curr_ix])
        if (fninfo) {
          lu = `${path_to_img}${fninfo.ixname}_${fninfo.suit}.png`
          this.curr_ix++;
          if (this.curr_ix < deck.length) {
            const fninfo_r = this.info_tofilename(deck[this.curr_ix])
            if (fninfo_r) {
              ru = `${path_to_img}${fninfo.ixname}_${fninfo.suit}.png`
            }
          }
        }
      }
      this.left_url = lu
      this.right_url = ru
    },
    info_tofilename(card_lbl) {
      console.log('Provides file info for ', card_lbl)
      const deck_info = this.$store.state.pl.dialogconta.deck_info
      const det = deck_info.get_card_info(card_lbl)
      res = {
        ixname: '',
        suit: '',
      }
      res.ixname = `${det.ix}`
      if (res.ixname.length === 1) {
        res.ixname = '0' + res.ixname
      }
      switch (det.segno) {
        case 'B': res.suit = 'basto'; break;
        case 'C': res.suit = 'coppe'; break;
        case 'D': res.suit = 'denar'; break;
        case 'S': res.suit = 'spade'; break;
        default:
          throw (new Error(`Segno not recognized ${det.segno}`))
      }

      return res
    }
  },
  template: `
  <v-dialog v-model="dialogConta" persistent max-width="300">
    <v-card>
      <v-card-title class="headline">Conta le carte</v-card-title>
      <v-main>
        <v-container>
          <v-row justify="center">
            <v-col>
              <v-img :src=left_url> </v-img>
            </v-col>
            <v-col>
              <v-img :src=right_url>
              </v-img>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
      <v-card-actions>
        <v-btn icon  @click="prevCard">
          <v-icon>mdi-skip-previous</v-icon>
        </v-btn>
        <v-btn icon @click="nextCard">
          <v-icon>mdi-skip-next</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="confirmConta">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
`
}
