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

    play_as_master_first() {
        console.log('Scuperta ALG - first ')
        let w_cards = [], segno, card_s, curr_w, lisc_val;
        let min_item;
        this._cards_on_hand.forEach(card_lbl => {
            card_s = card_lbl;
            segno = card_s[2];
            curr_w = 0;
            if (card_s[2] === this._briscola[2]) { curr_w += 70; }
            // check if it is an ass or 3
            if (card_s[1] === 'A') { curr_w += 220; }
            if (card_s[1] === '3') { curr_w += 200; }
            if (card_s[1].match(/[24567]/)) {
                // liscio value
                lisc_val = parseInt(card_s[1], 10);
                curr_w += 70 + lisc_val;
            }
            if (card_s[1] === 'F') { curr_w += 60; }
            if (card_s[1] === 'C') { curr_w += 30; }
            if (card_s[1] === 'R') { curr_w += 20; }
            // penalty for cards wich are not catch free, for example a 3
            curr_w += 25 * this._strozzi_on_suite[segno];
            if (this._num_cards_on_deck === 1) {
                // last hand before deck empty
                // if briscola is big we play a big card
                if (card_s[2] === this._briscola[2]) { curr_w += 60; }
                if (this._briscola[1] === 'A' || this._briscola[1] === '3') {
                    if (card_s[1] === 'A') { curr_w -= 220; }
                    if (card_s[1] === '3') { curr_w -= 200; }
                } else if (this._briscola[1] === 'F' || this._briscola[1] === 'C' || this._briscola[1] === 'R') {
                    if (card_s[1] === 'A') { curr_w -= 180; }
                    if (card_s[1] === '3' && this._strozzi_on_suite[segno] === 1) { curr_w -= 160; }
                }
            }
            w_cards.push([card_lbl, curr_w]);
        }); // end weight
        // find a minimum
        min_item = Helper.MinOnWeightItem1(w_cards);
        console.log("[%s] " + 'Play as first: best card ' + min_item[0] + ' (w_cards = ' + w_cards + ')', this._player_name);
        return min_item[0];
    }

    play_as_master_second() {
        console.log('Scuperta ALG - second ')
        let card_avv_s, card_avv_info, max_points_take = 0, max_card_take;
        let min_card_leave, min_points_leave = 120, take_it = [], leave_it = [];
        let card_s, bcurr_card_take, card_curr_info, points;
        let curr_points_me, tot_points_if_take, curr_points_opp, max_card_take_s;
        let card_best_taken_s;

        card_avv_s = this._card_played[0];
        card_avv_info = this._deck_info.get_card_info(this._card_played[0]);
        max_card_take = this._cards_on_hand[0];
        min_card_leave = this._cards_on_hand[0];
        // build takeit leaveit arrays and store max take and min leave
        this._cards_on_hand.forEach(card_lbl => {
            card_s = card_lbl;
            bcurr_card_take = false;
            const curr_card_isbrisc = card_s[2] === this._briscola[2]
            card_curr_info = this._deck_info.get_card_info(card_lbl);
            if (card_s[2] === card_avv_s[2]) {
                //same suit
                if (card_curr_info.rank > card_avv_info.rank) {
                    // current card take
                    bcurr_card_take = true;
                    take_it.push(card_lbl);
                } else {
                    leave_it.push(card_lbl);
                }
            } else if (card_s[2] === this._briscola[2]) {
                // this card is a briscola
                bcurr_card_take = true;
                take_it.push(card_lbl);
            } else {
                leave_it.push(card_lbl);
            }
            // check how many points make the card if it take
            points = card_curr_info.points + card_avv_info.points;
            if (bcurr_card_take && points > max_points_take) {
                max_card_take = card_lbl;
                max_points_take = points;
            }
            // or leave it
            if (!bcurr_card_take && (points < min_points_leave) || (points === min_points_leave && !curr_card_isbrisc)) {
                min_card_leave = card_lbl;
                min_points_leave = points;
            }
        });

        curr_points_me = 0;
        this._team_mates.forEach(name_pl => { curr_points_me += this._points_segno[name_pl]; });
        tot_points_if_take = curr_points_me + max_points_take;
        curr_points_opp = 0;
        this._opp_names.forEach(name_pl => { curr_points_opp += this._points_segno[name_pl]; });

        console.log('play_as_master_second, cards ' + this._cards_on_hand);
        if (take_it.length === 0) {
            //take_it is not possibile, use leave it
            console.log("play_as_master_second, apply R1")
            return min_card_leave;
        }
        if (tot_points_if_take > this._target_points) {
            console.log("play_as_master_second, apply R2");
            return max_card_take;
        }
        max_card_take_s = max_card_take;
        if (max_card_take_s[2] === this._briscola[2]) {
            // card that take is briscola, pay attention to play it
            if (max_points_take >= 20) {
                console.log("play_as_master_second, apply R3");
                return max_card_take;
            }
        } else if (max_points_take >= 10 && this._num_cards_on_deck > 1) {
            // take it because strosa
            console.log("play_as_master_second, apply R4");
            return max_card_take;
        }
        if (min_points_leave === 0) {
            // don't lose any points, leave it
            console.log("play_as_master_second, apply R10");
            return min_card_leave;
        }
        if (this._num_cards_on_deck === 1) {
            // last hand before deck empty
            // if briscola is big we play a big card
            if (this._briscola[1] === 'A' || this._briscola[1] === '3') {
                if (leave_it.length > 0) {
                    console.log("play_as_master_second, apply R9");
                    return min_card_leave;
                } else {
                    // incartato
                    console.log("play_as_master_second, apply R9a");
                    return max_card_take;
                }
            } else if (this._briscola[1] === 'R' || this._briscola[1] === 'C' || this._briscola[1] === 'F') {
                if (min_points_leave <= 4) {
                    console.log("play_as_master_second, apply R8");
                    return min_card_leave;
                }
            }
        }
        if (take_it.length > 0) {
            // we can take it
            if (curr_points_opp > 40 && max_points_take > 0) {
                console.log("play_as_master_second, apply R5");
                return this.best_taken_card(take_it);
            }
            if (min_points_leave > 3 && take_it.length > 1) {
                // leave-it lose points and I have at least two cards for taken -> take it.
                console.log("play_as_master_second, apply R6");
                return this.best_taken_card(take_it);
            }
            if (min_points_leave > 5) {
                card_best_taken_s = this.best_taken_card(take_it);
                if (card_best_taken_s[2] === this._briscola[2]) {
                    // best card is a briscola
                    if (min_points_leave <= 8 && curr_points_opp < 53
                        && (card_best_taken_s[1] === 'A' || card_best_taken_s[1] === '3')) {
                        // taken with A or 3 is too much forced
                        console.log("play_as_master_second, apply R12");
                        return min_card_leave;
                    }
                }
                // leave-it loose to many points
                console.log("play_as_master_second, apply R11");
                return card_best_taken_s;
            }
            card_best_taken_s = this.best_taken_card(take_it);
            if (card_best_taken_s[2] !== this._briscola[2]
                && !card_s[1].match(/[24567]/)) {
                // make points without briscola
                console.log("play_as_master_second, apply R13");
                return card_best_taken_s;
            }
        }
        // at this point we can only leave-it
        console.log("play_as_master_second, apply R7");
        return min_card_leave;
    }


}