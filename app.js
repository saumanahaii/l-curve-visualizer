/**
Basic grammar:
  "F": move forward
  "+" rotate right
  "-" rotate left
  "[" save location
  "]" recall location
*/

let urlArguments = window.location.search.substring(1).split("&");


let lSystem;

let system = {
  iterations: 0,
  constants: null,
  axiom: null,
  r1: null,
  r2: null,
  angle: null,
  rules: [],
  dimensions: {x: 600, y:600}
}

d3.select("#svg-container").append("svg:svg").attr("width", system.dimensions.x).attr("height", system.dimensions.y).attr("id", "svg").attr("transform","rotate(-90)");

class LSystem{
  constructor(system){
    this.system = Object.assign({}, system);
    //convert angle to a radians
    this.angle = system.angle ? (system.angle*2*Math.PI)/360 : (60*2*Math.PI)/360;
    this.iterations = system.iterations > 0 ? system.iterations : 1;
    this.res = system.axiom;
    this.lines = [];
    this.dir = 0;
    this.length = 20;
    this.head = {x:0,y:0}
    this.locationStack = [];
    this.rules = system.rules;
    this.xDim = {min:this.head.x,max:this.head.x}
    this.yDim = {min:this.head.y,max:this.head.y}
  }

  runIterationsAndReturnLines(count = this.iterations){
    for(let i = 0; i< count; i++){
      this.res = this.iterate(this.res);
    }
    return this.generateLines(this.res);
  }

  iterate(str = this.res){
    let acc = ""
    //takes the res string and applies the rules
    str.split("").forEach((el)=>{
      let ruleApplied = false;
      for(let i=0; i< this.rules.length; i++){
        let rule = this.rules[i];

          if(el === rule.t){
            ruleApplied = true;
            acc += rule.v;
          }else{

            if(i>= this.rules.length-1 && !ruleApplied) acc += el;
          }
      }

    })
    return acc;
  }

  //the rendering function
  generateLines(str=this.res){
    str.split("").forEach((el,i)=>{
      if(el==="+") this.dir += this.angle;
      else if(el==="-") this.dir -= this.angle;
      else if(el==="[") this.locationStack.push(Object.assign({}, this.head, {dir: this.dir}));
      else if(el==="]"){
        let prev = this.locationStack.pop();
        this.head = prev;
        this.dir = prev.dir;
      }
      else if(["s","d","f","g"].indexOf(el) !== -1) {
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

        if(this.head.x < this.xDim.min) this.xDim.min = this.head.x;
        if(this.head.x > this.xDim.max) this.xDim.max = this.head.x;
        if(this.head.y < this.yDim.min) this.yDim.min = this.head.y;
        if(this.head.y > this.yDim.max) this.yDim.max = this.head.y;

        this.head.x = nextX;
        this.head.y = nextY;

      }
    })
    return this.lines;
  }

  render(data = this.lines,ctx = "body"){
    //lets find which direction has the greatest difference.
    let diffX = this.xDim.max - this.xDim.min;
    let diffY = this.yDim.max - this.yDim.min;
    let scaleFactor = diffX > diffY ? 600/diffX : 600/diffY;
    let midX = (diffX/2);
    let midY =(diffY/2);
    console.log(`scaleFactor:${scaleFactor}`)
    //useful because now I can translate to the middle of both and add it to the values below
    //then find out out much is outside the window and scale appropriately



    d3.select("#svg").selectAll("line").data(data).enter()
    .insert("line")
    .attr("stroke", "rgba(0,0,0,0.3)")
    .attr("x1", (d,i)=>(d.x1*scaleFactor)-(this.xDim.min*scaleFactor))
    .attr("x2", (d,i)=>(d.x2*scaleFactor)-(this.xDim.min*scaleFactor))
    .attr("y1", (d,i)=>(d.y1*scaleFactor)-(this.yDim.min*scaleFactor))
    .attr("y2", (d,i)=>(d.y2*scaleFactor)-(this.yDim.min*scaleFactor));
  }
}

$("#system-form").on("submit", function(e){
  d3.select("#svg").selectAll("*").remove();
  system = {
    iterations: 0,
    constants: null,
    axiom: null,
    r1: null,
    r2: null,
    angle: null,
    rules: []
  }

  //declare a accumulator for the url bar
  let acc = "";
  e.preventDefault();
  $("input").each(function(index, field){
    if(field.name[0]=== "r"){
      let rule = field.value.toLowerCase().split("=");
      system.rules.push({t:rule[0],v:rule[1]})
    }
    if(typeof field.value === "string") field.value = field.value.toLowerCase();
    system[field.name] = field.value;
    //stick it in the address bar
    acc+= `${field.name}~${field.value}`
  });
//  window.history.pushState()
//console.log(window.history);

  lSystem = new LSystem(system);
  let lines = lSystem.runIterationsAndReturnLines();
  lSystem.render(lSystem.lines,"#svg");
  console.dir(lSystem)
});
