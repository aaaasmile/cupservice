import { BriscBaseGfx } from './brisc-base/brisc-base-gfx.js'

export function GfxProvider() {
  this.map_games = new Map()
}

GfxProvider.getGameInstance = function (gameCode) {
  let gfx
  switch (gameCode) {
    case 'off-briscindue':
      gfx = new BriscBaseGfx()
      break
    default:
      console.error('Game code not recognized', gameCode)
  }
  return gfx
}