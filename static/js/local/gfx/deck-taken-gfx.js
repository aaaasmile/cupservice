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
  }

  Build(max_cards) {
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

  set_animation_sprite_target(name, sprite) {
    switch (name) {
      case "mano_end_all":
        sprite.end_x = this._container.x + this._container.width / 2
        sprite.end_y = this._container.y + this._container.height / 2
        return Helper.CalcSpriteVelocity(sprite, this._ani_velocity)
      default:
        throw (new Error(`animation in card player not recognized ${name}`))
    }
  }

}