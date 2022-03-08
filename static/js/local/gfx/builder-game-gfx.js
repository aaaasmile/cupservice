import { StaticSceneGfx } from './static-scene-gfx.js'
import { BriscolaGfx } from '../games/brisc-base/briscola-gfx.js'
import { BriscolaScopertaGfx } from '../games/brisc-base/scoperta/br-scoperta-gfx.js'
import Store from '../../vue/store/index.js'

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
    const game_items = Store.state.pl.game_list.filter(x => x.enabled && x.name === this._game_name)
    if (game_items.length === 0) {
      throw (new Error(`game gfx not supported ${this._game_name}`))
    }
    const gfxClass = game_items[0].gfx
    // it seems that eval(new $gfxClass(..)) is evil here
    switch (gfxClass) {
      case 'BriscolaGfx':
        console.log('Build briscola gfx')
        gfx = new BriscolaGfx(cache, staticSceneGfx, screen_mode)
        break;
      case 'BriscolaScopertaGfx':
        console.log('Build briscola scoperta gfx')
        gfx = new BriscolaScopertaGfx(cache, staticSceneGfx, screen_mode)
        break;
      default:
        throw (new Error(`game gfx not supported ${gfxClass}`))
    }

    this._core_state = gfx.BuildGameVsCpu()
    this._staticScene = staticSceneGfx
    this._isDirty = true

    return stage
  }

  Update(delta) {
    this._staticScene.Render(this._isDirty, delta)
    this._staticScene.UpdateAnimations(this._isDirty, delta)
    this._core_state.process_next()
    this._isDirty = false
  }
}