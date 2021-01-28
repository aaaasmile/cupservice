
export default {
  data() {
    return {
      curr_ix_l: 0,
      curr_ix_r: -1,
      emtpy_url: './static/assets/images/symbols/01_vuoto_trasp.png',
    }
  },
  mounted(){
    this.reset()
  },
  computed: {
    disabled_prv:{
      get(){
        return this.curr_ix_l <= 0;
      }
    },
    disabled_nxt:{
      get(){
        const deck = this.$store.state.pl.dialogconta.deck_cards_lbl
        return this.curr_ix_r >= deck.length - 1;
      }
    },
    right_url: {
      get() {
        const ur = this.$store.state.pl.dialogconta.right_url
        if (ur === '') {
          return this.emtpy_url
        }
        return ur
      },
      set(newVal) {
        this.$store.commit('contarighturi', newVal)
      }
    },
    left_url: {
      get() {
        const lr = this.$store.state.pl.dialogconta.left_url
        if (lr === '') {
          return this.emtpy_url
        }
        return lr
      },
      set(newVal) {
        this.$store.commit('contaleftturi', newVal)
      }
    },
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
      this.reset()
    },
    prevCard() {
      console.log('Previous card')
      const deck = this.$store.state.pl.dialogconta.deck_cards_lbl

      this.curr_ix_l = this.curr_ix_r 
      if (this.curr_ix_r > -1) {
        this.curr_ix_r--;
      }
      this.showCards()
    },
    nextCard() {
      console.log('Next card')
      const deck = this.$store.state.pl.dialogconta.deck_cards_lbl
      this.curr_ix_r = this.curr_ix_l;
      if (this.curr_ix_l < deck.length) {
        this.curr_ix_l++;
      }
      this.showCards()
    },
    showCards() {
      const deck = this.$store.state.pl.dialogconta.deck_cards_lbl
      let lu = this.emtpy_url
      let ru = this.emtpy_url
      let path_to_img = "./static2/carte/"
      path_to_img += this.$store.state.pl.deck_type + '/'
      if (this.curr_ix_l < deck.length && this.curr_ix_l >= 0) {
        const fninfo_l = this.info_tofilename(deck[this.curr_ix_l])
        if (fninfo_l) {
          lu = `${path_to_img}${fninfo_l.ixname}_${fninfo_l.suit}.png`
        }
      }
      if (this.curr_ix_r < deck.length && this.curr_ix_r >= 0) {
        const fninfo_r = this.info_tofilename(deck[this.curr_ix_r])
        if (fninfo_r) {
          ru = `${path_to_img}${fninfo_r.ixname}_${fninfo_r.suit}.png`
        }
      }
      this.left_url = lu
      this.right_url = ru
    },
    info_tofilename(card_lbl) {
      console.log('Provides file info for ', card_lbl)
      const deck_info = this.$store.state.pl.dialogconta.deck_info
      const det = deck_info.get_card_info(card_lbl)
      const res = {
        ixname: '',
        suit: '',
      }
      res.ixname = `${det.pos}`
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
    },
    reset(){
      this.$store.commit('contarighturi', this.emtpy_url)
      this.$store.commit('contaleftturi', this.emtpy_url)
      this.curr_ix_l =  0
      this.curr_ix_r = -1
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
        <v-btn icon :disabled="disabled_prv" @click="prevCard">
          <v-icon>mdi-skip-previous</v-icon>
        </v-btn>
        <v-btn icon :disabled="disabled_nxt"  @click="nextCard">
          <v-icon>mdi-skip-next</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="confirmConta">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
`
}
