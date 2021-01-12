export default {
    data() {
        return {
          loading: false,
          value: '',
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
        console.log('Riserva spazio')
        this.loading = true
        setTimeout(() => (this.loading = false), 2000)
      }
    },
    template: `
  <v-card
    :loading="loading"
    class="mx-auto my-12"
    max-width="374"
  >
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
      <v-row
        align="center"
        class="mx-0"
      >
        <v-rating
          :value="4.5"
          color="amber"
          dense
          half-increments
          readonly
          size="14"
        ></v-rating>

        <div class="grey--text ml-4">
          4.5 (413)
        </div>
      </v-row>

      <div class="my-4 subtitle-1">
        $ • Cuperativa Italian Cafe
      </div>

      <div>Posto trnaquillo nell'amabile Breda Cisoni, dove viene servito, tra l'altro, un caffè corretto di alta qualità. 
          Ambiente che offre spazi riservati di calma e relax.</div>
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
      <v-btn
        color="deep-purple lighten-2"
        text
        @click="reserve"
      >
        Prenota
      </v-btn>
    </v-card-actions>
  </v-card>`
}