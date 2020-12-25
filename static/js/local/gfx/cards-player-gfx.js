import Helper from '../shared/helper.js'
export class CardsPlayerGfx {
  constructor(z_ord, tink, deck_info, cache) {
    this._sprites = []
    this._container = new PIXI.Container()
    this._clickHandler = new Map()
    this._numCards = 0
    this._z_ord = z_ord
    this._tink = tink
    this._deck_info = deck_info
    this._cache = cache
    this._visibleSprite = []
  }

  Build(numCards) {
    this._numCards = numCards
  }

  get_space_x(texture_w, mode) {
    switch (mode) {
      case 'normal':
        return texture_w + 10
      case 'compact_small':
        return 15
      case 'compact':
        return 27
    }
    throw (new Error(`get space x: mode => ${mode} not recognized`))
  }

  resize_sprite(sprite, mode) {
    switch (mode) {
      case 'compact':
      case 'normal':
        return sprite
      case 'compact_small':
        let nw = sprite.width - sprite.width / 3
        let nh = sprite.height - sprite.height / 3
        Helper.ScaleSprite(sprite, nw, nh)
        return
    }
    throw (new Error(`get space x: mode => ${mode} not recognized`))
  }

  SetCards(cards, mode) {
    if (!mode) {
      mode = 'normal'
    }
    let textures = []
    this._visibleSprite = []
    cards.forEach(element => {
      let cdt = this._cache.GetTextureFromCard(element, this._deck_info)
      textures.push(cdt)
      this._visibleSprite.push(false)
    });

    for (let index = textures.length; index < this._numCards; index++) {
      let cdt = this._cache.GetTextureFromSymbol('cope', this._deck_info)
      textures.push(cdt)
    }

    let ixTexture = 0
    let iniX = 0
    let iniY = 0
    let x = iniX
    let y = iniY

    this._container.removeChildren()
    this._sprites = []
    const space_x = this.get_space_x(textures[0].width, mode)
    for (let index = 0; index < this._numCards; index++) {
      const itemTexture = textures[ixTexture];
      let sprite = new PIXI.Sprite(itemTexture)
      this.resize_sprite(sprite, mode)
      sprite.cup_data_lbl = itemTexture.cup_data_lbl // recognize the card
      sprite.position.set(x, y)
      sprite.visible = false
      this._sprites.push(sprite)
      this._container.addChild(sprite)
      x += space_x
      if (ixTexture < textures.length) {
        ixTexture += 1
      }
    }
    this._isDirty = true
  }

  set_animation_sprite_target(name, sprite) {
    if (name === "distr_card") {
      const ix = this._visibleSprite.indexOf(false)
      const s_src = this._sprites[ix]
      sprite.end_x = s_src.x + (ix * s_src.width) +  this._container.x
      sprite.end_y = s_src.y +  this._container.y
      return sprite
    }
    throw (new Error(`animation in card player not recognized ${name}`))
  }

  set_visible(card_lbl){
    for (let index = 0; index < this._sprites.length; index++) {
      const element = this._sprites[index];
      if (element.cup_data_lbl === card_lbl){
        this._visibleSprite[index] = true
        element.visible = true
        return
      }
    }
    throw (new Error(`set_visible on card not found ${card_lbl}`))
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
      console.log('*** render cards player ...')
    }
    this._isDirty = false
  }

  OnClick(funHandler) {
    const event = 'click-card'
    this._clickHandler.set(event, funHandler)

    for (let index = 0; index < this._sprites.length; index++) {
      const sprite = this._sprites[index];
      let data = sprite.cup_data_lbl
      this._tink.makeInteractive(sprite);
      this.handlePress(event, data, sprite)
    }
  }

  handlePress(event, data, sprite) {
    sprite.press = () => {
      console.log('Card is pressed')
      //sprite.enabled = false // remove the interactivity
      //sprite.visible = false
      if (this._clickHandler.has(event)) {
        this._clickHandler.get(event)(data)
      }
    }
  }
}

