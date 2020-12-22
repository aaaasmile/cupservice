import API from '../apicaller.js'
import { GetMusicManagerInstance } from '../../local/app/sound-mgr.js'
import { GetCardLoaderGfx } from '../../local/gfx/card-loader-gfx.js'
import { BriscolaGfx } from '../../local/games/brisc-base/briscola-gfx.js'

var introAnim;

export default {
  data() {
    return {
      loadinggame: false,
      selName: 'Mario',
      selGame: 'briscola',
      optGame: {num_segni: 2, namePl1: 'Luisa'},
      is_mobile: false,
      appWidth: 0,
      appHeight: 600,
      _music: null,
      _app: null,
      _gfxGame: null,
      _cache: null,
    }
  },
  created() {
    console.log('Created')
  },
  mounted() {
    console.log('Mounted')
    this.loadinggame = true
    this.appWidth = (document.getElementById('pixi')).offsetWidth
    console.log("Coordinates: ", this.appWidth, this.appHeight)

    // 1. Create a Pixi renderer and define size and a background color
   
    let app = new PIXI.Application({ width: 800, height: 600, antialias: true, transparent: false });
    app.renderer.backgroundColor = 0x061639;
    app.renderer.autoDensity = true;
    this._app = app
    let mm = GetMusicManagerInstance()
    this._music = mm
    mm.Init(() => {
      let loader = GetCardLoaderGfx()
      if (!this._cache) {
        loader.LoadAssets('piac', (cache) => {
          this._cache = cache
          this.loadinggame = false
          console.log('Load terminated')
        })
      }else{
        this.loadinggame = false
      }
    })

    // 2. Append canvas element to the body
    document.getElementById('pixi').appendChild(app.view);
    // Listen for animate update

  },
  computed: {
    ...Vuex.mapState({

    })
  },
  methods: {
    playGame() {
      console.log("Play game ", this.selGame)
      let addTick = true
      if(this._gfxGame){
        this._app.ticker.stop()
        addTick = false
      }
      this.setup(this._cache, this.selGame, this.optGame)
      if (addTick){
        this._app.ticker.add(delta => this.gameLoop(delta)); 
      }else{
        this._app.ticker.start()
      }
    },
    setup(cache, name, opt) {
      opt.namePl2 = this.selName
      console.log('Setup with cache', name, opt)
      this._app.stage.removeChildren()
      let gfx;
      switch (name) {
        case 'briscola':
          gfx = new BriscolaGfx();
          break;
        default:
          throw new Error("Game not supproted: ", name)
      }
      let container = gfx.Build(opt, cache, this._app.renderer)
      this._app.stage.addChild(container)
      this._gfxGame = gfx
    },
    gameLoop(delta) {
      this._gfxGame.Update(delta)
    }
  },
  template: `
  <v-row justify="center">
    <v-col xs="12" sm="12" md="10" lg="8" xl="6">
      <v-card color="grey lighten-4" flat tile>
        <v-toolbar flat dense>
          <v-toolbar-title class="subheading grey--text"></v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="playGame" :loading="loadinggame" v-on="on">
                <v-icon>airplay</v-icon>
              </v-btn>
            </template>
            <span>Play game</span>
          </v-tooltip>
        </v-toolbar>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">
              <v-text-field id="refw"
                v-model="selName"
                label="Select a name"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-card flat tile>
                <v-card-title>Partita a {{ selGame }} </v-card-title>
                <v-content>
                  <v-col cols="12">
                    <v-row align-stretch justify="center" id="pixi"></v-row>
                  </v-col>
                </v-content>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-card>
    </v-col>
  </v-row>
`
}