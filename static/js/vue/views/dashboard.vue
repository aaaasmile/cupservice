<template>
  <v-row justify="center">
    <v-col xs="12" sm="12" md="10" lg="8" xl="6">
      <v-card flat tile>
        <v-card-title>Partita a {{ selGame }} </v-card-title>
        <v-content>
          <v-row align-stretch justify="center" id="pixi"></v-row>
        </v-content>
        <v-card-actions>
          <v-btn @click="playGame" :loading="loadinggame">
            Gioca
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>