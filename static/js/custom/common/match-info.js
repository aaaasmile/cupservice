
//////////////////////////////////////////
//////////////////////////////// MatchInfo
//////////////////////////////////////////
export class MatchInfo {
  constructor() {
    this.match_state = '';
    this.score = [];
    this.end_reason = '';
    this.winner_name = '';
  }

  start() {
    this.match_state = 'Started';
    this.score = [];
    this.end_reason = '';
    this.winner_name = '';
  }
}