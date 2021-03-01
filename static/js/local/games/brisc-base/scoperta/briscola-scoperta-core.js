import { CoreBriscolaBase } from '../core-brisc-base.js'

export class CoreBriscolaScoperta extends CoreBriscolaBase {
    constructor(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points) {
        super(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points)
    }

    get_opp_name(player) {
        for (let index = 0; index < this._core_data.players.length; index++) {
            const element = this._core_data.players[index];
            if (element !== player) {
                return element
            }
        }
    }

    st_new_giocata() {
        console.log('Scoperta st_new_giocata')
        this._coreStateStore.set_state('st_new_giocata');
        let cards = this._deck_info.get_cards_on_game();
        cards = this._rnd_mgr.get_deck(cards);
        let first_player_ix = this._rnd_mgr.get_first_player(this._core_data.players.length);
        this._core_data.start_new_giocata(first_player_ix, cards);
        this.distribute_cards();
        this._core_data.players.forEach(player => {
            let data_newgioc = {
                carte: this._core_data.carte_in_mano[player], //{'Luigi': ['_Ab','_7c']} 
                carte_opp: this._core_data.carte_in_mano[this.get_opp_name(player)],
                top_deck: this._core_data.mazzo_gioco[this._core_data.mazzo_gioco.length - 1],
                brisc: this._briscola_in_tav_lbl,
                num_card_deck: this._deck_info.get_numofcards_ondeck() - 1 - this._core_data.carte_in_mano[player].length * this._core_data.players.length,
            };
            this._coreStateManager.fire_to_player(player, 'ev_brisc_new_giocata', data_newgioc);
        });
        this._coreStateManager.submit_next_state('st_new_mano');
    }
}