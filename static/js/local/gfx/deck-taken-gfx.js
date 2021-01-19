import Helper from '../shared/helper.js'

export class DeckTakenGfx {
  constructor(z_ord, cache) {
    this._container = new PIXI.Container()
    this._deckSprite = []
    this._deckEmpty = null
    this._taken_lbl = []

    this._isDirty = false
    this.z_ord = z_ord
    this._cache = cache
    this._max_cards = 0
    this._ani_velocity = 20 // to do main option
    this._position = null
    this._copeTexture = null
    this._last_x = 0
    this._last_y = 0
  }

  Build(max_cards, position) {
    this._position = position
    switch (this._position) {
      case 'nord':
        this._last_y = -20
        this._last_x = -2
        break;
      case 'sud':
        this._last_y = -10
        this._last_x = -2
        break;
      default:
        throw (new Error(`Player position not suppported: ${this._position}`))
    }
    this._max_cards = max_cards
    const cdtempty = this._cache.GetTextureFromSymbol('vuoto_trasp')
    const sprite = new PIXI.Sprite(cdtempty)

    const cdt = this._cache.GetTextureFromSymbol('cope', this._deck_info)
    this._copeTexture = cdt

    Helper.ScaleSprite(sprite, 50, 50)
    sprite.rotation = - Math.PI / 2.0

    this._deckEmpty = sprite
    this._container.addChild(sprite);
    this._isDirty = true
    return this._container
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
    }
    this._isDirty = false
  }

  take_cards(cards) {
    // cards: ['_Ab', '_Cs']
    console.log('Cards taken are: ', cards)
    if (this._deckEmpty) {
      this._deckEmpty.visible = false
      this._deckEmpty = null
      this.add_one_cope()
    }
    for (let index = 0; index < cards.length; index++) {
      const card_lbl = cards[index]
      this._taken_lbl.push(card_lbl)
    }
    if (this._taken_lbl.length / 5 > this._deckSprite.length) {
      this.add_one_cope()
    }
  }

  add_one_cope() {
    console.log('Add one coperto to the stack with size', this._deckSprite.length)
    const sprite = new PIXI.Sprite(this._copeTexture)
    Helper.ScaleSprite(sprite, 50, 50)
    sprite.rotation = - Math.PI / 2.0
    sprite.position.set(this._last_x, this._last_y)

    this._deckSprite.push(sprite)
    this._container.addChild(sprite);
    this._last_x += 2
    this._last_y += 2
    this._isDirty = true
  }

  set_animation_sprite_target(name, sprite, data, canvas_w, canvas_h) {
    switch (name) {
      case "mano_end_all":
        switch (this._position) {
          case 'nord':
            sprite.end_x = sprite.x
            sprite.end_y = 0
            sprite = Helper.CalcSpriteVelocityIncremental(sprite, this._ani_velocity, 1)
            break;
          case 'sud':
            sprite.end_x = sprite.x
            sprite.end_y = canvas_h
            sprite = Helper.CalcSpriteVelocityIncremental(sprite, this._ani_velocity, 0.8)
            break;
          default:
            throw (new Error(`Player position not suppported: ${this._position}`))
        }

        //console.log('** ani mano_end_all ', sprite.end_x, sprite.end_y)

        return sprite
      default:
        throw (new Error(`animation in card player not recognized ${name}`))
    }
  }

}