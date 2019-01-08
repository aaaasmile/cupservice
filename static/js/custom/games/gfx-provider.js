import { BriscBaseGfx } from './brisc-base/brisc-base-gfx.js'

class GfxProvider {
  constructor() {
    console.log('GfxProvider created')
    this.map_games = new Map()
  }

  getGameInstance(gameCode) {
    let gfx = this.map_games.get(gameCode)
    if (!gfx) {
      switch (gameCode) {
        case 'off-briscindue':
          gfx = new BriscBaseGfx()
          break
        default:
          console.error('Game code not recognized', gameCode)
      }
      this.map_games.set(gameCode, gfx)
    }
    return gfx
  }
}

let provider
function getGfxProvider() {
  if (!provider) {
    provider = new GfxProvider()
  }
  return provider
}

export function GetGfxGameInstance(gameCode) {
  const _prov = getGfxProvider()
  return _prov.getGameInstance(gameCode)
}