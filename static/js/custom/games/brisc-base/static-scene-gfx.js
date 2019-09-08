
// function partial(aFunction, ...parametersBound) {
//   return function (...parametersUnBound) {
//     return aFunction(...parametersBound, ...parametersUnBound)
//   }
// }

// function renderStatic(childFn, siblingFn){
//   let child = childFn()
//   return `<div>${child}<div>`
// }

export function CreateDiv(clname) {
  let div = document.createElement("div")
  div.className = clname
  return div
}


export function CreateSceneBuilder(cardgfxCache) {
  console.log('Create html for the static scene')
  let rootDiv = CreateDiv("staticScene")

  return function (...parameters) {
    for (let i = 0; i < parameters.length; i += 2) {
      let childDiv = parameters[i]
      let arr_args = parameters[i + 1]
      rootDiv.appendChild(childDiv(cardgfxCache, arr_args))
    }
    
    return rootDiv
  }
  
  /*
<div class="staticScene">
<div class="handMe">
  <div class="cardHand" data-card="_As"></div>
  <div class="cardHand" data-card="_3s"></div>
  <div class="cardHand" data-card="_4d"></div>
</div>
<div class="handCpu">
  <div class="cardDecked1" ></div>
  <div class="cardDecked2" ></div>
  <div class="cardDecked3" ></div>
</div>
<div class="deck" data-count="33"></div>
<div class="briscola" data-card="_7b"></div>
<div class="takenMe" data-count="2"></div>
<div class="takenCpu" data-count="0"></div>
<div class="segniScore" >
  <div class="playerName1" data-name="Cpu"></div>
  <div class="playerName2" data-name="Me"></div>
  <div class="playerScore1" data-name="0"></div>
  <div class="playerScore2" data-name="0"></div>
</div>
<div class="playerOnGame1" data-name="Cpu">
  <div class="playerOnturn"></div>
</div>
<div class="playerOnGame2" data-name="Me"></div>
<div class="cardPLayed">
  <div class="card1" data-card="_As"></div>
  <div class="card2" data-card=""></div>
</div>
</div>
*/
}

export function LoadAssets(cardLoader, deck_name, cbLoaded) {
  console.log("Load images for ", deck_name)
  if (!deck_name) {
    throw new Error('deck name not set')
  }
  let totItems = -1
  cardLoader.loadResources(deck_name)
    .subscribe(x => {
      if (totItems === -1) {
        totItems = x
        console.log("Expect total items to load: ", x)
        return
      }
    },
      (err) => {
        console.error("Load error", err)
      }, () => {
        console.log("Load Completed")
        let cache = cardLoader.getLoaded(deck_name)
        cbLoaded(cache)
      })
}

export function CreatePlayerLabel(color, player, cardgfxCache){
  let eleA = document.createElement("div")
    eleA.className = `ui ${color} image label`
    
    let avatarImg = cardgfxCache.get_avatar_img(player._avatar_name)
    if(avatarImg){
      eleA.appendChild(avatarImg)  
    }
    eleA.appendChild(document.createTextNode(player._name))
    let divDet = CreateDiv("detail")
    divDet.appendChild(document.createTextNode(player._avatar_detail))
    eleA.appendChild(divDet)
    return eleA
}

export function AnimateHandMe(boardNode, carte,cardgfxCache, obs, deck_info, handleCLickMe) {
  let newhand = []
  let decked = []

  carte.forEach((lbl, i) => {
    let cardInHand = CreateDiv(`cardHand pos${i}`)
    cardInHand.setAttribute("data-card", lbl)

    let aniDecked = CreateDiv(`aniDeck`)
    aniDecked.style.left = -200 + 'px'
    aniDecked.style.top = -200 + 'px'
    let imgDeck = cardgfxCache.get_symbol_img('cope')
    aniDecked.appendChild(imgDeck)
    decked.push(aniDecked)

    let card_info = deck_info.get_card_info(lbl)
    let img = cardgfxCache.get_cardimage(card_info.ix)
    img.classList.add("front-face")
    img.style.visibility = "hidden"
    let imgCope = cardgfxCache.get_symbol_img('cope')
    imgCope.classList.add("back-face")
    imgCope.style.visibility = "hidden"

    cardInHand.appendChild(imgCope)
    cardInHand.appendChild(img)
    newhand.push(cardInHand)
  })
  // update handme div
  let handMeDiv = document.getElementsByClassName("handMe")[0]
  // cleanup
  while (handMeDiv.firstChild) {
    handMeDiv.removeChild(handMeDiv.firstChild)
  }
  newhand.forEach((card) => {
    handMeDiv.appendChild(card)
    card.addEventListener("click", () => handleCLickMe(card), false)
  })
  // animate hand me
  let trCount = [0, 0, 0]
  decked.forEach((e, i) => {
    boardNode.appendChild(e)
    console.log('Subscribe to transition end on ', e)
    e.addEventListener("transitionend", (tr) => {
      // transation is on top end left (2 transactions)
      trCount[i] += 1;
      if (trCount[i] >= 2) {
        console.log('Animation distrib hand me end: ', tr, e)
        let backface = newhand[i].getElementsByClassName("back-face")[0]
        backface.style.visibility = "visible"
        let frontface = newhand[i].getElementsByClassName("front-face")[0]
        frontface.style.visibility = "visible"

        boardNode.removeChild(e) // ani card non serve più
        newhand[i].classList.add("flip")
        obs.next(i)
      }
    })
    setTimeout(() => { // timeout per il dom render
      let x_dest = handMeDiv.offsetLeft + newhand[i].offsetLeft
      let y_dest = handMeDiv.offsetTop + newhand[i].offsetTop
      e.style.left = x_dest + 'px'
      e.style.top = y_dest + 'px'
      //console.log('e is now on :', e.style.left, e.style.top)
    }, 0)
  })
}

export function  AnimateHandCpu(boardNode, cardgfxCache, obs, num_of_cards_onhandplayer) {
  console.log('Animate hand cpu')
  let deckedCpu = []
  let newHandCpu = []
  for (let i = 0; i < num_of_cards_onhandplayer; i++) {
    let cardInHandCpu = CreateDiv(`cardDecked pos${i}`)
    let aniDecked = CreateDiv(`aniDeck`)
    aniDecked.style.left = -200 + 'px'
    aniDecked.style.top = -200 + 'px'
    let imgDeck = cardgfxCache.get_symbol_img('cope')
    aniDecked.appendChild(imgDeck)
    deckedCpu.push(aniDecked)

    let imgCope = cardgfxCache.get_symbol_img('cope')
    imgCope.style.visibility = "hidden"
    cardInHandCpu.appendChild(imgCope)

    newHandCpu.push(cardInHandCpu)
  }

  let handCpuDiv = document.getElementsByClassName("handCpu")[0]
  // cleanup
  while (handCpuDiv.firstChild) {
    handCpuDiv.removeChild(handCpuDiv.firstChild)
  };

  newHandCpu.forEach((e) => {
    handCpuDiv.appendChild(e)
  })

  // Animate hand cpu
  let trCountCpu = [0, 0, 0]
  deckedCpu.forEach((e, i) => {
    boardNode.appendChild(e)

    e.addEventListener("transitionend", (tr) => {
      // transation is on top end left (2 transactions)
      trCountCpu[i] += 1;
      if (trCountCpu[i] >= 2) {
        console.log(`Animation ${i} distrib hand CPU end: `, tr, e)
        let backface = newHandCpu[i].firstChild
        backface.style.visibility = "visible"
        obs.next(i)

        boardNode.removeChild(e) // ani card non serve più
      }
    })

    setTimeout(() => { // timeout per il dom render
      let x_dest = handCpuDiv.offsetLeft + newHandCpu[i].offsetLeft
      let y_dest = handCpuDiv.offsetTop + newHandCpu[i].offsetTop
      e.style.left = x_dest + 'px'
      e.style.top = y_dest + 'px'
      //console.log(`cpu ix ${i} is now on :`, e.style.left, e.style.top)

    }, 300)
  })
}

export function MePlayerGxc(cardgfxCache, arr_args) {
  let playerDiv = CreateDiv("player playerMe")
  let eleA = CreatePlayerLabel("blue", arr_args[0], cardgfxCache)
  playerDiv.appendChild(eleA)

  return playerDiv
}

export function CpuPlayerGxc(cardgfxCache, arr_args) {
  let playerDiv = CreateDiv("player playerCpu")
  let eleA = CreatePlayerLabel("yellow", arr_args[0], cardgfxCache)
  playerDiv.appendChild(eleA)
  return playerDiv
}

export function HandMeGxc(cardgfxCache, arr_args) {
  console.log('Create Handme')
  let playerMe = arr_args[0]
  let deck_info = arr_args[1]
  let handleCLickMe = arr_args[2]
  let core_data = arr_args[3]
  let handMeDiv = CreateDiv("handMe")
  let numCards = core_data.getNumCardInHand(playerMe._name)
  for (let i = 0; i < numCards; i++) {
    let cardInHand = scCreateDiv(`cardHand pos${i}`)
    let lbl = core_data.getCardInHand(playerMe._name, i)
    cardInHand.setAttribute("data-card", lbl)
    let card_info = deck_info.get_card_info(lbl)
    let img = cardgfxCache.get_cardimage(card_info.ix)
    cardInHand.appendChild(img)
    handMeDiv.appendChild(cardInHand)
    cardInHand.addEventListener("click", () => handleCLickMe(cardInHand), false)
  }
  return handMeDiv
}

export function HandCpuGxc(cardgfxCache, arr_args) {
  let playerCpu = arr_args[0]
  let core_data = arr_args[1]
  let numCards = core_data.getNumCardInHand(playerCpu._name)
  let handCpu = CreateDiv("handCpu")
  for (let i = 0; i < numCards; i++) {
    let cardInHand = CreateDiv(`cardDecked pos${i}`)
    let img = cardgfxCache.get_symbol_img('cope')
    cardInHand.appendChild(img)
    handCpu.appendChild(cardInHand)
  }
  return handCpu
}

export function  ClearBoard(boardNode) {
  while (boardNode.firstChild) {
    boardNode.removeChild(boardNode.firstChild);
  }
}
