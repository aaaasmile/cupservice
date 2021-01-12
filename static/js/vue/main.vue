<template>
  <v-app class="grey lighten-4">
    <Navbar />
    <v-main class="mx-4 mb-4" id="reffull">
      <router-view id="refcont"></router-view>
    </v-main>
    <v-footer>
      <div class="caption">
        {{ new Date().getFullYear() }} —
        <span>Buildnr: {{Buildnr}}</span> - 
        <span>I contenuti di questo sito sono perlopiù parole al vento.</span>
      </div>
    </v-footer>
  </v-app>
</template>