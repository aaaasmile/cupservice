import { DeckInfo } from './shared/deck-info.js'
import { CoreStateManager } from './core/core-state-manager.js'
import { RndMgr } from './shared/rnd-mgr.js'
import { CoreDataSupport } from './core/core-data-support.js'
import { TableStateCore } from './shared/table-state-core.js'
import { Player } from './shared/player.js'
import { CoreCaller } from './shared/core-caller.js'
import { CoreStateStore } from './core/core-state-store.js'
import { CoreStateSubjectSubscriber } from './core/core-state-subject-subscriber.js'
import { ActorStateSubjectSubscriber } from './shared/actor-state-subject-subscriber.js'
import { CoreBriscolaBase } from './games/brisc-base/core-brisc-base.js'
import { AlgBriscBase } from './games/brisc-base/alg-brisc-base.js'

// A me servono gli oggetti esportati nei moduli anche nelle librerie stadard, come ad esempio gli spec
// di jasmine, che viene usata direttamente. In queste spec, non si può usare import, allora metto
// gli oggetti che mi servono in cup. cup funzionana da namespace e lo metto in windows.cup, che non avviene di 
// default, ma lo devo fare eplicitamente in SpecRunner.html.

export const cup = {
  DeckInfo: DeckInfo,
  CoreStateManager: CoreStateManager,
  RndMgr: RndMgr,
  CoreDataSupport: CoreDataSupport,
  TableStateCore: TableStateCore,
  Player: Player,
  CoreCaller: CoreCaller,
  CoreStateStore: CoreStateStore,
  CoreStateSubjectSubscriber: CoreStateSubjectSubscriber,
  ActorStateSubjectSubscriber: ActorStateSubjectSubscriber,
  CoreBriscolaBase: CoreBriscolaBase,
  AlgBriscBase: AlgBriscBase
};

// intellisense in vscode non funziona se metto pattern per isolare oggetti privati. Gli oggetti privati hanno la lettera iniziale minuscola
// Per avere poi l'intellisense anche nei miei fiels di spec (unit test di jasmine) ho messo la dir di test come sottodirectory di questa.
