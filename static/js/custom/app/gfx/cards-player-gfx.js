export class CardsPlayerGfx {
  constructor(tink) {
    this.spriteInfos = []
    this.container = new PIXI.Container()
    this.clickHandler = new Map()
    this.numCards = 0
    this._tink = tink
  }

  Build(numCards) {
    this.numCards = numCards
    return this.container
  }

  SetCards(textureInfos, space_x) {
    let ixTexture = 0
    let iniX = 0
    let iniY = 0
    let x = iniX
    let y = iniY

    for (let index = 0; index < this.numCards; index++) {
      const itemTexture = textureInfos[ixTexture].t;
      let sprite = new PIXI.Sprite(itemTexture)
      sprite.position.set(x, y)
      this.spriteInfos.push({ sprite: sprite, data: textureInfos[ixTexture].d })
      this.container.addChild(sprite)
      x += space_x
      if (ixTexture < textureInfos.length) {
        ixTexture += 1
      }
    }
  }

  OnClick(funHandler) {
    const event = 'click-card'
    this.clickHandler.set(event, funHandler)

    for (let index = 0; index < this.spriteInfos.length; index++) {
      const element = this.spriteInfos[index];
      let sprite = element.sprite
      let data = element.data
      this._tink.makeInteractive(sprite);
      this.handlePress(event, data, sprite)
    }
  }

  handlePress(event, data, sprite) {
    sprite.press = () => {
      console.log('Card is pressed')
      if (this.clickHandler.has(event)) {
        this.clickHandler.get(event)(data)
      }
    }
  }
}

