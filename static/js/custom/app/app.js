import { GetCardLoaderGfx } from '../common/gfx/card-loader_gfx.js'
import { LoadAssets } from '../common/gfx/static-scene-gfx.js'

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
    let app = new PIXI.Application({ width: 800, height: 600, antialias: true, transparent: false });
    app.renderer.backgroundColor = 0x061639;
    app.renderer.autoDensity = true;
    this._app = app

    let loader = GetCardLoaderGfx()
    LoadAssets(loader, 'piac', this.setup)
    document.body.appendChild(app.view);
  }

  setup(cache) {
    console.log('Card loaded')
    // cache is istance of CardImageCache
    let img = cache.get_cardimage(0)
    let texture = PIXI.Texture.from(img)
    let sprite = new PIXI.Sprite(texture)
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.position.x = sprite.height + 10
    sprite.position.y = sprite.height + 10
    sprite.rotation = - 3.14 / 2.0
    myapp._sprite = sprite

    myapp._app.stage.addChild(sprite);
    myapp._app.ticker.add(delta => myapp.gameLoop(delta));

  }

  gameLoop(delta) {
    //this._sprite.x += 1
  }
}

export const myapp = new MyPixiApp();

myapp.Run();

document.getElementById('full').addEventListener('click', () => {
  console.log('Button click')
  myapp.fullSize()
})