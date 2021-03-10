import { AlgBriscBase } from '../alg-brisc-base.js'
import Helper from '../../../shared/helper.js'

export class AlgBriscScoperta extends AlgBriscBase {
    constructor(name, deckinfo, level) {
        super(name, deckinfo, level)
        this._cards_on_opp = []
        this._top_deck = null
    }

    on_pl_ev_brisc_new_giocata(args) {
        super.on_pl_ev_brisc_new_giocata(args)

        this._cards_on_opp = [];
        args.carte_opp.forEach(card => {
            this._cards_on_opp.push(card);
        });
        this._top_deck = args.top_deck
    }

    on_pl_ev_pesca_carta(args) {
        super.on_pl_ev_pesca_carta(args)

        this._top_deck = args.top_deck
        this._cards_on_opp.push(args.carte_opp[0]);
        this._num_cards_on_deck -= this._players.length;
    }

    minmax(position, deph, alpha, beta, maximizingplayer) {
        if (deph === 0 || this.is_giocata_end(position)) {
            return static_evalposition(position)
        }
        if (maximizingplayer) {
            let maxeval = -255
            for (let index = 0; index < position.children.length; index++) {
                const child = position.children[index];
                const myeval = this.minmax(child, deph - 1, alpha, beta, !maximizingplayer)
                maxeval = Math.max(maxeval, myeval)
                alpha = Math.max(alpha, maxeval)
                if (beta <= alpha) {
                    break;
                }
            };
            return maxeval
        } else {
            let mineval = 255
            for (let index = 0; index < position.children.length; index++) {
                const child = position.children[index];
                const myeval = this.minmax(child, deph - 1, alpha, beta, !maximizingplayer)
                mineval = Math.min(mineval, myeval)
                beta = Math.min(beta, mineval)
                if (beta <= alpha) {
                    break;
                }
            };
            return mineval
        }
    }

    is_giocata_end(position) {
        return position._cards_on_hand.length === 1;
    }

    play_as_master_first() {
        console.log('Scuperta ALG - first ')
        const card = this.play_minmax(super.play_as_master_first())
        return card
    }

    play_as_master_second() {
        console.log('Scuperta ALG - second ')
        const card = this.play_minmax(super.play_as_master_second())
        return card
    }

    play_minmax(best_choice_card) {
        const position = { score: 0, children: [], _cards_on_hand: [] }
        // TODO Start evaluating the position using the best_choice_card
        const score = this.minmax(position, 4, -255, +255, true)
        for (let index = 0; index < position.children.length; index++) {
            const child = position.children[index];
            if (child.score === score) {
                return this._cards_on_hand[index]
            }
        }
        throw (new Error(`Something is worng with minmax algorithm. TODO??`))
    }

}