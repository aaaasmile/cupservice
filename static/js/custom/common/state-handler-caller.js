//////////////////////////////////////////
//////////////////////////////// StateHandlerCaller
//////////////////////////////////////////
// Questa classe serve per chiamare le funzioni degli stati all'interno del processor
// Un processor è per esempio CoreBriscolaBase o TableStateCore
// Le funzioni chiamate sono del tipo st_mano_end e vengono chiamate direttamente tramite apply
export class StateHandlerCaller {
  constructor(processor, opt) {
    this._processor = processor //CoreBriscolaBase o TableStateCore
    this.opt = opt
  }

  call(event, name_hand, args) {
    if (this._processor[name_hand] != null) {
      //console.log(args,args instanceof Array);
      if (!(args instanceof Array)) {
        args = [args];
      }
      this._processor[name_hand].apply(this._processor, args);
    } else if (this.opt.log_missed || this.opt.log_all) {
      if (!this._processor.ignore_sate(name_hand)) {
        console.warn(`${event} ignored because handler ${name_hand} is missed. Processor is ${this._processor.constructor.name}`);
      }
    }
  }
}