import API from '../apicaller.js'
import { GetMusicManagerInstance } from '../../local/app/sound-mgr.js'
import { GetCardLoaderGfx } from '../../local/gfx/card-loader-gfx.js'
import { BuilderGfx } from '../../local/games/brisc-base/briscola-gfx.js'

var introAnim;

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
      MeName: state => {
        return state.pl.me_name
      },
      SelGame: state => {
        return state.pl.curr_game
      },
      OptGame: state => {
        return state.pl.curr_opt
      }
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
      this.setup(this._cache, this.SelGame, this.OptGame)
      if (addTick) {
        this._app.ticker.add(delta => this.gameLoop(delta));  // il ticker sembra vada aggiunto solo una volta
      } else {
        this._app.ticker.start()
      }
    },
    setup(cache, name, opt) {
      opt.namePl2 = this.MeName
      console.log('Setup with cache', name, opt)
      this._app.stage.removeChildren()
      let gfx;
      switch (name) {
        case 'briscola':
          gfx = new BuilderGfx();
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
      <v-card flat tile>
        <v-card-title>Partita a {{ SelGame }} </v-card-title>
        <v-content>
          <v-row align-stretch justify="center" id="pixi"></v-row>
        </v-content>
        <v-card-actions>
          <v-btn @click="playGame" :loading="loadinggame">
            Gioca
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
`
}