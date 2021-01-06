import Helper from '../shared/helper.js'

export class DeckTakenGfx {
  constructor(z_ord, cache) {
    this._container = new PIXI.Container()
    this._deckSprite = []

    this._isDirty = false
    this.z_ord = z_ord
    this._cache = cache
    this._max_cards = 0
    this._ani_velocity = 20 // to do main option
    this._position = null
  }

  Build(max_cards, position) {
    this._position = position
    this._max_cards = max_cards
    const cdtempty = this._cache.GetTextureFromSymbol('vuoto_trasp')
    const sprite = new PIXI.Sprite(cdtempty)

    Helper.ScaleSprite(sprite, 50, 50)
    sprite.rotation = - Math.PI / 2.0

    this._deckSprite.push(sprite)
    this._container.addChild(sprite);
    this._isDirty = true
    return this._container
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
    }
    this._isDirty = false
  }

  set_animation_sprite_target(name, sprite, data, canvas_w, canvas_h) {
    switch (name) {
      case "mano_end_all":
        switch(this._position){
          case 'nord':
            sprite.end_x = sprite.x
            sprite.end_y = 0 
            break;
          case 'sud':
            sprite.end_x = sprite.x
            sprite.end_y = canvas_h
            break;
          default:
            throw(new Error(`Player position not suppported: ${this._position}`))
        }
        
        console.log('** ani mano_end_all ', sprite.end_x, sprite.end_y)
        return Helper.CalcSpriteVelocity(sprite, this._ani_velocity)
      default:
        throw (new Error(`animation in card player not recognized ${name}`))
    }
  }

}