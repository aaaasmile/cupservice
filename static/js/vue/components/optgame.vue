<template>
  <v-dialog v-model="dialogopt" persistent max-width="300">
    <v-card>
      <v-card-title class="headline">{{titleMsg}}</v-card-title>
      <v-main>
        <v-container>
          <v-row justify="center">
            <v-col>
                Numero dei segni
            </v-col>
          </v-row>
        </v-container>
      </v-main>
      <v-card-actions>
        <v-btn color="green darken-1" text @click="confirmOptGame">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>