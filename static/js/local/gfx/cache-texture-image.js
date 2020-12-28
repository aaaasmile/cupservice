export class CacheTextureImage {
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
      return this.cards[posIx]
    }
    throw (new Error(`Ix => ${posIx} is out of range`))
  }

  get_symbol_img(nome_simbolo) {
    if (this.symbols_card.has(nome_simbolo)) {
      return this.symbols_card.get(nome_simbolo)
    }
    throw (new Error(`nome_simbolo => ${nome_simbolo} not available.`))
  }

  get_avatar_img(avatar_name) {
    if (this.avatars.has(avatar_name)) {
      return this.avatars.get(avatar_name)
    }
    throw (new Error(`avatar_name => ${avatar_name} not available.`))
  }

  get_background_img(background_name) {
    if (this.backgrounds.has(background_name)) {
      return this.backgrounds.get(background_name)
    }
    return null
  }

  GetTextureFromAvatar(avatar) {
    let texture = null
    let avatarKey = 'AVT-' + avatar
    if (this.textureCache.has(avatarKey)) {
      return this.textureCache.get(avatarKey)
    }
    let ssImg = this.get_avatar_img(avatar)
    if (ssImg) {
      texture = PIXI.Texture.from(ssImg)
      this.textureCache.set(avatarKey, texture)
    }
    return texture
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

  GetTextureFromBackground(name) {
    let texture = null
    let textureKey = 'BACK-' + name
    if (this.textureCache.has(textureKey)) {
      return this.textureCache.get(textureKey)
    }
    let img = this.get_background_img(name)
    if (img) {
      texture = PIXI.Texture.from(img)
      this.textureCache.set(textureKey, texture)
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
      texture.cup_data_lbl = cardLbl // give the context
      this.textureCache.set(crdKey, texture)
    }
    //console.log("Texture for card is ", texture)
    
    return texture
  }

  check_deckinfo(deckinfo){
    const numCards = this.cards.length
    const deskinfo_size = deckinfo.cards_on_game.length
    console.log('check deck info ', numCards, deskinfo_size)
    if (deskinfo_size <= 40 && numCards == 52){
      deckinfo.use52deckIn40Deckgame()
    }
  }
}
