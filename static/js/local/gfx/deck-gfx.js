import Helper from '../shared/helper.js?version=100'
export class DeckGfx {
  constructor(z_ord, cache, deck_info) {
    this._deckSprite = []
    this._z_ord = z_ord
    this._briscola = null
    this._container = new PIXI.Container()
    this._cache = cache
    this._deck_info = deck_info
    this._mode_display = 'normal'
  }

  get_increment(mode) {
    switch (mode) {
      case 'normal':
        return 1
      case 'compact_small':
        return 0.2
    }
    throw (new Error(`get_increment: mode => ${mode} not recognized`))
  }

  get_offsety_brisc(mode) {
    switch (mode) {
      case 'normal':
        return 30
      case 'compact_small':
        return 5
    }
    throw (new Error(`get_increment: mode => ${mode} not recognized`))
  }

  Build(numCardsOnDeck, brisc, mode) {
    this._mode_display = mode
    let deckItemTexture = this._cache.GetTextureFromSymbol('cope')
    let briscolaTexture = this._cache.GetTextureFromCard(brisc, this._deck_info)

    let x = 0
    let y = 0
    const incr = this.get_increment(mode)
    for (let index = 0; index < numCardsOnDeck; index++) {
      let sprite = new PIXI.Sprite(deckItemTexture)
      this.resize_sprite(sprite, mode)
      sprite.position.set(x, y)
      this._deckSprite.push(sprite)
      this._container.addChild(sprite)
      x += incr
      y += incr
    }
    this._last_x = x
    this._last_y = y
    if (numCardsOnDeck > 0) {
      this._last_x = x - incr
      this._last_y = y - incr
    }

    if (briscolaTexture) {
      let sprite = new PIXI.Sprite(briscolaTexture)
      this.resize_sprite(sprite, mode)
      const offset_y = this.get_offsety_brisc(mode)
      this._briscola = sprite
      if (this._deckSprite.length > 0) {
        let last = this._deckSprite[0]
        y = last.y + last.height - ((last.height - last.width) / 2)
        x = last.x + last.width / 2
      }
      y += offset_y
      console.log('x,y of briscola', x, y)
      sprite.position.set(x, y)
      sprite.rotation = - Math.PI / 2.0
      this._container.addChildAt(sprite, 0)
    }
    return this._container
  }

  resize_sprite(sprite, mode) {
    switch (mode) {
      case 'compact':
      case 'normal':
        return sprite
      case 'normal_x_small_y':
      case 'compact_small':
        const nw = sprite.width - sprite.width / 3
        const nh = sprite.height - sprite.height / 3
        Helper.ScaleSprite(sprite, nw, nh)
        return
    }
    throw (new Error(`resize_sprite: mode => ${mode} not recognized`))
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
      //console.log('*** render the deck ...')
    }
    this._isDirty = false
  }

  SetTopVisibleCard(card_lbl) {
    if (this._deckSprite.length < 1) {
      throw new Error(`Deck does not contains a top`)
    }
    const cardTexture = this._cache.GetTextureFromCard(card_lbl, this._deck_info)
    if (cardTexture) {
      const sprite = this._deckSprite[this._deckSprite.length - 1]
      sprite.texture = cardTexture
      const old_x = sprite.x
      const old_y = sprite.y
      Helper.ScaleCardSpriteToStdIfNeeded(sprite)
      sprite.x = old_x
      sprite.y = old_y
    }
  }

  set_animation_sprite_start(name, data) {
    switch (name) {
      case 'distr_card': {
        const copTexture = this._cache.GetTextureFromSymbol('cope')
        const sprite = new PIXI.Sprite(copTexture)
        this.resize_sprite(sprite, this._mode_display)
        sprite.x = this._last_x + this._container.x
        sprite.y = this._last_y + this._container.y
        return [sprite]
      }
      case 'pesca_carta': {
        const card_lbl = data
        const cardTexture = this._cache.GetTextureFromCard(card_lbl, this._deck_info)
        const sprite = new PIXI.Sprite(cardTexture)
        this.resize_sprite(sprite, this._mode_display)
        sprite.x = this._last_x + this._container.x
        sprite.y = this._last_y + this._container.y
        return [sprite]
      }
      default:
        throw (new Error(`animation not recognized ${name}`))
    }
  }

  Redraw() {
    this._isDirty = true
  }

  PopCard(num) {
    for (let index = 0; index < num; index++) {
      let item = this._deckSprite.pop()
      if (item) {
        this._container.removeChild(item)
      } else if (this._briscola) {
        this._container.removeChild(this._briscola)
        this._briscola = null
      }
    }
  }
}