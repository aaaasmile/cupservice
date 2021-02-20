<template>
  <v-card id="create">
    <v-card-title>Opzioni e preferenze</v-card-title>
    <v-container fluid>
      <v-row class="child-flex">
        <v-col cols="12" sm="6" md="4">
          <v-subheader>Gioco selezionato</v-subheader>
          <v-radio-group v-model="selgame" hide-details>
            <v-radio value="briscola" label="Briscola"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>