export class ScoreBoardGfx {
  constructor(z_ord) {
    this._container = new PIXI.Container()
    this._text_team1 = null
    this._text_team2 = null
    this._myGraph = null
    this._isDirty = false
    this.z_ord = z_ord
    this._visible = true
    this._num_marks = 0
  }

  Build(name1, name2, num_marks) {
    this._num_marks = num_marks
    this._myGraph = new PIXI.Graphics();
    this._text_team1 = new PIXI.Text(name1)
    this._text_team2 = new PIXI.Text(name2)
    this._text_team1.style = { fill: "black" }
    this._text_team2.style = { fill: "black" }
    this._container.addChild(this._text_team1);
    this._container.addChild(this._text_team2);
    this._container.addChild(this._myGraph);
    this._isDirty = true
    return this._container
  }

  Render(isDirty) {
    if (!this._visible) {
      this._isDirty = false
      return
    }
    if (this._isDirty || isDirty) {
      //console.log('*** render the scoreboard...')
      let offset_x = 10
      this._text_team1.position.x = offset_x
      this._text_team2.position.x = this._text_team1.x + this._text_team1.width + 30

      const width_text_1 = this._text_team1.width
      const height_text_1 = this._text_team1.height
      const width_text_2 = this._text_team2.width
      const height_text_2 = this._text_team2.height

      const control_width = this._text_team2.position.x + this._text_team2.width + offset_x
      const control_height = 150
      //total segni
      //horizontal under names
      let y1 = height_text_1 + 10
      let y0 = y1
      let x0 = this._text_team1.position.x - offset_x
      let x1 = x0 + control_width
      this._myGraph.lineStyle(1).moveTo(x0, y0).lineTo(x1, y1);
      // middle vertical
      let xv0 = x0 + (x1 - x0) / 2
      let xv1 = xv0
      let yv0 = y1
      let yv1 = control_height - 2
      if (this._num_marks === 2) {
        yv1 = yv0 + 75
      }
      this._myGraph.lineStyle(1).moveTo(xv0, yv0).lineTo(xv1, yv1);

      //empty points raggi
      let off_y = 18
      yv0 = y1 + off_y + 10
      let points_coord = [] // store coordinate for circle
      for (let ix = 0; ix < this._num_marks; ix++) {
        let xs0 = x0 + 25
        let xs1 = x1 - 25
        let ys0 = off_y * ix + yv0
        let ys1 = ys0;
        points_coord.push({ team1: [xs0, ys0], team2: [xs1, ys1] });
        this._myGraph.lineStyle(1).moveTo(xs0, ys0).lineTo(xs1, ys1);
      }
      // TODO: mostra i punti come cerchio ripieno
    }
    this._isDirty = false
  }//end Render

}