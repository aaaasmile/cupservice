export class CardsPlayerGfx {
  constructor(tink) {
    this.sprites = []
    this.container = new PIXI.Container()
    this.clickHandler = new Map()
    this.numCards = 0
    this._tink = tink
  }

  Build(numCards) {
    this.numCards = numCards
    return this.container
  }

  SetCards(textures, space_x) {
    let ixTexture = 0
    let iniX = 0
    let iniY = 0
    let x = iniX
    let y = iniY

    for (let index = 0; index < this.numCards; index++) {
      const itemTexture = textures[ixTexture];
      let sprite = new PIXI.Sprite(itemTexture)
      sprite.cup_data_lbl = itemTexture.cup_data_lbl // recognize the card
      sprite.position.set(x, y)
      this.sprites.push(sprite)
      this.container.addChild(sprite)
      x += space_x
      if (ixTexture < textures.length) {
        ixTexture += 1
      }
    }
  }

  Render(isDirty){
    if (this._isDirty || isDirty){
      console.log('*** render cards player ...')
    }
    this._isDirty = false
  }

  OnClick(funHandler) {
    const event = 'click-card'
    this.clickHandler.set(event, funHandler)

    for (let index = 0; index < this.sprites.length; index++) {
      const sprite = this.sprites[index];
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
      if (this.clickHandler.has(event)) {
        this.clickHandler.get(event)(data)
      }
    }
  }
}

