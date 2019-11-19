import { GetCardLoaderGfx } from '../gfx/card-loader-gfx.js'
import { GetMusicManagerInstance } from './sound-mgr.js'
import { BriscolaGfx } from '../games/brisc-base/briscola-gfx.js'


class MyPixiApp {

  constructor() {
    this._app = null
    this._music = null
    this._cache = null
  }

  Run(name, opt) {
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
            that.setup(cache, name, opt)
            myapp._app.ticker.add(delta => myapp.gameLoop(delta)); // il ticker va aggiunto solo una volta
          })
        }
      })
      document.body.appendChild(app.view);
    } else {
      console.log('PIXI App already initilized')
      this.setup(this._cache, name, opt)
    }
  }

  setup(cache, name, opt) {
    console.log('Setup with cache', name, opt)
    myapp._app.stage.removeChildren()

    let gfx;
    switch (name) {
      case 'briscola':
        gfx = new BriscolaGfx();
        break;
      default:
        throw new Error("Game not supproted: ", name)
    }
    let container = gfx.Build(opt, cache, myapp._app.renderer)
    myapp._app.stage.addChild(container)
    this._gfxGame = gfx
  }

  gameLoop(delta) {
    this._gfxGame.Update(delta)
  }
}

export const myapp = new MyPixiApp();

document.getElementById('run').addEventListener('click', () => {
  console.log('Run click')
  myapp.Run()
  document.getElementById('gamelist').style.visibility = "hidden";
})


// TEST fast, remove this  - start
const opt = { num_segni: 2 }
myapp.Run('briscola', opt)
// TEST fast, remove this - end