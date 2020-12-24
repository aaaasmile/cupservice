export class CardsPlayerGfx {
  constructor(z_ord, tink) {
    this._sprites = []
    this._container = new PIXI.Container()
    this._clickHandler = new Map()
    this._numCards = 0
    this._z_ord = z_ord
    this._tink = tink
  }

  Build(numCards) {
    this._numCards = numCards
    return this._container
  }

  SetCards(textures, space_x) {
    let ixTexture = 0
    let iniX = 0
    let iniY = 0
    let x = iniX
    let y = iniY

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
