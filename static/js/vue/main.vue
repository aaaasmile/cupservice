<template>
  <v-app class="grey lighten-4">
    <Navbar />
    <v-content class="mx-4 mb-4" id="reffull">
      <router-view id="refcont"></router-view>
    </v-content>
    <v-footer>
      <div class="caption">
        {{ new Date().getFullYear() }} —
        <span>Buildnr: {{Buildnr}}</span>
      </div>
    </v-footer>
  </v-app>
</template>