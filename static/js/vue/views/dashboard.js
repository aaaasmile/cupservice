import { GetMusicManagerInstance } from '../../local/app/sound-mgr.js'
import { GetCardLoaderGfx } from '../../local/gfx/card-loader-gfx.js'
import { BuilderGameGfx } from '../../local/gfx/builder-game-gfx.js'
import Conta from '../components/conta.js'
import Options from '../components/optgame.js'

export default {
  components: { Conta, Options },
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
      Action2Enabled: state => {
        return state.ms.action2.enabled
      },
      Action2Title: state => {
        return state.ms.action2.title
      },
      Action3Enabled: state => {
        return state.ms.action3.enabled
      },
      Action3Title: state => {
        return state.ms.action3.title
      },
      Action4Enabled: state => {
        return state.ms.action4.enabled
      },
      Action4Title: state => {
        return state.ms.action4.title
      },
      Action5Enabled: state => {
        return state.ms.action5.enabled
      },
      Action5Title: state => {
        return state.ms.action5.title
      },
      IsWaitForStart: state => {
        return state.ms.match_state === 'st_waitforstart'
      },
      Muted: state => {
        return state.pl.muted
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
      setTimeout(() => {
        if(this.loadinggame){
          this.loadinggame = false
          console.warn('Something is wrong with loading')
        }
      }, 10000)
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
    toggleMute() {
      console.log('Toggle mute')
      this.$store.commit('toggleMute')
    },
    doAction1() {
      console.log('Action1 is called')
      this.doactionNr(
        this.$store.state.ms.action1.ask_before,
        this.$store.state.ms.action2.ask_before.title,
        this.$store.state.ms.action1.ask_before.msg,
        1
      )
    },
    doAction2() {
      console.log('Action2 is called')
      this.doactionNr(
        this.$store.state.ms.action2.ask_before,
        this.$store.state.ms.action2.ask_before.title,
        this.$store.state.ms.action2.ask_before.msg,
        2
      )
    },
    doAction3() {
      console.log('Action3 is called')
      this.doactionNr(
        this.$store.state.ms.action3.ask_before,
        this.$store.state.ms.action3.ask_before.title,
        this.$store.state.ms.action3.ask_before.msg,
        3
      )
    },
    doAction4() {
      console.log('Action4 is called')
      this.doactionNr(
        this.$store.state.ms.action4.ask_before,
        this.$store.state.ms.action4.ask_before.title,
        this.$store.state.ms.action4.ask_before.msg,
        4
      )
    },
    doAction5() {
      console.log('Action5 is called')
      this.doactionNr(
        this.$store.state.ms.action5.ask_before,
        this.$store.state.ms.action5.ask_before.title,
        this.$store.state.ms.action5.ask_before.msg,
        5
      )
    },
    doactionNr(ask_before, actitle, actmsg, actid) {
      if (ask_before && ask_before.enabled) {
        console.log('Ask confirm before continue')
        this.$store.commit('showDialogYesNo', {
          title: actitle,
          msg: actmsg,
          fncb: () => {
            console.log('confirmed by user')
            this.$store.commit('callGameActionState', actid)
          }
        })
      } else {
        this.$store.commit('callGameActionState', actid)
      }
    },
    gameOptions(){
      console.log('Show game options')
      this.$store.commit('showOptGameDialog')
    },
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
          </div>
        </v-card-text>
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
          <v-btn @click="doAction2" v-show="Action2Enabled">
            {{ Action2Title }}
          </v-btn>
          <v-btn @click="doAction3" v-show="Action3Enabled">
            {{ Action3Title }}
          </v-btn>
          <v-btn @click="doAction4" v-show="Action4Enabled">
            {{ Action4Title }}
          </v-btn>
          <v-btn @click="doAction5" v-show="Action5Enabled">
            {{ Action5Title }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-toolbar flat dense>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click="toggleMute">
                  <v-icon>{{ Muted ? "volume_off" : "volume_mute" }}</v-icon>
                </v-btn>
              </template>
              <span>{{ Muted ? "Unmute" : "Mute" }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon @click="gameOptions" v-show="IsWaitForStart">
                  <v-icon>settings</v-icon>
                </v-btn>
              </template>
              <span>Opzioni</span>
            </v-tooltip>
          </v-toolbar>
        </v-card-actions>
      </v-card>
      <Conta></Conta>
      <Options></Options>
    </v-col>
  </v-row>`
}