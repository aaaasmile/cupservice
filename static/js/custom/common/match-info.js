import { DeckInfo } from './deck-info.js'

//////////////////////////////////////////
//////////////////////////////// MatchInfo
//////////////////////////////////////////
export class MatchInfo {
  constructor() {
    this.match_state = '';
    this.score = [];
    this.end_reason = '';
    this.winner_name = '';
    let aa = new DeckInfo();
  }

  start() {
    this.match_state = 'Started';
    this.score = [];
    this.end_reason = '';
    this.winner_name = '';
  }
}