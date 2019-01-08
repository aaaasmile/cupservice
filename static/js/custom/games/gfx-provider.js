import { BriscBaseGfx } from './brisc-base/brisc-base-gfx.js'

export class GfxProvider {
  constructor() {
    console.log('GfxProvider created')
    this.map_games = new Map()
  }
}

let provider
function getGfxProvider() {
  if (!provider) {
    provider = new GfxProvider()
  }
  return provider
}


GfxProvider.getGfxGameInstance = function (gameCode) {
  const _prov = getGfxProvider()
  let gfx = _prov.map_games.get(gameCode)
  if (!gfx) {
    switch (gameCode) {
      case 'off-briscindue':
        gfx = new BriscBaseGfx()
        break
      default:
        console.error('Game code not recognized', gameCode)
    }
    _prov.map_games.set(gameCode, gfx)
  }
  return gfx
}