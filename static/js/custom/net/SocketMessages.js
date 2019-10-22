export const MessageType = {
  Info: 1,
  Ver: 2,
  User: 3,
  List2: 4,
  Chat: 5,
  Join: 6,
  InGame: 7,
  GameStatus: 8
}

export class VerMessage {
  constructor(){
    this.cmd = ""
    this.MajorVer = 0
    this.MinVer = 0
  }
  
  parseDetails(details) {
    let vers = details.split(".");
    this.MajorVer = parseInt(vers[0], 10);
    this.MinVer = parseInt(vers[1], 10);
  }

  msgType(){
    return MessageType.Ver;
  }

  toString(){
    return this.cmd + ':' + this.MajorVer.toString() + '.' + this.MinVer.toString();
  }
}

export class InfoMessage {
  constructor(){
    this.cmd = ""
    this.info = "0"
  }

  msgType() {
    return MessageType.Info;
  }

  toString() {
    return this.cmd + ':' + this.info;
  }
}
