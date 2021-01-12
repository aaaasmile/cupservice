<template>
  <v-col>
    <v-card :loading="loading" class="mx-auto my-12" max-width="374">
      <template slot="progress">
        <v-progress-linear
          color="deep-purple"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>

      <v-img
        height="250"
        src="static/assets/images/bar_cooperativa.jpg"
      ></v-img>

      <v-card-title>Il bar della Cuperativa</v-card-title>

      <v-card-text>
        <v-row align="center" class="mx-0">
          <v-rating
            :value="4.5"
            color="amber"
            dense
            half-increments
            readonly
            size="14"
          ></v-rating>

          <div class="grey--text ml-4">4.5 (413)</div>
        </v-row>

        <div class="my-4 subtitle-1">$ • Cuperativa Italian Cafe</div>

        <div>
          Posto trnaquillo nell'amabile
          <a href="https://invido.it/bredacisoni/index.html" target="_blank"
            >Breda Cisoni</a
          >, dove viene servito, tra l'altro, un caffè corretto di alta qualità.
          Ambiente che offre spazi riservati di calma e relax.
        </div>
      </v-card-text>

      <v-divider class="mx-4"></v-divider>

      <v-card-title>Disponibilità attuale</v-card-title>

      <v-card-text>
        <v-chip-group
          v-model="selection"
          active-class="deep-purple accent-4 white--text"
          column
        >
          <v-chip>5:30PM</v-chip>

          <v-chip>7:30PM</v-chip>

          <v-chip>8:00PM</v-chip>

          <v-chip>9:00PM</v-chip>
        </v-chip-group>
      </v-card-text>

      <v-card-actions>
        <v-btn color="deep-purple lighten-2" text @click="reserve">
          Prenota
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="mx-auto" color="#26c6da" dark max-width="400">
      <v-card-title>
        <v-icon large left> mdi-twitter </v-icon>
        <span class="title font-weight-light">Twitter</span>
      </v-card-title>

      <v-card-text class="headline font-weight-bold">
        "Entra nel locale ed ordina a voce alta, ma ferma. Mentre nessuno ti
        ascolterà, la porta sembrerà quasi socchiusa."
      </v-card-text>

      <v-card-actions>
        <v-list-item class="grow">
          <v-list-item-avatar color="grey darken-3">
            <v-img
              class="elevation-6"
              alt=""
              src="https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light"
            ></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              ><a
                href="https://invido.it/Igor-sarzi-sartori.html"
                target="_blank"
                >Boia Canaia</a
              ></v-list-item-title
            >
          </v-list-item-content>

          <v-row align="center" justify="end">
            <v-icon class="mr-1"> mdi-heart </v-icon>
            <span class="subheading mr-2">256</span>
            <span class="mr-1">·</span>
            <v-icon class="mr-1"> mdi-share-variant </v-icon>
            <span class="subheading">45</span>
          </v-row>
        </v-list-item>
      </v-card-actions>
    </v-card>

    <v-divider class="mx-4"></v-divider>

    <v-card class="mx-auto" max-width="344">
      <v-card-text>
        <div>Al bancone</div>
        <p class="display-1 text--primary">
          Ancora alla ricerca di maggiorni informazioni su questo sito?
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="deep-purple accent-4" @click="moreinfo">
          Learn More
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>