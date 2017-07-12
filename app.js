/**
Basic grammar:
  "F": move forward
  "+" rotate right
  "-" rotate left
  "[" save location
  "]" recall location
  Starting with only the +,-, and F
  example to work off of: ff+[f-f-f]-[-f+f+f]
  another: FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]
  another: F-F++F-F++F-F++F-F++F-F++F-F

*/

d3.select("#svg-container").append("svg:svg").attr("width", 600).attr("height", 600).attr("id", "svg");

let system = {
  iterations: 0,
  constants: null,
  axiom: null,
  r1: null,
  r2: null,
  angle: null
}

class LSystem{
  constructor(system){
    this.system = Object.assign({}, system);
    //convert angle to a radians
    this.angle = system.angle ? (system.angle*2*Math.PI)/360 : (60*2*Math.PI)/360;
    this.iterations = system.iterations > 0 ? system.iterations : 1;
    this.res = system.axiom;
    this.lines = [];
    this.dir = 0;
    this.length = 10;
    this.head = {x:150,y:250}
    this.locationStack = [];
    let rule1 = this.system.r1.split("=");
    this.rule1 = {t: rule1[0],v:rule1[1]}

    this.xDim = {min:this.head.x,max:this.head.x}
    this.yDim = {min:this.head.y,max:this.head.y}
  }

  runIterationsAndReturnLines(count = this.iterations){
    for(let i = 0; i< count; i++){
      console.log("iteration " + i+1)
      this.res = this.iterate();
    }
    return this.generateLines(this.res);
  }

  iterate(str = this.res){
    let acc = ""
    //takes the res string and applies the rules
    str.split("").forEach((el)=>{
      if(el===this.rule1.t) {acc+=this.rule1.v}
      else{acc+=el}
    })
    console.log(acc);
    return acc
  }

  //the rendering function
  generateLines(str=this.res){
    str.split("").forEach((el,i)=>{
      if(el==="+") this.dir += this.angle;
      if(el==="-") this.dir -= this.angle;
      if(el==="[") this.locationStack.push(Object.assign({}, this.head));
      if(el==="]") this.head = this.locationStack.pop();
      if(el==="F" || el==="f") {
        //create line from current position to next, then move the current pos to next

        let nextX = this.head.x + this.length*Math.cos(this.dir);
        let nextY = this.head.y + this.length*Math.sin(this.dir);

        this.lines.push(
          {
            x1:this.head.x,
            y1:this.head.y,
            x2: nextX,
            y2: nextY
          }
        )
        this.head.x = nextX;
        this.head.y = nextY;

        if(this.head.x < this.xDim.min) this.xDim.min = this.head.x;
        if(this.head.x > this.xDim.max) this.xDim.max = this.head.x;
        if(this.head.y < this.yDim.min) this.yDim.min = this.head.y;
        if(this.head.y > this.yDim.max) this.yDim.max = this.head.y;

      }
    })
    return this.lines
  }

  render(data = this.lines,ctx = "body"){
    //lets find which direction has the greatest difference.
    let diffX = this.xDim.max - this.xDim.min;
    let diffY = this.yDim.max - this.yDim.min;
    let midX = diffX/2;
    let midY =diffY/2;
    //useful because now I can translate to the middle of both and add it to the values below
    //then find out out much is outside the window and scale appropriately



    d3.select("#svg").selectAll("line").data(data).enter()
    .insert("line")
    .attr("stroke", "rgba(0,0,0,0.3)")
    .attr("x1", (d,i)=>d.x1-midX)
    .attr("x2", (d,i)=>d.x2-midX)
    .attr("y1", (d,i)=>d.y1-midY)
    .attr("y2", (d,i)=>d.y2-midY)
  }
}

$("#system-form").on("submit", function(e){
  e.preventDefault();
  $("input").each(function(index, field){
    system[field.name] = field.value;
  });

  let l = new LSystem(system);
  let lines = l.runIterationsAndReturnLines();
  l.render(l.lines,"#svg");
  console.log(l)

});
