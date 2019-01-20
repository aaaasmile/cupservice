
function partial(aFunction, ...parametersBound) {
  return function (...parametersUnBound) {
    return aFunction(...parametersBound, ...parametersUnBound)
  }
}

// function renderStatic(childFn, siblingFn){
//   let child = childFn()
//   return `<div>${child}<div>`
// }

function createDiv(clname) {
  let div = document.createElement("div")
  div.className = clname
  return div
}

export function BuildStaticSceneHtml(cardgfxCache) {
  console.log('Create html for the static scene')
  let rootDiv = createDiv("staticScene")
  
  let handMeDiv = createDiv("handMe")
  for(let i = 0; i < 3; i++){
    let cardInHand = createDiv("cardHand")
    cardInHand.setAttribute("data-card", `_As`) // TOD set from core
    let img = cardgfxCache.get_cardimage(10)
    cardInHand.appendChild(img)
    handMeDiv.appendChild(cardInHand)
  } 

  rootDiv.appendChild(handMeDiv)
  return rootDiv

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