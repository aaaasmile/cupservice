//////////////////////////////////////////
//////////////////////////////// Player
//////////////////////////////////////////
export class Player {
  constructor(name) {
    this.Name = "Utente" + this.getUserId();
    if (name != null) { this.Name = name; }
    this.Position = 0
  }

  getUserId() {
    return String(Math.random() * 999);
  }
}