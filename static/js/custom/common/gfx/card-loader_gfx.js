
const c_nomi_semi = ["basto", "coppe", "denar", "spade"]
const c_nomi_simboli = ["cope", "zero", "xxxx", "vuot"]

///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// CardImageCache
class CardImageCache {
  constructor(deck_type) {
    this.current_deck_type = deck_type
    this.cards = []
    this.symbols_card = []
    this.cards_rotated = []
    this.completed = false
    this.scene_background = null
  }

  set_completed() {
    this.completed = true
  }

  printDeck() {
    let fx = 0.7
    var container = new createjs.Container();
    let lasty = 0
    for (let jj = 0; jj < 4; jj++) {
      for (let ii = 0; ii < 10; ii++) {
        let cd = this.cards[ii + jj * 10]
        cd.x = ii * 50
        cd.y = jj * 80
        lasty = cd.y
        cd.scaleX = fx
        cd.scaleY = fx
        container.addChild(cd)
      }
    }
    lasty += 50
    for (let i = 0; i < c_nomi_simboli.length; i++) {
      let cd = this.symbols_card[i]
      cd.x = i * 50
      cd.y = lasty
      lasty = cd.y
      cd.rotation = -90
      container.addChild(cd)
    }

    return container
  }
}

///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// CardLoaderGfx
class CardLoaderGfx {
  constructor() {
    console.log('CardLoaderGfx created (singleton)')
    this.map_image_cache = new Map()
    this.path_prefix = ''
  }

  getLoaded(deck_type) {
    if (this.map_image_cache.has(deck_type)) {
      let cc = this.map_image_cache.get(deck_type)
      if (cc.completed) {
        return cc
      }
    }
    return null
  }

  getProgressGfx(canvas) {
    let that = {}
    let loaderColor = createjs.Graphics.getRGB(247, 247, 247);
    let loaderColor2 = createjs.Graphics.getRGB(247, 247, 247);
    let loaderBar = new createjs.Container();
    let bar = new createjs.Shape();
    let barHeight = 20
    bar.graphics.beginFill(loaderColor2).drawRect(0, 0, 1, barHeight).endFill();
    let loaderWidth = canvas.width - 20;
    let bgBar = new createjs.Shape();
    let padding = 3
    bgBar.graphics.setStrokeStyle(1).beginStroke(loaderColor).drawRect(-padding / 2, -padding / 2, loaderWidth + padding, barHeight + padding);
    loaderBar.x = canvas.width - loaderWidth >> 1;
    loaderBar.y = canvas.height - barHeight >> 1;
    console.log("Canvas size is: ", canvas.width, canvas.height)
    loaderBar.addChild(bar, bgBar);
    that["loaderBar"] = loaderBar
    that["bar"] = bar
    that["loaderWidth"] = loaderWidth
    return that
  }

  getFolderCardsFullpath(deck_type) {
    return this.path_prefix + "assets/carte/" + deck_type + "/"
  }

  getTableFileName(){
    return this.path_prefix + "assets/images/table/table.png"
  }

  loadResources(deck_type) {
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
    let tableFname = this.getTableFileName()

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
            console.log('Image Loaded: ', img.src, posIx);
            let card = new createjs.Bitmap(img);
            imageCache.cards[posIx] = card
            countLoaded += 1
            obs.next(countLoaded)
            if (countToLoad <= countLoaded) {
              imageCache.set_completed()
              obs.complete(imageCache)
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
        let seed = nomi_simboli[i]
        card_fname = `${folder_fullpath}01_${seed}.png`
        let img = new Image()
        img.src = card_fname
        countToLoad += 1
        img.onload = () => {
          console.log('Image Loaded: ', img.src);
          let symb = new createjs.Bitmap(img);
          imageCache.symbols_card[i] = symb
          countLoaded += 1
          obs.next(countLoaded)
          if (countToLoad <= countLoaded) {
            imageCache.set_completed()
            obs.complete(imageCache)
          }
        }
      }
      // background
      let container = new createjs.Container();
      let img = new Image()
      let bmp
      img.src = tableFname
      countToLoad += 1
      img.onload = () => {
        console.log('Image Loaded: ', img.src);
        bmp = new createjs.Bitmap(img);
        //bmp.scale = bmp.originalScale * 0.5; // Sta roba sembra non funzionare
        //let rct = new createjs.Rectangle(0, 600, 800, 1200)
        //var sb = new createjs.ScaleBitmap(img, new createjs.Rectangle(12, 12, 5, 10));
        //sb.setDrawSize(700,500)
        //container.addChild(sb)
        let fx = 800.0 / bmp.image.width // scale to fit the canvas
        bmp.scaleX = fx
        bmp.scaleY = fx
        container.addChild(bmp)

        imageCache.scene_background = container
        countLoaded += 1
        obs.next(countLoaded)
        if (countToLoad <= countLoaded) {
          imageCache.set_completed()
          obs.complete(imageCache)
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

export function GetCardLoaderGfx() {
  if (!provider) {
    provider = new CardLoaderGfx()
  }
  return provider
}
