import { DeckInfo } from './common/deck-info.js'
import { CoreStateManager } from './common/core/core-state-manager.js'
import { RndMgr } from './common/rnd-mgr.js'
import { CoreDataSupport } from './common/core/core-data-support.js'
import { TableStateCore } from './common/table-state-core.js'
import { Player } from './common/player.js'
import { CoreCaller } from './common/core-caller.js'
import { CoreStateStore } from './common/core/core-state-store.js'
import { CoreStateSubjectSubscriber } from './common/core/core-state-subject-subscriber.js'
import { ActorStateSubjectSubscriber } from './common/actor-state-subject-subscriber.js'
import { CoreBriscolaBase } from './games/brisc-base/core-brisc-base.js'
import { AlgBriscBase } from './games/brisc-base/alg-brisc-base.js'
import { GetGfxGameInstance } from './common/gfx/gfx-provider.js'

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
  AlgBriscBase: AlgBriscBase,
  GetGfxGameInstance: GetGfxGameInstance,
};

// intellisense in vscode non funziona se metto pattern per isolare oggetti privati. Gli oggetti privati hanno la lettera iniziale minuscola
// Per avere poi l'intellisense anche nei miei fiels di spec (unit test di jasmine) ho messo la dir di test come sottodirectory di questa.
