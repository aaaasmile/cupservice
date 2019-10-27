import { GetCardLoaderGfx } from '../common/gfx/card-loader_gfx.js'
import { LoadAssets } from '../common/gfx/static-scene-gfx.js'
import { Tink } from './tink.js'
import { GetMusicManagerInstance } from './sound-mgr.js'

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
        if (!that._cache){
          LoadAssets(loader, 'piac', (cache) => {
            that._cache = cache
            that.setup(cache)
          })
        }
      })
      document.body.appendChild(app.view);
    }else{
      this.setup(this._cache)
    }
  }

  setup(cache) {
    console.log('cache Card loaded')
    // cache is istance of CardImageCache
    let img = cache.get_cardimage(0)
    let texture = PIXI.Texture.from(img)
    let sprite = new PIXI.Sprite(texture)
    //sprite.anchor.x = 0.5;
    //sprite.anchor.y = 0.5;
    //sprite.position.x = sprite.height + 10
    //sprite.position.y = sprite.height + 10
    //sprite.rotation = - 3.14 / 2.0
    myapp._sprite = sprite
    let message = new PIXI.Text("Hello Pixi!")
    message.style = { fill: "white" }

    myapp._app.stage.addChild(sprite);
    myapp._app.stage.addChild(message);
    let t = new Tink(PIXI, myapp._app.renderer.view)
    // let pointer = t.makePointer();
    // pointer.press = () => console.log("The pointer was pressed");
    // pointer.release = () => console.log("The pointer was released");
    //t.makeDraggable(sprite)
    t.makeInteractive(sprite);
    // sprite.press = () => console.log("Sprite was pressed");
    // sprite.release = () => console.log("Sprite was released");

    // test sounds
    //let click = snd.sounds["static/assets/sound/click_4bit.wav"]
    sprite.press = () => {
      myapp._music.Play('played')
    }

    myapp._t = t
    myapp._app.ticker.add(delta => myapp.gameLoop(delta));

  }

  gameLoop(delta) {
    //this._sprite.x += 1
    this._t.update();
  }
}

export const myapp = new MyPixiApp();

document.getElementById('run').addEventListener('click', () => {
  console.log('Run click')
  myapp.Run()
  document.getElementById('gamelist').style.visibility = "hidden";
})