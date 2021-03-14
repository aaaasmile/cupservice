import { DeckInfo } from '../../../shared/deck-info.js'
import { RndMgr } from '../../../shared/rnd-mgr.js'

function removeItemOnce(arr, value) {
    if (!value) {
        return arr
    }
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    } else {
        throw (new Error(`Don not expect to remove an item that is not found ${value}`))
    }
    return arr;
}

function removeItems(arr, arrval) {
    arrval.forEach(element => {
        arr = removeItemOnce(arr, element)
    });
    return arr
}

const AlgPosition = (cards_on_hand, cards_on_opp, top_deck, briscola, card_taken, card_opp_taken, points_me, points_opp, card_mano_played, is_max) => {
    let _score = 0
    const _children = []
    const _cards_on_hand = cards_on_hand.slice()
    const _cards_on_opp = cards_on_opp.slice()
    const _top_deck = top_deck
    const _briscola = briscola
    const _card_taken = card_taken.slice()
    const _card_opp_taken = card_opp_taken.slice()
    const _card_mano_played = card_mano_played.slice()
    const _points_me = points_me
    const _points_opp = points_opp
    const _is_maximizingplayer = is_max
    const _cards_on_child = []

    const _deck_info = new DeckInfo
    _deck_info.deck_info_dabriscola();
    const _rnd_mgr = new RndMgr
    let _deck_remain = _deck_info.get_cards_on_game()
    _deck_remain = removeItemOnce(_deck_remain, _top_deck)
    _deck_remain = removeItemOnce(_deck_remain, _briscola)
    _deck_remain = removeItems(_deck_remain, _cards_on_hand)
    _deck_remain = removeItems(_deck_remain, _cards_on_opp)
    _deck_remain = removeItems(_deck_remain, _card_taken)
    _deck_remain = removeItems(_deck_remain, _card_mano_played)
    _deck_remain = removeItems(_deck_remain, _card_opp_taken)

    const _utilized_cards = _cards_on_hand.length + _cards_on_opp.length + _card_taken.length
        + _card_mano_played.length + _card_opp_taken.length
    if (_utilized_cards < 40) {
        if (_deck_remain.length > 0) {
            _deck_remain = _rnd_mgr.get_deck(_deck_remain) // Question: each position shuffle the deck?
        }
        _deck_remain = [_top_deck].concat(_deck_remain)
        _deck_remain.push(_briscola)
    }

    console.log('*** AlgPosition ', _deck_remain.length, _utilized_cards, _cards_on_hand, _cards_on_opp, _card_mano_played)

    return {
        build_position(best_choice_card) {
            console.log('Build position starting with ', best_choice_card)
            const cards_to_play = []
            if (best_choice_card) {
                cards_to_play.push(best_choice_card)
            }
            _cards_on_hand.forEach(card_lbl => {
                if (card_lbl !== best_choice_card) {
                    cards_to_play.push(card_lbl)
                }
            });

            cards_to_play.forEach(card_lbl => {
                _cards_on_child.push(card_lbl)
                const stateNext = this.me_play_card(card_lbl)
                const child = AlgPosition(
                    stateNext.cards_on_hand,
                    stateNext.cards_on_opp,
                    stateNext.top_deck,
                    stateNext.briscola,
                    stateNext.card_taken,
                    stateNext.card_opp_taken,
                    stateNext.points_me,
                    stateNext.points_opp,
                    stateNext.card_mano_played,
                    stateNext.is_max
                )
                _children.push(child)
            });

        },
        me_play_card(card_lbl) {
            console.log('** play a card ', card_lbl, _is_maximizingplayer)
            let stateNext = {}
            if (_card_mano_played.length === 0) {
                // me playing first, next ist the opponet: swap player
                stateNext.cards_on_hand = _cards_on_opp
                stateNext.cards_on_opp = removeItemOnce(_cards_on_hand.slice(), card_lbl)
                stateNext.top_deck = _top_deck
                stateNext.briscola = _briscola
                stateNext.card_taken = _card_opp_taken
                stateNext.card_opp_taken = _card_taken
                stateNext.points_me = _points_opp
                stateNext.points_opp = _points_me
                stateNext.card_mano_played = [card_lbl]
                stateNext.is_max = !_is_maximizingplayer
                return stateNext
            }
            // me playing second
            const copy_deck_remain = _deck_remain.slice()
            let first_card_on_deck = null
            let second_card_on_deck = null
            let next_top_deck = null
            if (copy_deck_remain.length > 0) {
                first_card_on_deck = copy_deck_remain[0]
                copy_deck_remain.splice(0, 1);
            }
            if (copy_deck_remain.length > 0) {
                second_card_on_deck = copy_deck_remain[0]
                copy_deck_remain.splice(0, 1);
            }
            if (copy_deck_remain.length > 0) {
                next_top_deck = copy_deck_remain[0]
            }
            const points_cards_played = this.calc_cards_points([card_lbl, _card_mano_played[0]])

            if (this.is_me_play_win_mano(card_lbl, _card_mano_played[0])) {
                // me is still on turn
                stateNext.cards_on_hand = removeItemOnce(_cards_on_hand.slice(), card_lbl)
                if (first_card_on_deck) {
                    stateNext.cards_on_hand.push(first_card_on_deck)
                }
                stateNext.cards_on_opp = _cards_on_opp.splice()
                if (second_card_on_deck) {
                    stateNext.cards_on_opp.push(second_card_on_deck)
                }
                stateNext.top_deck = next_top_deck
                stateNext.briscola = _briscola
                stateNext.card_taken = _card_taken.slice()
                stateNext.card_taken.push(_card_mano_played[0])
                stateNext.card_taken.push(card_lbl)
                stateNext.card_opp_taken = _card_opp_taken
                stateNext.points_me = _points_me + points_cards_played
                stateNext.points_opp = _points_opp
                stateNext.card_mano_played = []
                stateNext.is_max = _is_maximizingplayer
                return stateNext
            }
            // opponent wins mano, swap player
            stateNext.cards_on_hand = _cards_on_opp.slice()
            if (first_card_on_deck) {
                stateNext.cards_on_hand.push(first_card_on_deck)
            }
            stateNext.cards_on_opp = removeItemOnce(_cards_on_hand.slice(), card_lbl)
            if (second_card_on_deck) {
                stateNext.cards_on_opp.push(second_card_on_deck)
            }
            stateNext.top_deck = next_top_deck
            stateNext.briscola = _briscola
            stateNext.card_taken = _card_opp_taken.slice()
            stateNext.card_taken.push(_card_mano_played[0])
            stateNext.card_taken.push(card_lbl)
            stateNext.card_opp_taken = _card_taken

            stateNext.points_me = _points_opp + points_cards_played
            stateNext.points_opp = _points_me
            stateNext.card_mano_played = []
            stateNext.is_max = !_is_maximizingplayer

            return stateNext
        },
        is_me_play_win_mano(me_card, opp_first_play_lbl) {
            const card_opp_info = _deck_info.get_card_info(opp_first_play_lbl);
            const card_me_info = _deck_info.get_card_info(me_card);
            const card_info_briscola = _deck_info.get_card_info(_briscola)
            if (card_opp_info.segno === card_info_briscola.segno &&
                card_me_info.segno !== card_info_briscola.segno) {
                return false
            }
            if (card_me_info.segno === card_info_briscola.segno &&
                card_opp_info.segno !== card_info_briscola.segno) {
                return true
            }
            if (card_opp_info.segno !== card_me_info.segno) {
                return false
            }
            if (card_opp_info.rank < card_me_info.rank) {
                return true
            }
            return false
        },
        calc_cards_points(arr_cards) {
            let points = 0
            arr_cards.forEach(card_lbl => {
                const card_info = _deck_info.get_card_info(card_lbl);
                points += card_info.points
            });
            return points

        },
        get_card_on_score(score) {
            for (let index = 0; index < _children.length; index++) {
                const child = _children[index];
                if (child.get_score() === score) {
                    return _cards_on_child[index]
                }
            }
            throw (new Error(`Something is worng with minmax algorithm`))
        },
        get_score() {
            return _score
        },
        is_last_card_toplay() {
            return _cards_on_hand.length === 1;
        },
        static_evalposition() {
            console.log('Static evaluate position')
            if (_points_me > 60) {
                _score = 100000
            } else {
                _score = 0
            }
            _score += _card_taken.length
            _score += _points_me * 3
            _score -= _card_opp_taken.length
            _score -= _points_opp * 2
            const points_to_win = 61 - _points_me
            if (points_to_win < 10) {
                _score += (10 - points_to_win) * 3
            }
            _cards_on_hand.forEach(card_lbl => {
                const cardinfo = _deck_info.get_card_info(card_lbl)
                _score += cardinfo.points
                if (_briscola[2] === card_lbl[2]) {
                    _score += 10
                }
            });
            _card_taken.forEach(card_lbl => {
                const cardinfo = _deck_info.get_card_info(card_lbl)
                if (_briscola[2] === card_lbl[2]) {
                    _score -= (5 + cardinfo.points)
                }
                if (card_lbl[1] === 'A') { _score += 100; }
                if (card_lbl[1] === '3') { _score += 70; }
            });
            _card_opp_taken.forEach(card_lbl => {
                const cardinfo = _deck_info.get_card_info(card_lbl)
                if (_briscola[2] === card_lbl[2]) {
                    _score += 4 + cardinfo.points
                }
                if (card_lbl[1] === 'A') { _score -= 60; }
                if (card_lbl[1] === '3') { _score -= 40; }
            });
            console.log('Position score: ', _score)
            return _score
        },
        set_score_from_bestchild(score) {
            _score = score
        },
        get_num_children() {
            return _children.length
        },
        get_child(index) {
            return _children[index]
        },
        is_maximizingplayer() {
            return _is_maximizingplayer
        }
    }
}

export default AlgPosition;