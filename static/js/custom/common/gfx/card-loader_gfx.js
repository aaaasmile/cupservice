
const c_nomi_semi = ["basto", "coppe", "denar", "spade"]
const c_nomi_simboli = ["cope", "zero", "xxxx", "vuot"]

///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// CardImageCache
class CardImageCache {
  constructor(deck_type) {
    this.current_deck_type = deck_type
    this.cards = []
    this.symbols_card = new Map()
    this.cards_rotated = []
    this.completed = false
    this.scene_background = null
  }

  set_completed() {
    this.completed = true
  }

  get_cardimage(posIx) {
    if (posIx > 0 && posIx < this.cards.length) {
      let img = this.cards[posIx]
      let clone = img.cloneNode() // clone beacuse it could be used only once
      return clone
    }
    throw (new Error(`${posIx}Ix out of range`))
  }

  get_symbol_img(nome_simbolo) {
    if (this.symbols_card.has(nome_simbolo)) {
      return this.symbols_card.get(nome_simbolo).cloneNode()
    }
    return null
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

  getCurrentCache(){
    return this.current_cache
  }

  getFolderCardsFullpath(deck_type) {
    return this.path_prefix + "assets/carte/" + deck_type + "/"
  }

  getTableFileName(fname_prefix) {
    return this.path_prefix + "assets/images/table/" + fname_prefix + ".png"
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
    let obsLoader = rxjs.Observable.create(function (obs) {
      let card_fname = ""

      let totItems = nomi_semi.length * num_cards_onsuit + nomi_simboli.length
      totItems += 1 // table background

      console.log("Load cards of ", deck_type)

      let countToLoad = 0
      let countLoaded = 0

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
            countLoaded += 1
            obs.next(countLoaded)
            if (countToLoad <= countLoaded) {
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
          countLoaded += 1
          obs.next(countLoaded)
          if (countToLoad <= countLoaded) {
            imageCache.set_completed()
            obs.complete()
          }
        }
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
