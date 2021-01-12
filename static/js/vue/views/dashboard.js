import API from '../apicaller.js'
import { GetMusicManagerInstance } from '../../local/app/sound-mgr.js'
import { GetCardLoaderGfx } from '../../local/gfx/card-loader-gfx.js'
import { BuilderGameGfx } from '../../local/gfx/builder-game-gfx.js'

export default {
  data() {
    return {
      loadinggame: false,
      is_mobile: false,
      appWidth: 0,
      appHeight: 600,
      _music: null,
      _app: null,
      _gfxGame: null,
      _cache: null,
    }
  },
  computed: {
    ...Vuex.mapState({
      SelGame: state => {
        return state.pl.curr_game
      },
    })
  },
  created() {
    console.log('Created')
  },
  mounted() {
    console.log('Mounted')
    this.loadinggame = true
    this.appWidth = (document.getElementById('pixi')).offsetWidth
    console.log("Coordinates: ", this.appWidth, this.appHeight)
    PIXI.utils.skipHello()

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
        loader.LoadAssets(this.$store.state.pl.deck_type, (cache) => {
          this._cache = cache
          this.loadinggame = false
          console.log('Load terminated')
        })
      } else {
        this.loadinggame = false
      }
    })

    // 2. Append canvas element to the body
    document.getElementById('pixi').appendChild(app.view);

  },
  methods: {
    playGame() {
      console.log("Play game ", this.SelGame)
      let addTick = true
      if (this._gfxGame) {
        this._app.ticker.stop()
        addTick = false
      }
      this.setup(this._cache, this.SelGame)
      if (addTick) {
        this._app.ticker.add(delta => this.gameLoop(delta));  // il ticker sembra vada aggiunto solo una volta
      } else {
        this._app.ticker.start()
      }
    },
    setup(cache, game_name) {
      console.log('Setup with cache', game_name)
      this._app.stage.removeChildren()
      const gfx = new BuilderGameGfx(game_name);
      let container = gfx.Build(cache, this._app.renderer)
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
      <v-card flat tile>
        <v-card-title>Partita a {{ SelGame }} </v-card-title>
        <v-main>
          <v-container>
            <v-row id="pixi"></v-row>
          </v-container>
        </v-main>
        <v-card-actions>
          <v-btn @click="playGame" :loading="loadinggame"> Gioca </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
`
}