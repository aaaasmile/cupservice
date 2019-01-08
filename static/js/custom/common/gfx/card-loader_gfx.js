export class CardLoaderGfx {
  constructor() {
    console.log('CardLoaderGfx created')
    this.nomi_semi = ["basto", "coppe", "denar", "spade"]
    this.nomi_simboli = ["cope", "zero", "xxxx", "vuot"]
    this.current_deck_type = ''
    this.cards = []
    this.symbols_card = []
    this.cards_rotated = []
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

  loadResources(folder) {
    let that = this
    // Nota sull'implementazione: uso Observable anzichè Subject
    // in quanto il Subject è per il multicast. In questo caso ho una semplice promise.
    // Qui viene fatto un wrapper di tutta la funzione e Observable.create(...) la 
    // deve includere tutta. In questo caso devo anche usare let that = this. 
    let obsLoader = rxjs.Observable.create(function (obs) {
      let card_fname = ""
      let num_cards_onsuit = that.getNumCardOnSuit(folder)
      if (that.deck_france) {
        num_cards_onsuit = 13
        that.nomi_simboli = ['simbo', 'simbo', 'simbo']
        that.nomi_semi = ["fiori", "quadr", "cuori", "picch"]
      }
      let totItems = that.nomi_semi.length * num_cards_onsuit + that.nomi_simboli.length
      totItems += 1 // table background

      console.log("Load cards from folder %s and type %s", folder, that.current_deck_type)
      if (that.current_deck_type === folder) {
        console.log("Avoid to load a new card deck")
        obs.next(totItems)
        obs.next(totItems)
        obs.complete()
        return obs
      }
      that.cards = []
      that.cards_rotated = []
      that.symbols_card = []
      let folder_fullpath = "assets/carte/" + folder + "/"
      console.log("Load cards...")


      let countToLoad = 0
      let countLoaded = 0

      obs.next(totItems)
      for (let i = 0; i < that.nomi_semi.length; i++) {
        let seed = that.nomi_semi[i]
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
            that.cards[posIx] = card
            // setInterval(x => {
            countLoaded += 1
            obs.next(countLoaded)
            if (countToLoad <= countLoaded) {
              obs.complete()
            }
            // }}, 5000)
          }
          img.onerror = () =>{
            console.error('Image load error on ', img.src)
            obs.error('err on image load')
          }
        }
      }
      // symbols
      console.log("Load all symbols...")
      for (let i = 0; i < that.nomi_simboli.length; i++) {
        let seed = that.nomi_simboli[i]
        card_fname = `${folder_fullpath}01_${seed}.png`
        let img = new Image()
        img.src = card_fname
        countToLoad += 1
        img.onload = () => {
          console.log('Image Loaded: ', img.src);
          let symb = new createjs.Bitmap(img);
          that.symbols_card[i] = symb
          countLoaded += 1
          obs.next(countLoaded)
          if (countToLoad <= countLoaded) {
            obs.complete()
          }
        }
      }
      // background
      let container = new createjs.Container();
      let img = new Image()
      let bmp
      img.src = "assets/images/table/table.png"
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

        that.scene_background = container
        countLoaded += 1
        obs.next(countLoaded)
        if (countToLoad <= countLoaded) {
          obs.complete()
        }
      }
      that.current_deck_type = folder
    })
    return obsLoader
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
    for (let i = 0; i < this.nomi_simboli.length; i++) {
      let cd = this.symbols_card[i]
      cd.x = i * 50
      cd.y = lasty
      lasty = cd.y
      cd.rotation = -90
      container.addChild(cd)
    }

    return container
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
