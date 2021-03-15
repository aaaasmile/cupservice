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

    on_all_ev_player_has_played(args) {
        super.on_all_ev_player_has_played(args)
        const card = args.card_played[0]

        if (args.player_name !== this._player_name) {
            this._cards_on_opp = this._cards_on_opp.filter(x => x !== card)
        }
    }

    on_pl_ev_pesca_carta(args) {
        super.on_pl_ev_pesca_carta(args)

        this._top_deck = args.top_deck
        this._cards_on_opp.push(args.carte_opp[0]);
        this._num_cards_on_deck -= this._players.length;
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

        const score_info = this.minmax(position, 6, -255, +255, true)
        if(score_info.seq.length === 0){
            throw (new Error(`Wrong algorithm minmax`))
        }
        const card = score_info.seq[0]
        console.log('Best card score: ', card, score_info)
        return card
    }

    minmax(position, deph, alpha, beta, maximizingplayer) {
        if (deph === 0 || position.is_last_card_toplay()) {
            return position.static_evalposition()
        }
        if (position.get_num_children() === 0) {
            position.build_position()
        }

        if (maximizingplayer) {
            let maxeval = -12255000
            let mymaxeval_info
            for (let index = 0; index < position.get_num_children(); index++) {
                const child = position.get_child(index);
                mymaxeval_info = this.minmax(child, deph - 1, alpha, beta, child.is_maximizingplayer())
                child.set_score_from_bestchild(mymaxeval_info)
                maxeval = Math.max(maxeval, mymaxeval_info.score)
                alpha = Math.max(alpha, maxeval)
                if (beta <= alpha) {
                    break;
                }
            };
            return {
                score: maxeval,
                seq: mymaxeval_info.seq
            }
        } else {
            let mineval = 12255000
            let mymineval_info
            for (let index = 0; index < position.get_num_children(); index++) {
                const child = position.get_child(index);
                mymineval_info = this.minmax(child, deph - 1, alpha, beta, child.is_maximizingplayer())
                child.set_score_from_bestchild(mymineval_info)
                mineval = Math.min(mineval, mymineval_info.score)
                beta = Math.min(beta, mineval)
                if (beta <= alpha) {
                    break;
                }
            };
            return {
                score: mineval,
                seq: mymineval_info.seq
            }
        }
    }

}