export class DeckGfx {
  constructor(z_ord, cache, deck_info) {
    this._deckSprite = []
    this._z_ord = z_ord
    this._briscola = null
    this._container = new PIXI.Container()
    this._cache = cache
    this._deck_info = deck_info
  }

  Build(numCardsOnDeck, brisc) {
    let deckItemTexture = this._cache.GetTextureFromSymbol('cope')
    let briscolaTexture = this._cache.GetTextureFromCard(brisc, this._deck_info)

    let iniX = 10
    let intY = 0
    let x = iniX
    let y = intY
    for (let index = 0; index < numCardsOnDeck; index++) {
      let sprite = new PIXI.Sprite(deckItemTexture)
      sprite.position.set(x, y)
      this._deckSprite.push(sprite)
      this._container.addChild(sprite)
      x += 1
      y += 1
    }
    this._last_x = x
    this._last_y = y
    if (numCardsOnDeck > 0) {
      this._last_x = x - 1
      this._last_y = y - 1
    }

    if (briscolaTexture) {
      let sprite = new PIXI.Sprite(briscolaTexture)
      this._briscola = sprite
      if (this._deckSprite.length > 0) {
        let last = this._deckSprite[0]
        y = last.y + last.height - ((last.height - last.width) / 2)
        x = last.x + last.width / 2
      }
      console.log('x,y of briscola', x, y)
      sprite.position.set(x, y)
      sprite.rotation = - Math.PI / 2.0
      this._container.addChildAt(sprite, 0)
    }
    return this._container
  }

  get_animation_sprite(name) {
    if (name === 'distr_card') {
      let copTexture = this._cache.GetTextureFromSymbol('cope')
      let sprite = new PIXI.Sprite(copTexture)
      sprite.x = this._last_x + this._container.x
      sprite.y = this._last_y + this._container.y
      return sprite
    }
    throw (new Error(`animation not recognized ${name}`))
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
      console.log('*** render the deck ...')
    }
    this._isDirty = false
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