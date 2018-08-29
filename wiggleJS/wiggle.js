'use strict';



class WiggleInstance{
    constructor(configFile, containerId, done){
        var chain = [
            (self)=>{ //f1 - load config file
                this.loadConfig(configFile, (err, config)=>{
                    if (err) throw "[WIGGLE] Error loading config file.";
                    self.config = config;
                    self.config.container = containerId;
                    chain.shift()(self);
                });
            },

            (self)=>{ //f2 - define instance variables
                self.container = document.getElementById(self.config.container);
                self.frameNo = 0;

                chain.shift()(self);
            },

            (self)=>{ //f3 - create canvas
                self.canvas = document.createElement('canvas');
                self.ctx = self.canvas.getContext('2d');

                self.canvas.style.display = 'block';
                self.canvas.style.backgroundColor = self.config.bground;
                self.resizeCanvas();

                self.container.appendChild(self.canvas);
                chain.shift()(self);
            },

            (self)=>{ //f4 - generate initial snake positions
                self.snakes = {};
                self.ghostSnakes = [];
                var modulo = self.config.gridSize + (self.config.snakes.width/2);

                for (var snakeId=0; snakeId<self.config.snakes.amount; snakeId++){
                    var randX = Math.floor(Math.random()*self.canvas.width);
                    var randY = Math.floor(Math.random()*self.canvas.height);

                    var snakeHead = {
                        'x': randX-(randX%modulo),
                        'y': randY-(randY%modulo),
                        'd': self.genDirection(null)
                    }

                    var snake = {
                        'body': [snakeHead]
                    }

                    for (var i=1; i<self.config.snakes.length+1; i++){
                        var prevSegment = snake.body[snake.body.length-1];

                        snake.body[i] = self.genSegment(prevSegment);
                    }
                    self.snakes[snakeId] = snake;
                }

                chain.shift()(self);
            },

            (self)=>{ // f5 - begin rendering snakes
                self.timer = setInterval(()=>{
                    self.render();
                    // clearInterval(self.timer);
                }, 1000/self.config.fps);

                done(self.timer);

            }
        ];
        chain.shift()(this);
    }



    genDirection(prevDir){
        var dir = null;
        if (prevDir != null){
            var invalidDir = prevDir+2;
            if (invalidDir > 3){
                invalidDir -= 4;
            }
            while (dir == null || dir == invalidDir){
                dir = Math.floor(Math.random()*4);
            }
        }else{
            dir = Math.floor(Math.random()*4);
        }
        return dir;
    }

    genSegment(prevSegment){
        var self = this;

        var xPos = prevSegment.x;
        var yPos = prevSegment.y;

        if (prevSegment.d==0){ // UP
            yPos -= self.config.gridSize + (self.config.snakes.width/2);
        }else if(prevSegment.d==2){ // DOWN
            yPos += self.config.gridSize + (self.config.snakes.width/2);
        }else if(prevSegment.d==3){ // LEFT
            xPos -= self.config.gridSize + (self.config.snakes.width/2);
        }else if(prevSegment.d==1){ // RIGHT
            xPos += self.config.gridSize + (self.config.snakes.width/2);
        }

        var dir;
        var valid = false;
        while (!valid){
            valid = true;
            dir = self.genDirection(prevSegment.d);
            if (dir==0 && (yPos-self.config.gridSize) < 0){ // UP
                valid = false;
            }else if (dir==2 && (yPos+self.config.gridSize) > self.canvas.height){ // DOWN
                valid = false;
            }else if (dir==3 && (xPos-self.config.gridSize) < 0){ // LEFT
                valid = false;
            }else if (dir==1 && (xPos+self.config.gridSize) > self.canvas.width){ // RIGHT
                valid = false;
            }
        }

        var segment = {
            'x': xPos,
            'y': yPos,
            'd': dir
        }
        return segment;

    }


    render(){
        var self = this;
        self.frameNo+=1;
        self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
        self.ctx.lineWidth = self.config.snakes.width; // Set every frame incase if canvas resize

        for (var snakeId in self.snakes){
            if (self.snakes.hasOwnProperty(snakeId)){
                var snake = self.snakes[snakeId];

                var prevSegment = snake.body[snake.body.length-1];
                snake.body.push(self.genSegment(prevSegment));

                var oldSegment = snake.body.shift();

                // // HAD TO DISABLE GHOSTS DUE TO HIGH CPU LOAD
                // var newGhost = {
                //     'start': {'x':oldSegment.x, 'y':oldSegment.y},
                //     'end': {'x':snake.body[0].x, 'y':snake.body[0].y}
                // }
                // // only add new ghost if doesn't already exist in ghosts array
                // var match = false;
                // for (var ghost of self.ghostSnakes){
                //     if (ghost.start.x == newGhost.start.x && ghost.start.y == newGhost.start.y){
                //         if (ghost.end.x == newGhost.end.x && ghost.end.y == newGhost.end.y){
                //             match = true;
                //         }
                //     }
                //
                //     var style = "rgba(93,31,251,0.05)";
                //     // var style = "#f0f";
                //     self.ctx.strokeStyle = style;
                //
                //     self.ctx.beginPath();
                //     self.ctx.moveTo(ghost.start.x, ghost.start.y);
                //     self.ctx.lineTo(ghost.end.x, ghost.end.y);
                //     self.ctx.stroke();
                // }
                // if (!match) self.ghostSnakes.push(newGhost);

                self.drawSnake(snake.body);

            }
        }


    }

    drawSnake(snakeBody){
        var self = this;

        for (var i=0; i<snakeBody.length-1; i++){ // for each segment
            var segment = snakeBody[i];

            // STYLE
            var opacity = 1;
            var oneThird = (self.config.snakes.length/3);
            var halfLength = (self.config.snakes.length/2);
            if (i <= oneThird){
                opacity = (i+1)/(oneThird+1);
            }
            var style = "rgba(93,31,251," + opacity + ")";
            self.ctx.strokeStyle = style;


            var startPos = {
                'x':segment.x,
                'y':segment.y
            };
            var endPos = {
                'x':snakeBody[i+1].x,
                'y':snakeBody[i+1].y
            };

            if (segment.d==0){ // UP
                // self.ctx.strokeStyle = "red";
                startPos.y += (self.config.snakes.width/2);
                endPos.y -= (self.config.snakes.width/2);

            }else if (segment.d==2){ // DOWN
                // self.ctx.strokeStyle = "green";
                startPos.y -= (self.config.snakes.width/2);
                endPos.y += (self.config.snakes.width/2);


            }else if (segment.d==3){ // LEFT
                // self.ctx.strokeStyle = "blue";
                startPos.x += (self.config.snakes.width/2);
                endPos.x -= (self.config.snakes.width/2);

            }else if (segment.d==1){ // RIGHT
                // self.ctx.strokeStyle = "yellow";
                startPos.x -= (self.config.snakes.width/2);
                endPos.x += (self.config.snakes.width/2);
            }

            self.ctx.beginPath();
            self.ctx.moveTo(startPos.x, startPos.y);
            self.ctx.lineTo(endPos.x, endPos.y);
            self.ctx.stroke();

        }

    }


    loadConfig(configFile, done){
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType('applications/json');
        xobj.open('GET', configFile, true);
        xobj.onreadystatechange = ()=>{
            if (xobj.readyState == 4 && xobj.status == '200'){
                var json;
                try{
                    json = JSON.parse(xobj.responseText);
                } catch(e){
                    return done(true); // error = true
                }
                return done(null, json);
            }
        }
        xobj.send(null);
    }

    resizeCanvas(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    end(){
        // stop wiggling, terminate it, kill class.
    }
}

function wiggle(configFile, containerId, done){
    var waggle = new WiggleInstance(configFile, containerId, done);
    window.addEventListener('resize', ()=>{ // have to run it like this to ensure DOM context is used for `this`
        waggle.resizeCanvas();
    }, false);
}
