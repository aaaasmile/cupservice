import { CoreBriscolaBase } from '../core-brisc-base.js'

export class CoreBriscolaScoperta extends CoreBriscolaBase {
    constructor(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points) {
        super(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points)

        // NOTE this is a test code to a predifined deck
        console.warn('Using a predifend deck')
        this._rnd_mgr.set_predefined_deck('_3s,_5c,_6b,_6c,_Ad,_Fb,_As,_3b,_Cd,_4c,_Fd,_5d,_4b,_6s,_5s,_2b,_Cs,_Fs,_7c,_Cb,_Rc,_7d,_2s,_5b,_7b,_Ab,_3d,_7s,_4d,_Rd,_2c,_2d,_Fc,_Ac,_3c,_Rb,_6d,_Rs,_4s,_Cc')
        this._rnd_mgr.set_predefined_player(0)
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

    st_pesca_carta() {
        console.log('st_pesca_carta in scuperta gfx');
        this._coreStateStore.set_state('st_pesca_carta');
        let brisc_tav_available = true;
        if (this._core_data.mazzo_gioco.length <= 0) {
            throw (new Error('Deck is empty, programming error'));
        }
        const info_pesca = {}
        let first = undefined
        this._core_data.round_players.forEach(player => {
            if (!first){
                first = player
            }
            let carte_player = [];
            if (this._core_data.mazzo_gioco.length > 0) {
                carte_player.push(this._core_data.mazzo_gioco.pop());
            } else if (brisc_tav_available) {
                carte_player.push(this._briscola_in_tav_lbl);
                brisc_tav_available = false;
            } else {
                throw (new Error('Briscola already assigned, programming error'));
            }
            carte_player.forEach(c => {
                this._core_data.carte_in_mano[player].push(c)
            });
            if (this._core_data.carte_in_mano[player].length > this._core_data.num_of_cards_onhandplayer) {
                throw (new Error('To many cards in hand player ' + player));
            }
            info_pesca[player] = carte_player
        });

        let top_deck = undefined
        if (this._core_data.mazzo_gioco.length > 0) {
            top_deck = this._core_data.mazzo_gioco[this._core_data.mazzo_gioco.length - 1]
        }
        this._core_data.players.forEach(player => {
            const data_cartapesc = {
                carte: info_pesca[player],
                carte_opp: info_pesca[this.get_opp_name(player)],
                top_deck: top_deck,
                first: first,
            }
            this._coreStateManager.fire_to_player(player, 'ev_pesca_carta', data_cartapesc);
        })


        console.log('Mazzo rimanenti: ' + this._core_data.mazzo_gioco.length);
        this._coreStateManager.submit_next_state('st_new_mano');
    }
}