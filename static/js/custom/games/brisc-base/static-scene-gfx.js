
function partial(aFunction, ...parametersBound) {
  return function (...parametersUnBound) {
    return aFunction(...parametersBound, ...parametersUnBound)
  }
}

// function renderStatic(childFn, siblingFn){
//   let child = childFn()
//   return `<div>${child}<div>`
// }

export function CreateDiv(clname) {
  let div = document.createElement("div")
  div.className = clname
  return div
}


export function BuildStaticSceneHtml(cardgfxCache) {
  console.log('Create html for the static scene')
  let rootDiv = CreateDiv("staticScene")

  return function (...parameters) {
    for (let i = 0; i < parameters.length; i++) {
      let childDiv = parameters[i]
      rootDiv.appendChild(childDiv(cardgfxCache))
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
