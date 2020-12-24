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
  }

  Build(numCards) {
    this._numCards = numCards
  }

  get_space_x(texture_w, mode){
    switch(mode){
      case 'normal':
        return texture_w + 10
      case 'compact':
        return 27
    }
    throw (new Error(`get space x: mode => ${mode} not recognized`))
  }

  SetCards(cards,mode) {
    if(!mode){
      mode = 'normal'
    }
    let textures = []
    cards.forEach(element => {
      let cdt = this._cache.GetTextureFromCard(element,this._deck_info)
      textures.push(cdt)
    });

    for (let index = textures.length; index < this._numCards; index++) {
      let cdt = this._cache.GetTextureFromSymbol('cope',this._deck_info)
      textures.push(cdt)
    }

    let ixTexture = 0
    let iniX = 0
    let iniY = 0
    let x = iniX
    let y = iniY

    this._container.removeChildren()
    this._sprites = []
    const  space_x = this.get_space_x(textures[0].width, mode)
    for (let index = 0; index < this._numCards; index++) {
      const itemTexture = textures[ixTexture];
      let sprite = new PIXI.Sprite(itemTexture)
      sprite.cup_data_lbl = itemTexture.cup_data_lbl // recognize the card
      sprite.position.set(x, y)
      this._sprites.push(sprite)
      this._container.addChild(sprite)
      x += space_x
      if (ixTexture < textures.length) {
        ixTexture += 1
      }
    }
    this._isDirty = true
  }

  Render(isDirty){
    if (this._isDirty || isDirty){
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

