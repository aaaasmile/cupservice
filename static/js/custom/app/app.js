import { GetCardLoaderGfx } from './gfx/card-loader-gfx.js'
import { Tink } from './tink.js'
import { GetMusicManagerInstance } from './sound-mgr.js'
import { DeckGfx } from './gfx/deck-gfx.js'
import { CardsPlayerGfx } from './gfx/cards-player-gfx.js'

// briscola specific imports
import { CoreBriscolaBase } from '../games/brisc-base/core-brisc-base.js'
import { CoreStateManager } from '../common/core/core-state-manager.js'

class MyPixiApp {

  constructor() {
  }

  fullSize() {
    console.log('Try the full size')
    let app = this._app
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
  }

  Run() {
    console.log('Your static app is there!')
    if (!this._app) {
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
    console.log('cache Card loaded')
    myapp._app.stage.removeChildren()
    // cache is istance of CardImageCache
    let img = cache.get_cardimage(0)
    let texture = PIXI.Texture.from(img)
    let sprite = new PIXI.Sprite(texture)

    //let viewWidth = (myapp._app.renderer.width / myapp._app.renderer.resolution);
    let viewHeight = (myapp._app.renderer.height / myapp._app.renderer.resolution);
    img = cache.get_background_img('table')
    texture = PIXI.Texture.from(img)
    let backgound = new PIXI.Sprite(texture)
    //backgound.scale.set(0.5, 0.5);
    let backCont = new PIXI.Container();
    backCont.addChild(backgound)
    //backCont.width = viewWidth
    backCont.scale.y = viewHeight / backgound.height;
    backCont.scale.x = backCont.scale.y
    console.log('Scale back is ', backCont.scale.y, viewHeight, img.height)

    //sprite.anchor.x = 0.5;
    //sprite.anchor.y = 0.5;
    //sprite.position.x = sprite.height + 10
    //sprite.position.y = sprite.height + 10
    //sprite.rotation = - 3.14 / 2.0
    myapp._sprite = sprite
    // let message = new PIXI.Text("Hello Pixi!")
    // message.style = { fill: "white" }

    myapp._app.stage.addChild(backCont)
    myapp._app.stage.addChild(sprite);
    //myapp._app.stage.addChild(message);
    let tink = new Tink(PIXI, myapp._app.renderer.view)
    // let pointer = t.makePointer();
    // pointer.press = () => console.log("The pointer was pressed");
    // pointer.release = () => console.log("The pointer was released");
    //tink.makeDraggable(sprite)
    tink.makeInteractive(sprite); // TODO how to remove from intercative?

    // sprite.press = () => console.log("Sprite was pressed");
    // sprite.release = () => console.log("Sprite was released");

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
    const cdT2 = cache.GetTextureFromCard('_2d', b2core._deck_info)
    const cdT3 = cache.GetTextureFromCard('_3d', b2core._deck_info)
    cardsMeGfx.SetCards([
      { t: cdT1, d: '_Ad' },
      { t: cdT2, d: '_2d' },
      { t: cdT3, d: '_3d' },
    ], cdT1.width + 5)
    cardsMeGfx.OnClick((ev) => {
      console.log('Click rec in handler', ev)
    })
    cardMeContainer.position.set(20, 300)
    myapp._app.stage.addChild(cardMeContainer)

    // test sounds
    //let click = snd.sounds["static/assets/sound/click_4bit.wav"]
    sprite.press = () => {
      myapp._music.Play('played')
      deck.PopCard(2)
    }

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