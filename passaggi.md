## cup-service
Un service della cuperativa in golang (web socket e rest)
Client basic in react single file.

## Info module
Il gioco della cuperativa l'ho sviluppato usando ES6 con i moduli direttamente in browser.
Non uso nessun webpack, ma è il browser chrome ad assemblare i moduli.
In React dovrebbe essere possibile importare le varie classi usando import (js/custom/**/*).
In index.html non si dovrebbe caricare nulla di games-cup.js.
Nella unit test di Jasmine invece si (vedi /js/custom/test/SpecRunner.html)
dove uso il file games-cup.js per rendere il namespace cup disponibile alla test suite.
L'istruzione script type="module" in SpecRunner.html è il bridge.
I file di spec vanno messi al fianco dell'implementazione delle classi. Il fileSpecRunner.html
va aggiornato manualmente.
I files jsconfig.json mi servono per avere il code complete in VS code.

## TODO
- Nel core manaca la registrazione del game come in cuperativajs (_game_core_recorder)
- Il core della briscola va agganciato alla ui
- La partita della briscola nel core non è completa. Dopo st_mano_end non è finito. Qui
manca il st_game_end dopo aver finito la giocata. [DONE]
- C'è da finire il file games-cup.js il quale va completato usando il games-cup-todo.js [DONE]
- Poi andrebbe testato con una unit test, magari nella directory parallela dove uso node. [DONE Jasmine]
- usa {{.RootUrl}} nel template difianco alla parola static per avere url assolute e non relative al path. 
Con / funziona senza, ma appena aggiungi un sub path, arrivano problemi tipo scripts non caricati.

## Problemi
Ho avuto problemi con i files statici. Specialmente quelli che vanno in module (games-cup.js). 
In questo caso Jasmine (specrunner.html) non va.
Essi devono  essere del tipo application/javascript e non text/plain. Su windows questo mime viene preso 
da HKEY_CLASSES_ROOT\.js\
