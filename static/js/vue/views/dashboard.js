import API from '../apicaller.js'
var introAnim;
var stars = [];
var t = 0;

export default {
  data() {
    return {
      loadinggame: false,
      selName: 'Mario',
      selGame: 'Briscola',
      is_mobile: false,
      appWidth: 0,
      appHeight: 0,
    }
  },
  created() {
    console.log('Created')
  },
  mounted() {
    console.log('Mounted')
   
    this.appWidth = (document.getElementById('refw')).offsetWidth
    this.appHeight = (document.getElementById('reffull')).offsetHeight
    this.appHeight -= (document.getElementById('refcont')).offsetHeight

    this.appHeight = 600
    
    let c_left = (document.getElementById('pixi').offsetWidth - this.appWidth) / 2
    let c_top = document.getElementById('pixi').offsetTop
    console.log("Coordinates: ", c_left, c_top, this.appWidth, this.appHeight)

    //this.appHeight = (document.getElementById('refcont')).offsetHeight

    // 1. Create a Pixi renderer and define size and a background color
    introAnim = new PIXI.Application({
      width: this.appWidth,
      height: this.appHeight,
      // change background color to blue
      backgroundColor: "0x000000"
    });

    // 2. Append canvas element to the body
    document.getElementById('pixi').appendChild(introAnim.view);

    var wW = this.appWidth,
      wH = this.appHeight,
      cw = this.appWidth / 2,
      ch = this.appHeight / 2;

    var minX = c_left + wW / 4 ,
      maxX = minX + cw,
      minY = c_top +  wH / 4,
      maxY = minY + ch;

    console.log(wH, minY, maxY);

    var animSpeed = 0.05;
    var increase = (Math.PI * 2) / 800;
    var c = 0;

    var starNumber = 500,
      starSize = 2,
      starY = 0,
      starX = 0,
      starAlpha = 1,
      starScale = 1,
      starSpeed = 1;

    // 3. Create a container that will hold your scene
    var container = new PIXI.Container();

    introAnim.stage.addChild(container);

    var i;
    for (i = 0; i < starNumber; i++) {
      // 4b. Create a circle
      var star = new PIXI.Graphics();

      // define fill of our circle
      star.beginFill(0xffffff, 1);

      starSize = Math.random() * 2 + 0.75;
      star.animSpeed = Math.random() * 1;
      star.aDirection = 0;
      star.cDirection = 0;

      star.tint = Math.random() * 0xffffff;
      star.tintTo = star.tint;
      starX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      starY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

      star.initX = starX;
      star.initY = starY;

      star.dix = starX - cw;
      star.diy = starY - ch;
      star.angle = (Math.atan2(star.diy, star.dix) * 180) / Math.PI;
      star.radians = Math.atan2(star.diy, star.dix);

      // draw circle (x, y, radius)
      star.drawCircle(starX, starY, starSize);

      stars.push(star);

      container.addChild(star);
    }

    // Listen for animate update
    introAnim.ticker.add(function (delta) {
      animSpeed = Math.abs(Math.cos(c)) * 15 + Math.pow(Math.PI, Math.atan(c));

      t++;

      for (var i = 0; i < stars.length; i++) {
        var star = stars[i];

        var b = star.getBounds();

        if (
          b.x > this.appWidth ||
          b.x < 0 ||
          b.y > this.appHeight ||
          b.y < 0
        ) {
          star.x = 0;
          star.y = 0;
        } else {
          star.x += Math.cos(star.radians) * star.animSpeed * animSpeed;
          star.y += Math.sin(star.radians) * star.animSpeed * animSpeed;
        }
      }
    });
  },
  computed: {
    ...Vuex.mapState({

    })
  },
  methods: {
    playGame() {
      console.log("Play game")
      introAnim.stop();
    }
  },
  template: `
  <v-row justify="center">
    <v-col xs="12" sm="12" md="10" lg="8" xl="6">
      <v-card color="grey lighten-4" flat tile>
        <v-toolbar flat dense>
          <v-toolbar-title class="subheading grey--text"></v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="playGame" :loading="loadinggame" v-on="on">
                <v-icon>airplay</v-icon>
              </v-btn>
            </template>
            <span>Play game</span>
          </v-tooltip>
        </v-toolbar>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">
              <v-text-field id="refw"
                v-model="selName"
                label="Select a name"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-card flat tile>
                <v-card-title>Partita a {{ selGame }} </v-card-title>
                <v-content>
                  <v-col cols="12">
                    <v-row justify="center" id="pixi"></v-row>
                  </v-col>
                </v-content>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-card>
    </v-col>
  </v-row>
`
}