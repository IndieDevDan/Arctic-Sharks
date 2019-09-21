

OverDrive.Stages.MainMenu = (function(stage, canvas, context) {
  
  // Private API
  
  let overdrive = OverDrive.Game.system;
  
  var menuBackground = 'Assets/Images/Menu.png';
  var optionFont = '30pt Courier New';
  
  
  //
  // Public interface
  //
  
  // Factory method
  
  stage.Create = function() {
    
    return new stage.MainMenu();
  }
  
  stage.MainMenu = function() {
    
    var self = this;

    this.transitionLinks = {
      
      mainGame : null,
      config : null,
      highScores : null,
      credits : null
    };
    
    this.setTransition = function(id, target) {
      
      self.transitionLinks[id] = target;
    }
    
    // Exit transition state (picked up by leaveStage)
    this.leaveState = {
      
      id : null,
      params : null
    };

    
    // Main game-state specific variables
    this.backgroundImage = null;
    this.keyDown = null;
    this.selectedOption = -1;
    this.menuOptions = null;
    this.optionMetrics = null;
    this.optionExtent = { maxWidth : 0 };

    
    //
    // Stage interface implementation
    //
    
    // Pre-start stage with relevant parameters
    // Not called for initial state!
    this.preTransition = function(params) {}
    
    this.init = function() {
      
      console.log('main menu init');
      
      if (self.backgroundImage === null) {
      
        self.backgroundImage = new OverDrive.Game.Background(menuBackground);
      }
      
      if (self.keyDown === null) {
      
        self.keyDown = new Array(256);
      }
      
      for (var i=0; i<256; ++i) {
          
        self.keyDown[i] = false;
      }
      
      $(document).on('keyup', self.onKeyUp);
      $(document).on('keydown', self.onKeyDown);
      
      self.selectedOption = -1;
      
// Create menu buttons
      var startButton = document.createElement('button');startButton.setAttribute('type', 'button');
      startButton.setAttribute('class', 'btn btn-default settingsField');startButton.setAttribute('id', 'startButton');
      startButton.appendChild(document.createTextNode('Start Game'));document.getElementById('GameDiv').appendChild(startButton);
      $('#startButton').click(self.StartGame);

      var settingsButton = document.createElement('button');settingsButton.setAttribute('type', 'button');
      settingsButton.setAttribute('class', 'btn btn-default settingsField');settingsButton.setAttribute('id', 'settingsButton');
      settingsButton.appendChild(document.createTextNode('Settings'));document.getElementById('GameDiv').appendChild(settingsButton);
      $('#settingsButton').click(self.Settings);

      var creditsButton = document.createElement('button');creditsButton.setAttribute('type', 'button');
      creditsButton.setAttribute('class', 'btn btn-default settingsField');creditsButton.setAttribute('id', 'creditsButton');
      creditsButton.appendChild(document.createTextNode('Credits'));document.getElementById('GameDiv').appendChild(creditsButton);
      $('#creditsButton').click(self.Credits);
      
      if (self.menuOptions === null) {

        self.menuOptions = [
      
          { optionNumber : overdrive.Keys.K_1, optionText : '', target : 'mainGame' },
          { optionNumber : overdrive.Keys.K_2, optionText : '', target : 'config' },
          { optionNumber : overdrive.Keys.K_4, optionText : '', target : 'credits' }
        ];
      }
      
      if (self.optionMetrics === null) {
      
        context.font = optionFont;
        
        self.optionMetrics = [];
        
        for (var i=0; i < self.menuOptions.length; ++i) {
          
          var textMetrics = context.measureText(self.menuOptions[i].optionText);
          
          self.optionMetrics.push({ width : textMetrics.width });
        
          self.optionExtent.maxWidth = Math.max(self.optionExtent.maxWidth, textMetrics.width);
        }
      }
            
      window.requestAnimationFrame(self.phaseInLoop);
    }
    
    this.phaseInLoop = function() {
      
      window.requestAnimationFrame(self.mainLoop);
    }	
    
this.StartGame = function(){
  self.selectedOption = 0;
}
this.Settings = function(){
  self.DestroyMenu();
  self.selectedOption = 1;
}
this.Credits = function(){
  self.DestroyMenu();
  self.selectedOption = 2;
}

this.DestroyMenu = function(){
  document.getElementById('GameDiv').removeChild(document.getElementById('startButton'));
    document.getElementById('GameDiv').removeChild(document.getElementById('settingsButton'));
    document.getElementById('GameDiv').removeChild(document.getElementById('creditsButton'));
}

    this.mainLoop = function() {
            
      // Update system clock
      overdrive.gameClock.tick();
      
      self.draw();
      
      // Get menu option
      for (var i=0; i<self.menuOptions.length; ++i) {
        
        if (self.keyDown[self.menuOptions[i].optionNumber]) {
          
          console.log(self.menuOptions[i].optionText + ' selected');
          
          self.selectedOption = i;
        }
      }
      
      // Repeat until exit condition met
      if (self.selectedOption == -1) {
      
        window.requestAnimationFrame(self.mainLoop);
      }
      else {
      
        window.requestAnimationFrame(self.initPhaseOut);
      }
    }
    
    this.initPhaseOut = function() {
      
      window.requestAnimationFrame(self.phaseOutLoop);
    }
    
    this.phaseOutLoop = function() {
      
      window.requestAnimationFrame(self.leaveStage);
    }
    
    this.leaveStage = function() {
    
      // Tear-down stage
      $(document).off('keydown');
      $(document).off('keyup');
      
      
      // Setup leave state parameters and target - this is explicit!
      self.leaveState.id = self.menuOptions[self.selectedOption].target;
      self.leaveState.params = { backgroundImage : self.backgroundImage }; // params setup as required by target state
      
      if (self.leaveState.id == 'mainGame') {
        
        self.leaveState.params.level = 1; // Initialise level
      }
      
      var target = self.transitionLinks[self.leaveState.id];
      
      // Handle pre-transition (in target, not here! - encapsulation!)
      target.preTransition(self.leaveState.params);

      // Final transition from current stage
      window.requestAnimationFrame(target.init);
      
      // Clear leave state once done
      self.leaveState.id = null;
      self.leaveState.params = null;
    }
    
    
    // Event handlers
    
    this.onKeyDown = function(event) {
      
      self.keyDown[event.keyCode] = true;
    }
    
    this.onKeyUp = function(event) {
      
      self.keyDown[event.keyCode] = false;
    }
    
    
    // Stage processing functions
    
    this.draw = function() {

      // Draw background        
      if (this.backgroundImage) {
        
        context.globalAlpha = .8;
        this.backgroundImage.draw();
      }
      
      context.globalAlpha = 1;
      context.fillStyle = '#FFF';
      context.font = optionFont;
            
      
      // Left-aligned text
      var baseX = (canvas.width - this.optionExtent.maxWidth) / 2;
      var textY = 250;
      
      for (var i=0; i < this.menuOptions.length; ++i) {
        
        context.fillText(this.menuOptions[i].optionText, baseX, textY);
        
        textY += 50;
      }
    }
    
  };
  
  
  return stage;
  
})((OverDrive.Stages.MainMenu || {}), OverDrive.canvas, OverDrive.context);

