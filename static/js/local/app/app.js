import { GetCardLoaderGfx } from '../gfx/card-loader-gfx.js'
import { Tink } from './tink.js'
import { GetMusicManagerInstance } from './sound-mgr.js'
import { DeckGfx } from '../gfx/deck-gfx.js'
import { CardsPlayerGfx } from '../gfx/cards-player-gfx.js'
import { StaticSceneGfx } from '../gfx/static-scene-gfx.js'

// briscola specific imports
import { CoreBriscolaBase } from '../games/brisc-base/core-brisc-base.js'
import { CoreStateManager } from '../core/core-state-manager.js'

class MyPixiApp {

  constructor() {
    this._app = null
    this._music = null
    this._cache = null
  }

  Run() {
    console.log('Your static app is there!')
    if (!this._app) {
      console.log('Setup the app')
      let app = new PIXI.Application({ width: 800, height: 600, antialias: true, transparent: false });
      app.renderer.backgroundColor = 0x061639;
      app.renderer.autoDensity = true;
      this._app = app
      let mm = GetMusicManagerInstance()
      this._music = mm
      let that = this
      mm.Init(() => {
        let loader = GetCardLoaderGfx()
        if (!that._cache) {
          loader.LoadAssets('piac', (cache) => {
            that._cache = cache
            that.setup(cache)
            myapp._app.ticker.add(delta => myapp.gameLoop(delta)); // il ticker va aggiunto solo una volta
          })
        }
      })
      document.body.appendChild(app.view);
    } else {
      console.log('PIXI App already initilized')
      this.setup(this._cache)
    }
  }

  setup(cache) {
    console.log('Setup with cache')
    let tink = new Tink(PIXI, myapp._app.renderer.view)
    myapp._app.stage.removeChildren()

    // Test static scene
    const staticSceneGfx = new StaticSceneGfx()
    const backTexture = cache.GetTextureFromBackground('table')
    let viewWidth = (myapp._app.renderer.width / myapp._app.renderer.resolution);
    let viewHeight = (myapp._app.renderer.height / myapp._app.renderer.resolution);
    let scContainer = staticSceneGfx.Build(backTexture, viewWidth, viewHeight)
    myapp._app.stage.addChild(scContainer)
    // end

    // test deck
    let coreStateManager = new CoreStateManager('develop');
    let b2core = new CoreBriscolaBase(coreStateManager, 2, 61);

    let deckGfx = new DeckGfx();
    let deckItemTexture = cache.GetTextureFromSymbol('cope')
    let briscolaTexture = cache.GetTextureFromCard('_5s', b2core._deck_info)
    let deckContainer = deckGfx.Build(40 - 6 - 1, deckItemTexture, briscolaTexture)
    deckContainer.position.set(500, 300)
    myapp._app.stage.addChild(deckContainer)

    // test hand player
    let cardsMeGfx = new CardsPlayerGfx(tink)
    let cardMeContainer = cardsMeGfx.Build(3)
    const cdT1 = cache.GetTextureFromCard('_Ad', b2core._deck_info)
    const cdT2 = cache.GetTextureFromCard('_Ad', b2core._deck_info)
    const cdT3 = cache.GetTextureFromCard('_3d', b2core._deck_info)
    cardsMeGfx.SetCards([cdT1, cdT2, cdT3], cdT1.width + 5)
    cardsMeGfx.OnClick((ev) => {
      console.log('Click rec in handler', ev)
      myapp._music.Play('played')
      deckGfx.PopCard(2)
    })
    cardMeContainer.position.set(20, 300)
    myapp._app.stage.addChild(cardMeContainer)

    myapp._tink = tink
  }

  gameLoop(delta) {
    //this._sprite.x += 1
    this._tink.update();
  }
}

export const myapp = new MyPixiApp();

document.getElementById('run').addEventListener('click', () => {
  console.log('Run click')
  myapp.Run()
  document.getElementById('gamelist').style.visibility = "hidden";
})


// TEST fast, remove this  - start
myapp.Run()  // audio warning here
// TEST fast, remove this - end