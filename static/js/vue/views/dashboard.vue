<template>
  <v-row justify="center">
    <v-col xs="12" sm="12" md="10" lg="8" xl="6">
      <v-card :loading="loadinggame" flat tile>
        <template slot="progress">
          <v-progress-linear
            color="blue darken-4"
            height="10"
            indeterminate
          ></v-progress-linear>
        </template>
        <h3>
          <span v-if="isdesktop">Qui si gioca a:&nbsp;</span>
          {{ SelGameTitle }}!
        </h3>
        <div>
          <div class="grey--text" v-show="IsWaitForStart">
            Premi il pulsante "Gioca" qui sotto per iniziare (scroll laterale)
          </div>
        </div>
        <v-main>
          <v-container>
            <v-row id="pixi"></v-row>
          </v-container>
        </v-main>
        <v-card-actions class="d-flex flex-wrap">
          <v-btn @click="startGame" v-show="IsWaitForStart"> Gioca </v-btn>
          <v-btn @click="doAction1" v-show="Action1Enabled">
            {{ Action1Title }}
          </v-btn>
          <v-btn @click="doAction2" v-show="Action2Enabled">
            {{ Action2Title }}
          </v-btn>
          <v-btn @click="doAction3" v-show="Action3Enabled">
            {{ Action3Title }}
          </v-btn>
          <v-btn @click="doAction4" v-show="Action4Enabled">
            {{ Action4Title }}
          </v-btn>
          <v-btn @click="doAction5" v-show="Action5Enabled">
            {{ Action5Title }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-toolbar flat dense>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click="toggleMute">
                  <v-icon>{{ Muted ? "volume_off" : "volume_mute" }}</v-icon>
                </v-btn>
              </template>
              <span>{{ Muted ? "Unmute" : "Mute" }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  icon
                  @click="gameOptions"
                  v-show="IsWaitForStart"
                >
                  <v-icon>settings</v-icon>
                </v-btn>
              </template>
              <span>Opzioni</span>
            </v-tooltip>
          </v-toolbar>
        </v-card-actions>
        <v-card-text v-if="!isdesktop"
          ><div class="grey--text" v-show="IsWaitForStart">
            Premi il pulsante "Gioca" per iniziare
          </div>
        </v-card-text>
      </v-card>
      <Conta></Conta>
      <Options></Options>
    </v-col>
  </v-row>
</template>