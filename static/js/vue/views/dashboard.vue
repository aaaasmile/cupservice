<template>
  <v-row justify="center">
    <v-col xs="12" sm="12" md="10" lg="8" xl="6">
      <v-card flat tile>
        <v-card-title class="mx-0">Qui si gioca a: {{ SelGame }}! </v-card-title>
        <v-card-text><div class="grey--text">Premi il pulsante "Gioca" per iniziare</div></v-card-text>
        <v-main>
          <v-container>
            <v-row id="pixi"></v-row>
          </v-container>
        </v-main>
        <v-card-actions>
          <v-btn @click="playGame" :loading="loadinggame"> Gioca </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>