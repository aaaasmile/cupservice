import { StaticSceneGfx } from './static-scene-gfx.js'
import { BriscolaGfx } from '../games/brisc-base/briscola-gfx.js'
import { BriscolaScopertaGfx } from '../games/brisc-base/scoperta/br-scoperta-gfx.js'

export class BuilderGameGfx {

  constructor(game_name) {
    this._core_state = null
    this._staticScene = null
    this._isDirty = false
    this._game_name = game_name
  }

  Build(cache, renderer, screen_mode) {
    let stage = new PIXI.Container()

    const staticSceneGfx = new StaticSceneGfx()
    const backTexture = cache.GetTextureFromBackground('table')
    let viewWidth = (renderer.width / renderer.resolution);
    let viewHeight = (renderer.height / renderer.resolution);
    let scContainer = staticSceneGfx.Build(backTexture, viewWidth, viewHeight)
    stage.addChild(scContainer)

    let gfx = null
    switch (this._game_name) {
      case 'briscola':
        console.log('Build briscola gfx')
        gfx = new BriscolaGfx(cache, staticSceneGfx, screen_mode)
        break;
      case 'briscolascoperta':
        console.log('Build briscola scoperata gfx')
        gfx = new BriscolaScopertaGfx(cache, staticSceneGfx, screen_mode)
        break;
      default:
        throw (new Error(`game gfx not supported ${this._game_name}`))
    }

    this._core_state = gfx.BuildGameVsCpu()
    this._staticScene = staticSceneGfx
    this._isDirty = true

    return stage
  }

  Update(delta) {
    this._staticScene.Render(this._isDirty)
    this._staticScene.UpdateAnimations(this._isDirty, delta)
    this._core_state.process_next()
    this._isDirty = false
  }
}