import API from '../apicaller.js'

export default {
  data() {
    return {
      loadinggame: false,
      selName: 'Mario'
    }
  },
  computed: {
    ...Vuex.mapState({
 
    })
  },
  methods: {
    playGame(){
      console.log("Play game")
    }
  },
  template: `
    <v-row justify="center">
      <v-col xs="12" sm="12" md="10" lg="8" xl="6">
        <v-card color="grey lighten-4" flat tile>
          <v-toolbar flat dense>
            <v-toolbar-title class="subheading grey--text"
              >Giochi</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  @click="playGame"
                  :loading="loadinggame"
                  v-on="on"
                >
                  <v-icon>airplay</v-icon>
                </v-btn>
              </template>
              <span>Play game</span>
            </v-tooltip>
          </v-toolbar>
          <v-col cols="12">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="selName"
                  label="Select a name"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-card flat tile>
                  <v-card-title>Partita a </v-card-title>
                 
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-card>
      </v-col>
    </v-row>
`
}