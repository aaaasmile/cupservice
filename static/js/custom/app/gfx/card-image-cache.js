export class CardImageCache {
  constructor(deck_name) {
    this.current_deck_name = deck_name
    this.cards = []
    this.symbols_card = new Map()
    this.cards_rotated = []
    this.completed = false
    this.avatars = new Map()
    this.backgrounds = new Map()
    this.textureCache = new Map()
  }

  set_completed() {
    this.completed = true
  }

  get_cardimage(posIx) {
    if (posIx >= 0 && posIx < this.cards.length) {
      let img = this.cards[posIx]
      let clone = img.cloneNode() // clone beacuse it could be used only once
      return clone
    }
    throw (new Error(`Ix => ${posIx} is out of range`))
  }

  get_symbol_img(nome_simbolo) {
    if (this.symbols_card.has(nome_simbolo)) {
      return this.symbols_card.get(nome_simbolo).cloneNode()
    }
    return null
  }

  get_avatar_img(avatar_name) {
    if (this.avatars.has(avatar_name)) {
      return this.avatars.get(avatar_name).cloneNode()
    }
    return null
  }

  get_background_img(background_name) {
    if (this.backgrounds.has(background_name)) {
      return this.backgrounds.get(background_name).cloneNode()
    }
    return null
  }

  GetTextureFromSymbol(symbol) {
    let texture = null
    let symbKey = 'SYM-' + symbol
    if (this.textureCache.has(symbKey)) {
      return this.textureCache.get(symbKey)
    }
    let ssImg = this.get_symbol_img(symbol)
    if (ssImg) {
      texture = PIXI.Texture.from(ssImg)
      this.textureCache.set(symbKey, texture)
    }
    return texture
  }

  // deckInfo: is a parameter because the ix differ on deck type. It is game specific.
  GetTextureFromCard(cardLbl, deckInfo) { //cardLbl: _5s, deckInfo instance of class DeckInfo
    let texture = null
    let crdKey = 'CRD-' + cardLbl
    if (this.textureCache.has(crdKey)) {
      return this.textureCache.get(crdKey)
    }
    let card_info = deckInfo.get_card_info(cardLbl)
    let cardImg = this.get_cardimage(card_info.ix)
    if (cardImg) {
      texture = PIXI.Texture.from(cardImg)
      this.textureCache.set(crdKey, texture)
    }
    return texture
  }
}
