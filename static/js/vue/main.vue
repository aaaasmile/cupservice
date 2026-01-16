<template>
  <v-app class="grey lighten-4">
    <Navbar v-show="!IsOnGame"/>
    <v-main class="mx-4 mb-4" id="reffull">
      <router-view id="refcont"></router-view>
    </v-main>
    <v-footer v-show="!IsOnGame">
      <div class="caption">
        {{ new Date().getFullYear() }} —
        <span>Buildnr: {{Buildnr}}</span> - 
        <span>I contenuti di questo sito sono perlopiù parole al vento. By IgorRun for <a href="https://invido.it/">invido.it</a>.</span>
      </div>
    </v-footer>
  </v-app>
</template>