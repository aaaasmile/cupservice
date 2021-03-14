import { AlgBriscBase } from '../alg-brisc-base.js'
import AlgPosition from './alg-position.js'

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
        if (deph === 0 || position.is_last_card_toplay()) {
            return position.static_evalposition()
        }
        if (maximizingplayer) {
            let maxeval = -255
            for (let index = 0; index < position.get_num_children(); index++) {
                const child = position.get_child(index);
                const myeval = this.minmax(child, deph - 1, alpha, beta, child.is_maximizingplayer())
                maxeval = Math.max(maxeval, myeval)
                alpha = Math.max(alpha, maxeval)
                if (beta <= alpha) {
                    break;
                }
            };
            return maxeval
        } else {
            let mineval = 255
            for (let index = 0; index < position.get_num_children(); index++) {
                const child = position.get_child(index);
                const myeval = this.minmax(child, deph - 1, alpha, beta, child.is_maximizingplayer())
                mineval = Math.min(mineval, myeval)
                beta = Math.min(beta, mineval)
                if (beta <= alpha) {
                    break;
                }
            };
            return mineval
        }
    }

    play_as_master_first() {
        console.log('Scuperta ALG - first ')
        const card = this.start_minmax(super.play_as_master_first())
        return card
    }

    play_as_master_second() {
        console.log('Scuperta ALG - second ')
        const card = this.start_minmax(super.play_as_master_second())
        return card
    }

    start_minmax(best_choice_card) {
        const position = AlgPosition(
            this._cards_on_hand,
            this._cards_on_opp,
            this._top_deck,
            this._briscola,
            this._card_taken,
            this._card_opp_taken,
            this._points_segno[this._player_name],
            this._points_segno[this._opp_names[0]],
            this._card_mano_played,
            true
        )
        position.build_position(best_choice_card)

        const score = this.minmax(position, 4, -255, +255, true)
        console.log('Score found ', score)
        const card = position.get_card_on_score(score)
        console.log('Card on score ', card, score)
        return card
    }

    

}