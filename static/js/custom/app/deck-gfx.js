export class DeckGfx {
  constructor() {
    this.deckSprite = []
    this.briscola = null
    this.container = new PIXI.Container()
  }

  Build(numCardsOnDeck, deckItemTexture, briscolaTexture) {
    let iniX = 10
    let intY = 0
    let x = iniX
    let y = intY
    for (let index = 0; index < numCardsOnDeck; index++) {
      let sprite = new PIXI.Sprite(deckItemTexture)
      sprite.position.set(x, y)
      this.deckSprite.push(sprite)
      this.container.addChild(sprite)
      x += 1
      y += 1
    }

    if (briscolaTexture) {
      let sprite = new PIXI.Sprite(briscolaTexture)
      this.briscola = sprite
      if (this.deckSprite.length > 0) {
        let last = this.deckSprite[0]
        y = last.y + last.height - ((last.height - last.width) / 2)
        x = last.x + last.width / 2
      }
      console.log('x,y of briscola', x, y)
      sprite.position.set(x, y)
      sprite.rotation = - Math.PI / 2.0
      this.container.addChildAt(sprite, 0)
    }
    return this.container
  }

  PopCard(num) {
    for (let index = 0; index < num; index++) {
      let item = this.deckSprite.pop()
      if (item) {
        this.container.removeChild(item)
      } else if (this.briscola) {
        this.container.removeChild(this.briscola)
        this.briscola = null
      }
    }
  }
}