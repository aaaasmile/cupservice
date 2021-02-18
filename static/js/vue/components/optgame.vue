<template>
  <v-dialog v-model="dialogopt" persistent max-width="300">
    <v-card>
      <v-card-title class="headline">{{ titleMsg }}</v-card-title>
      <v-main>
        <v-container>
          <v-row justify="center">
            <v-list dense nav>
              <v-list-item
                v-for="option in options"
                :key="option.caption"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ option.caption }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-row>
        </v-container>
      </v-main>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="confirmOptGame">OK</v-btn>
        <v-btn color="green darken-1" text @click="dialogopt = false"
          >Annulla</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>