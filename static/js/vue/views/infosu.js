export default {
    data() {
        return {
          loading: false,
          value: '',
          num_click: 0,
          selection: 1,
        }
    },
    computed: {
        ...Vuex.mapState({
      
        })
    },
    created() {
    },
    mounted() {
  

    },
    methods: {
      reserve(){
        this.num_click += 1
        console.log('Riserva spazio')
        this.loading = true
        const title1 = `Prenotazione fallita di un pelo` 
        const msg1 = `Spiacenti, al momento non sono disponibili posti prenotabili online per l'orario richiesto. 
        Nel frattempo, se volete fare una breve partita a carte, su questo sito ne avete un piccola possibilità. `
        const title2 = `Ti piace cliccare facile eh!?` 
        const msg2 = `Per la tua tenacia meriteresti un posto al tavolo centrale. Quello dove si sbaritava di più.`
        let curr_title = title1
        let curr_msg = msg1
        if (this.num_click > 5){
          curr_title = title2
          curr_msg = msg2
          this.num_click = 0
        }
        setTimeout(() => {
          this.loading = false
          this.$store.commit('showDialog', {
            title: curr_title,
            msg: curr_msg,
          })
        }, 2500)
      },
      moreinfo(){
        this.num_click = 0
        open("https://invido.it", "_blank")
      }
    },
    template: `
  <v-row justify="center">
    <v-col cols="12" sm="8">
      <v-card :loading="loading" class="mx-auto my-12" max-width="374">
        <template slot="progress">
          <v-progress-linear
            color="deep-purple"
            height="10"
            indeterminate
          ></v-progress-linear>
        </template>

        <v-img
          height="250"
          src="static/assets/images/bar_cooperativa.jpg"
        ></v-img>

        <v-card-title>Il bar della Cuperativa</v-card-title>

        <v-card-text>
          <v-row align="center" class="mx-0">
            <v-rating
              :value="4.5"
              color="amber"
              dense
              half-increments
              readonly
              size="14"
            ></v-rating>

            <div class="grey--text ml-4">4.5 (413)</div>
          </v-row>

          <div class="my-4 subtitle-1">$ • Cuperativa Italian Cafe</div>

          <div>
            Posto tranquillo nell'amabile
            <a href="https://invido.it/bredacisoni/index.html" target="_blank"
              >Breda Cisoni</a
            >, dove viene servito, tra l'altro, un caffè corretto di 
            qualità superiore. Ambiente che offre spazi riservati di calma e relax.
          </div>
        </v-card-text>

        <v-divider class="mx-4"></v-divider>

        <v-card-title>Disponibilità attuale</v-card-title>

        <v-card-text>
          <v-chip-group
            v-model="selection"
            active-class="deep-purple accent-4 white--text"
            column
          >
            <v-chip>5:30PM</v-chip>

            <v-chip>7:30PM</v-chip>

            <v-chip>8:00PM</v-chip>

            <v-chip>9:00PM</v-chip>
          </v-chip-group>
        </v-card-text>

        <v-card-actions>
          <v-btn color="deep-purple lighten-2" text @click="reserve">
            Prenota
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="mx-auto" color="#26c6da" dark max-width="400">
        <v-card-title>
          <v-icon large left> mdi-twitter </v-icon>
          <span class="title font-weight-light">Twitter</span>
        </v-card-title>

        <v-card-text class="headline font-weight-bold">
          "Entra nel locale ed ordina a voce alta, ma ferma. Mentre nessuno ti
          ascolterà, la porta sembrerà quasi socchiusa."
        </v-card-text>

        <v-card-actions>
          <v-list-item class="grow">
            <v-list-item-avatar color="grey darken-3">
              <v-img
                class="elevation-6"
                alt=""
                src="https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light"
              ></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title
                ><a
                  href="https://invido.it/Igor-sarzi-sartori.html"
                  target="_blank"
                  >Boia Canaia</a
                ></v-list-item-title
              >
            </v-list-item-content>

            <v-row align="center" justify="end">
              <v-icon class="mr-1"> mdi-heart </v-icon>
              <span class="subheading mr-2">1024</span>
              <span class="mr-1">·</span>
              <v-icon class="mr-1"> mdi-share-variant </v-icon>
              <span class="subheading">69</span>
            </v-row>
          </v-list-item>
        </v-card-actions>
      </v-card>

      <v-divider class="mx-2 my-3"></v-divider>

      <v-card class="mx-auto my-2" max-width="344">
        <v-card-text>
          <div>Al bancone</div>
          <p class="display-1 text--primary">
            Ancora alla ricerca di maggiorni informazioni su questo sito?
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="deep-purple accent-4" @click="moreinfo">
            Maggiori informazioni
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>`
}