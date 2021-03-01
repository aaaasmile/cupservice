import { CoreBriscolaBase } from '../core-brisc-base.js'

export class CoreBriscolaScoperta extends CoreBriscolaBase {
    constructor(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points) {
        super(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points)
    }
}