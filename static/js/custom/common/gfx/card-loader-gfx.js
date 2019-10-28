
const c_nomi_semi = ["basto", "coppe", "denar", "spade"]
const c_nomi_simboli = ["cope", "zero", "xxxx", "vuot"]
const c_nomi_avatar = ["ade", "christian", "elliot", "jenny", "joe", "nan", "stevie", "zoe"]
const c_nomi_sfondi = ["table"]

///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// CardImageCache
class CardImageCache {
  constructor(deck_type) {
    this.current_deck_type = deck_type
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

///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// CardLoaderGfx
class CardLoaderGfx {
  constructor() {
    console.log('CardLoaderGfx created (singleton)')
    this.map_image_cache = new Map()
    this.path_prefix = 'static/'
    this.current_cache = null
    this.avatars = []
    this.backgrounds = []
  }

  getLoaded(deck_type) {
    if (this.map_image_cache.has(deck_type)) {
      let cc = this.map_image_cache.get(deck_type)
      if (cc.completed) {
        this.current_cache = cc
        return cc
      }
    }
    return null
  }

  getCurrentCache() {
    return this.current_cache
  }

  getFolderCardsFullpath(deck_type) {
    return this.path_prefix + "assets/carte/" + deck_type + "/"
  }

  loadResources(deck_type) {
    console.log('Load resources')
    let nomi_simboli = [...c_nomi_simboli]
    let nomi_semi = [...c_nomi_semi]
    let num_cards_onsuit = this.getNumCardOnSuit(deck_type)
    if (this.deck_france) {
      num_cards_onsuit = 13
      nomi_simboli = ['simbo', 'simbo', 'simbo']
      nomi_semi = ["fiori", "quadr", "cuori", "picch"]
    }

    let imageCache = new CardImageCache(deck_type)
    let folder_fullpath = this.getFolderCardsFullpath(deck_type)
    this.map_image_cache.set(deck_type, imageCache)

    // Nota sull'implementazione: uso Observable anzichè Subject
    // in quanto il Subject è per il multicast. In questo caso ho una semplice promise.
    // Qui viene fatto un wrapper di tutta la funzione e Observable.create(...) la 
    // deve includere tutta. 
    let obsLoader = rxjs.Observable.create((obs) => {
      let card_fname = ""

      let totItems = nomi_semi.length * num_cards_onsuit + nomi_simboli.length // used onl for notification progress
      totItems += c_nomi_avatar.length // avatars
      totItems += c_nomi_sfondi.length // backgrounds

      console.log("Load cards of ", deck_type)

      let countToLoad = 0
      let loadedCount = 0 // when reach countToLoad, then the load is completed

      // cards
      obs.next(totItems)
      for (let i = 0; i < nomi_semi.length; i++) {
        let seed = nomi_semi[i]
        for (let index = 1; index <= num_cards_onsuit; index++) {
          let ixname = `${index}`
          if (index < 10) {
            ixname = '0' + ixname
          }
          card_fname = `${folder_fullpath}${ixname}_${seed}.png`
          //console.log('Card fname is: ', card_fname)
          let img = new Image()
          img.src = card_fname
          countToLoad += 1
          img.onload = () => {
            let posIx = i * num_cards_onsuit + index - 1
            //console.log('Image Loaded: ', img.src, posIx);
            //let card = new createjs.Bitmap(img);
            let card = img // todo use a class
            imageCache.cards[posIx] = card
            loadedCount += 1
            obs.next(loadedCount)
            if (countToLoad <= loadedCount) {
              imageCache.set_completed()
              obs.complete()
            }
          }
          img.onerror = () => {
            console.error('Image load error on ', img.src)
            obs.error('err on image load')
          }
        }
      }
      // symbols
      console.log("Load all symbols...")
      for (let i = 0; i < nomi_simboli.length; i++) {
        let nome_simbolo = nomi_simboli[i]
        card_fname = `${folder_fullpath}01_${nome_simbolo}.png`
        let img = new Image()
        img.src = card_fname
        countToLoad += 1

        img.onload = () => { // works also if i = 2 il loaded before i = 1
          //console.log('Image Loaded: %d %s, %s', i, img.src, nome_simbolo);
          imageCache.symbols_card.set(nome_simbolo, img)
          loadedCount += 1
          obs.next(loadedCount)
          if (countToLoad <= loadedCount) {
            imageCache.set_completed()
            obs.complete()
          }
        }
      }
      // avatars
      console.log("Load all avatars...")
      if (this.avatars.length === c_nomi_avatar.length) {
        // avatars already loaded
        c_nomi_avatar.forEach((e, ix) => {
          imageCache.avatars.set(e, this.avatars[ix])
        })
      } else {
        this.avatars = []
        let avatar_folder = this.path_prefix + "assets/images/avatar"
        c_nomi_avatar.forEach((e, ix) => {
          let avatar_filepath = `${avatar_folder}/${e}.jpg`
          let img = new Image()
          img.src = avatar_filepath
          countToLoad += 1
          img.onload = () => {
            imageCache.avatars.set(e, img)
            this.avatars[ix] = img
            loadedCount += 1
            obs.next(loadedCount)
            if (countToLoad <= loadedCount) {
              imageCache.set_completed()
              obs.complete()
            }
          }
        })
      }
      console.log('Load background')
      if (this.backgrounds.length === c_nomi_sfondi.length) {
        // background already loaded
        c_nomi_sfondi.forEach((e, ix) => {
          imageCache.backgrounds.set(e, this.backgrounds[ix])
        })
      } else {
        this.backgrounds = []
        let back_folder = this.path_prefix + "assets/images/table"
        c_nomi_sfondi.forEach((e, ix) => {
          let item_filepath = `${back_folder}/${e}.png`
          let img = new Image()
          img.src = item_filepath
          countToLoad += 1
          img.onload = () => {
            imageCache.backgrounds.set(e, img)
            this.backgrounds[ix] = img
            loadedCount += 1
            obs.next(loadedCount)
            if (countToLoad <= loadedCount) {
              imageCache.set_completed()
              obs.complete()
            }
          }
        })
      }
    })
    return obsLoader
  }

  getNumCardOnSuit(folder) {
    switch (folder) {
      case "bergamo":
      case "milano":
      case "napoli":
      case "piac":
      case "sicilia":
        return 10
      case "treviso":
      case "francesi":
        return 13
      default:
        throw (new Error('Deck folder not supported', folder))
    }
  }
}



let provider

export function GetCardLoaderGfx() { // GetCardLoaderGfx is a singleton to use the image cache (also over more module imports)
  if (!provider) {
    console.log('new CardLoaderGfx')
    provider = new CardLoaderGfx()
  } else {
    console.log('CardLoaderGfx')
  }
  return provider
}

