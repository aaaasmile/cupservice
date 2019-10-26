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
    LoadAssets(loader, 'piac', (cache) => {
      console.log('Card loaded')
    })

    document.body.appendChild(app.view);
    
  }
}

export const myapp = new MyPixiApp();

myapp.Run();

document.getElementById('full').addEventListener('click', () => {
  console.log('Button click')
  myapp.fullSize()
})