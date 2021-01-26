<template>
  <v-dialog v-model="dialogConta" persistent max-width="300">
    <v-card>
      <v-card-title class="headline">Conta le carte</v-card-title>
      <v-main>
        <v-container>
          <v-row justify="center">
            <v-col>
              <v-img src="./static2/carte/piac/01_basto.png"> </v-img>
            </v-col>
            <v-col>
              <v-img src="./static/assets/images/symbols/01_vuoto_trasp.png">
              </v-img>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
      <v-card-actions>
        <v-btn icon  @click="prevCard">
          <v-icon>mdi-skip-previous-circle-outline</v-icon>
        </v-btn>
        <v-btn icon @click="nextCard">
          <v-icon>mdi-skip-next-circle-outline</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="confirmConta">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>