
import { CardImageCache } from './card-image-cache.js'

const c_nomi_semi = ["basto", "coppe", "denar", "spade"]
const c_nomi_simboli = ["cope", "zero", "xxxx", "vuot"]
const c_nomi_avatar = ["ade", "christian", "elliot", "jenny", "joe", "nan", "stevie", "zoe"]
const c_nomi_sfondi = ["table"]


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

  getCurrentCache() {
    return this.current_cache
  }

  getFolderCardsFullpath(deck_name) {
    return this.path_prefix + "assets/carte/" + deck_name + "/"
  }

  getonloadImage(cb, ...params) {
    return () => { 
      // Arrow function in JS should support this contructor at declaration (contex in the stack)
      // but in golang it is an error. To avoid rechecking the code evrey time and thinking it is an async error, 
      // make the context in a new stack explicit.
      switch (params.length) {
        case 0: cb(); break;
        case 1: cb(params[0]); break;
        case 2: cb(params[0], params[1]); break;
        case 3: cb(params[0], params[1], params[2]); break;
        default: throw new Error('Callback error')
      }
    }
  }

  LoadAssets(deck_name, cbLoaded) {
    console.log("Load images for ", deck_name)
    if (!deck_name) {
      throw new Error('deck name not set')
    }
    if (this.map_image_cache.has(deck_name)) {
      let cc = this.map_image_cache.get(deck_name)
      if (cc.completed) {
        this.current_cache = cc
        console.log('Reuse cache')
        cbLoaded(cc)
        return
      }
    }

    let totItems = -1
    this.loadResources(deck_name, cbLoaded)
      .subscribe(x => {
        if (totItems === -1) {
          totItems = x
          console.log("Expect total items to load: ", x)
          return
        }
      },
        (err) => {
          console.error("Load error", err)
        }, (cache) => {
          console.log("Load Completed")
        })
  }

  loadResources(deck_name, cbLoaded) {
    console.log('Load resources for ', deck_name)

    let nomi_simboli = [...c_nomi_simboli]
    let nomi_semi = [...c_nomi_semi]
    let num_cards_onsuit = this.getNumCardOnSuit(deck_name)
    if (this.deck_france) {
      num_cards_onsuit = 13
      nomi_simboli = ['simbo', 'simbo', 'simbo']
      nomi_semi = ["fiori", "quadr", "cuori", "picch"]
    }

    let imageCache = new CardImageCache(deck_name)
    let folder_fullpath = this.getFolderCardsFullpath(deck_name)
    this.map_image_cache.set(deck_name, imageCache)

    // Nota sull'implementazione: uso Observable anzichè Subject
    // in quanto il Subject è per il multicast. In questo caso ho una semplice promise.
    // Qui viene fatto un wrapper di tutta la funzione e Observable.create(...) la 
    // deve includere tutta. 
    let obsLoader = rxjs.Observable.create((obs) => {
      let card_fname = ""

      let totItems = nomi_semi.length * num_cards_onsuit + nomi_simboli.length // used onl for notification progress
      totItems += c_nomi_avatar.length // avatars
      totItems += c_nomi_sfondi.length // backgrounds

      console.log("Load cards of ", deck_name)

      let countToLoad = c_nomi_sfondi.length - this.backgrounds.length  // backgrounds
      countToLoad += c_nomi_avatar.length - this.avatars.length
      countToLoad += nomi_semi.length * num_cards_onsuit + nomi_simboli.length

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
          let imgToLoad = new Image()
          imgToLoad.src = card_fname
          imgToLoad.onload = this.getonloadImage((img, ii, jj) => {
            let posIx = ii * num_cards_onsuit + jj - 1
            console.log('Image Loaded: ', img.src, posIx);
            imageCache.cards[posIx] = img
            loadedCount += 1
            obs.next(loadedCount)
            if (countToLoad <= loadedCount) {
              imageCache.set_completed()
              obs.complete()
              cbLoaded(imageCache)
            }
          }, imgToLoad, i, index)
        }
      }
      // symbols
      console.log("Load all symbols...")
      for (let i = 0; i < nomi_simboli.length; i++) {
        let nome_simbolo = nomi_simboli[i]
        card_fname = `${folder_fullpath}01_${nome_simbolo}.png`
        let imgToLoad = new Image()
        imgToLoad.src = card_fname

        imgToLoad.onload = this.getonloadImage((img, ii) => {
          let key = nomi_simboli[ii]
          console.log('Symbol Loaded: %d %s, %s', ii, img.src, key);
          imageCache.symbols_card.set(key, img)
          loadedCount += 1
          obs.next(loadedCount)
          if (countToLoad <= loadedCount) {
            imageCache.set_completed()
            obs.complete()
            cbLoaded(imageCache)
          }
        }, imgToLoad, i)
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
          let imgToLoad = new Image()
          imgToLoad.src = avatar_filepath
          imgToLoad.onload = this.getonloadImage((img, ii, ee) => {
            console.log('Avatar Loaded: ', img.src, ii, ee);
            imageCache.avatars.set(ee, img)
            this.avatars[ii] = img
            loadedCount += 1
            obs.next(loadedCount)
            if (countToLoad <= loadedCount) {
              imageCache.set_completed()
              obs.complete()
              cbLoaded(imageCache)
            }
          }, imgToLoad, ix, e)
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
          let imgToLoad = new Image()
          imgToLoad.src = item_filepath
          imgToLoad.onload = this.getonloadImage((img, ii, ee) => {
            console.log('Image back Loaded: ', img.src, ii, ee);
            imageCache.backgrounds.set(ee, img)
            this.backgrounds[ii] = img
            loadedCount += 1
            obs.next(loadedCount)
            if (countToLoad <= loadedCount) {
              imageCache.set_completed()
              obs.complete()
              cbLoaded(imageCache)
            }
          }, imgToLoad, ix, e)
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

