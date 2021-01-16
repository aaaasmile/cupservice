import { GetMusicManagerInstance } from '../../local/app/sound-mgr.js'
import { GetCardLoaderGfx } from '../../local/gfx/card-loader-gfx.js'
import { BuilderGameGfx } from '../../local/gfx/builder-game-gfx.js'

export default {
  data() {
    return {
      loadinggame: false,
      appWidth: 0,
      appHeight: 600,
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
      Action1Enabled: state => {
        return state.ms.action1.enabled
      },
      Action1Title: state => {
        return state.ms.action1.title
      },
      IsWaitForStart: state => {
        return state.ms.match_state === 'st_waitforstart'
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
    let loader = GetCardLoaderGfx()
    if (!this._cache) {
      loader.LoadAssets(this.$store.state.pl.deck_type, (cache) => {
        this._cache = cache
        const mm = GetMusicManagerInstance()
        mm.Load(() => {
          this.loadinggame = false
          this.$store.commit('changeGameState', 'st_waitforstart')
          console.log('Load terminated')
        })
      })
    } else {
      this.loadinggame = false
      this.$store.commit('changeGameState', 'st_waitforstart')
      console.log('Loading finished (cache)')
    }

    // 2. Append canvas element to the body
    document.getElementById('pixi').appendChild(app.view);

  },
  methods: {
    startGame() {
      console.log("start game ", this.SelGame)
      let addTick = true
      if (this._gfxGame) {
        this._app.ticker.stop()
        addTick = false
      }
      this.createGfx(this._cache, this.SelGame)
      if (addTick) {
        this._app.ticker.add(delta => this.gameLoop(delta));  // il ticker sembra vada aggiunto solo una volta
      } else {
        this._app.ticker.start()
      }
    },
    createGfx(cache, game_name) {
      console.log('Create gfx game', game_name)

      this._app.stage.removeChildren()
      const gfx = new BuilderGameGfx(game_name);
      let container = gfx.Build(cache, this._app.renderer)
      this._app.stage.addChild(container)
      this._gfxGame = gfx
    },
    gameLoop(delta) {
      this._gfxGame.Update(delta)
    },
    doAction1() {
      console.log('Action1 is called')
      if (this.$store.state.ms.action1.ask_before) {
        console.log('Ask confirm before continue')
        this.$store.commit('showDialogYesNo', {
          title: this.$store.state.ms.action1.ask_before.title,
          msg: this.$store.state.ms.action1.ask_before.msg,
          fncb: () => {
            console.log('confirmed by user')
            this.$store.commit('callGameActionState', 1)
          }
        })
      } else {
        this.$store.commit('callGameActionState', 1)
      }
    }
  },
  template: `
  <v-row justify="center">
    <v-col xs="12" sm="12" md="10" lg="8" xl="6">
      <v-card :loading="loadinggame" flat tile>
        <template slot="progress">
          <v-progress-linear
            color="blue darken-4"
            height="10"
            indeterminate
          ></v-progress-linear>
        </template>
        <v-card-title class="mx-0"
          >Qui si gioca a: {{ SelGame }}!
        </v-card-title>
        <v-card-text
          ><div class="grey--text" v-show="IsWaitForStart">
            Premi il pulsante "Gioca" per iniziare
          </div></v-card-text
        >
        <v-main>
          <v-container>
            <v-row id="pixi"></v-row>
          </v-container>
        </v-main>
        <v-card-actions>
          <v-btn @click="startGame" v-show="IsWaitForStart"> Gioca </v-btn>
          <v-btn @click="doAction1" v-show="Action1Enabled">
            {{ Action1Title }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
`
}