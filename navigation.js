(function() {
'use strict';

let title = [],
    inner = [],
    styles = ['master', 'headers', 'inner'],
    container = document.getElementById('container'),
    clientWidth = window.innerWidth,
    clientHeight = window.innerHeight,
    activePanel,
    rafPending = false,
    initialTouchPos,
    lastTouchPos;

window.onresize = function() {
  clientWidth = window.innerWidth;
  clientHeight = window.innerHeight;
};

// #### PANEL DECLARATION START
function Panel(num, url) {
  'use strict';
  this.num = num;
  let panel = this;
  let content = this.content = document.createElement('div');
  content.classList.add('card');
  content.style.transform = 'translate('+clientWidth+'px,0)'

  let xhr = this.xhr = getURL(url);
  xhr.then(function(response) {
    content.innerHTML = response;
    container.appendChild(content);
  }).catch(console.error);

  if(window.PointerEvent) {
    //Add Pointer event listener
    content.addEventListener('pointerdown',   this.handleGestureStart.bind(this), false);
    content.addEventListener('pointermove',   this.handleGestureMove.bind(this), false);
    content.addEventListener('pointerup',     this.handleGestureEnd.bind(this), false);
    content.addEventListener('pointercancel', this.handleGestureEnd.bind(this), false);

  } else {
    // Add Touch Listener
    content.addEventListener('touchstart',  this.handleGestureStart.bind(this), false);
    content.addEventListener('touchmove',   this.handleGestureMove.bind(this), false);
    content.addEventListener('touchend',    this.handleGestureEnd.bind(this), false);
    content.addEventListener('touchcancel', this.handleGestureEnd.bind(this), false);

    // Mouse listener
    content.addEventListener('mousedown',   this.handleGestureStart.bind(this), false);
  }

  this.pos = {x:null, y:null};
  this.vScroll = false;
}

Panel.prototype.handleGestureStart = function (evt) {
  evt.preventDefault();
  if(evt.touches && evt.touches.length > 1) return;

  this.pos.x = 0;

  console.log('Gesture start at:', this.num);

  if(window.PointerEvent) {
    evt.target.setPointerCapture(evt.pointerId);
  } else {
    document.addEventListener('mousemove', this.handleGestureMove.bind(this), false);
    document.addEventListener('mouseup', this.handleGestureEnd.bind(this), false);
  }

  initialTouchPos = getGesturePointFromEvent(evt);
};

Panel.prototype.handleGestureMove = function (evt) {
  evt.preventDefault();
  if(rafPending) return;
  if(!initialTouchPos) return;

  lastTouchPos = getGesturePointFromEvent(evt);

  rafPending = true;
  window.requestAnimationFrame(this.onAnimFrame.bind(this));
};


Panel.prototype.handleGestureEnd = function (evt) {
  if(evt.touches && evt.touches.length > 0) return;

  if(window.PointerEvent) {
    evt.target.releasePointerCapture(evt.pointerId);
  } else {
    document.removeEventListener('mouseup', this.handleGestureEnd.bind(this), false);
    document.removeEventListener('mousemove', this.handleGestureMove.bind(this), false);
  }

  this.subclassGestureEnd();
  initialTouchPos = null;
};

Panel.prototype.onAnimFrame = function() {
  console.error('No onAnimFrame defined');
}

Panel.prototype.subclassGestureEnd = function () {};

Panel.prototype.transformTo = function(x, y)  {
  let content = this.content;
  this.pos.x = x = +x || 0;
  this.pos.y = y = +y || 0;
  let style = 'translateX('+x+'px) translateY('+y+'px)'
  content.style.webkitTransform = style;
  content.style.MozTransform = style;
  content.style.msTransform = style;
  content.style.transform = style;
};

Panel.prototype.next = function () {
  let nextPanel = title[this.num + 1];
  nextPanel.realign(0);
  nextPanel.content.style.zIndex = 1;
  this.realign(-1);
  this.content.style.zIndex = '';
};

Panel.prototype.prev = function () {
  let prevPanel = title[this.num - 1];
  prevPanel.realign(0);
  prevPanel.content.style.zIndex = 1;
  this.realign(1);
  this.content.style.zIndex = '';
};

Panel.prototype.realign = function (x, y) {
  x = x || 0;
  y = y || 0;
  let panel = this;
  anime({
    targets: panel.content,
    translateX: clientWidth * x,
    translateY: clientHeight * y,
    duration: 250,
    easing: 'easeOutQuad',
    complete: function() {
      panel.pos.x = clientWidth * x;
      panel.pos.y = clientHeight * y;
    }
  });
};

Panel.prototype.jump = function (y) {
  let innerPanel = inner[this.num];
  let titlePanel = title[this.num];

  if(titlePanel === this) {
    innerPanel.realign(0);
    innerPanel.content.style.zIndex = 1;
    this.realign(0, -1)
  } else {
    titlePanel.realign(0);
    titlePanel.content.style.zIndex = 1;
    this.realign(0, 1);
  }

  this.content.style.zIndex = ''
};
// #### PANEL DECLARATION END




// #### TITLE DECLARATION START
function Title(num, url) {
  'use strict';
  Panel.call(this, num, url);

  let content = this.content;
  if(num === 0) this.xhr.then(function() { content.style.zIndex = 1; });
}
Title.prototype = Object.create(Panel.prototype);

Title.prototype.onAnimFrame = function () {

  if(!rafPending) return;
  if(!initialTouchPos) { rafPending = false; return; }

  let content = this.content;
  let vScroll = this.vScroll;

  let nextPanel = title[this.num + 1];
  let prevPanel = title[this.num - 1];
  let innerPanel = inner[this.num];

  let xDiff = initialTouchPos.x - lastTouchPos.x;
  let yDiff = initialTouchPos.y - lastTouchPos.y;

  if(yDiff < 0) yDiff = 0;
  if(!prevPanel && xDiff < 0) xDiff = 0;
  if(!nextPanel && xDiff > 0) xDiff = 0;

  if(vScroll) {
    this.vScroll = vScroll = !(Math.abs(xDiff) > Math.abs(yDiff) * 2 + 20);
  } else {
    if(innerPanel) this.vScroll = vScroll = (Math.abs(yDiff) > Math.abs(xDiff) * 2 + 20);
  }


  if(vScroll) {
    if(innerPanel)  {
      innerPanel.transformTo(0, -yDiff + clientHeight);
      this.transformTo(0, -yDiff);
    }
  } else {
    if(nextPanel) nextPanel.transformTo(-xDiff + clientWidth);
    if(prevPanel) prevPanel.transformTo(-xDiff - clientWidth);
    this.transformTo(-xDiff, 0);
  }

  rafPending = false;
};

Title.prototype.subclassGestureEnd = function () {
  if(this.vScroll) {
    if(Math.abs(this.pos.y) > Math.abs(clientHeight/8)) {
      this.jump(this.pos.y);
    } else {
      this.realign();
      console.log('test');
    }
  } else {
    if(this.pos.x < -clientWidth/5) {
      this.next();
    } else if(this.pos.x > clientWidth/5) {
      this.prev();
    } else {
      this.realign();
    }
  }
};
// #### TITLE DECLARATION END




// #### INNER DECLARATION START
function Inner(num, url) {
  'use strict';
  Panel.call(this, num, url);
  let content = this.content;
  content.style.height = 'initial';
  this.vScroll = true;

  // TODO: Scroll tracker with variable size based on scrollHeight prop
  // updates onAnimFrame
}
Inner.prototype = Object.create(Panel.prototype);

Inner.prototype.onAnimFrame = function() {
  if(!rafPending) return;
  if(!initialTouchPos) { rafPending = false; return; }

  let content = this.content;
  let vScroll = this.vScroll;

  let nextPanel = title[this.num + 1];
  let prevPanel = title[this.num - 1];
  let titlePanel = title[this.num];

  let xDiff = initialTouchPos.x - lastTouchPos.x;
  let yDiff = initialTouchPos.y - lastTouchPos.y;

  if(yDiff > clientHeight) yDiff = clientHeight;
  if(!prevPanel && xDiff < 0) xDiff = 0;
  if(!nextPanel && xDiff > 0) xDiff = 0;

  if(vScroll) {
    this.vScroll = vScroll = !(Math.abs(xDiff) > Math.abs(yDiff) * 2 + 20);
  } else {
    this.vScroll = vScroll = (Math.abs(yDiff) > Math.abs(xDiff) * 2 + 20);
  }


  if(vScroll) {
    if(titlePanel) titlePanel.transformTo(0, this.pos.y - yDiff - clientHeight);
    this.transformTo(0, this.pos.y - yDiff);
    initialTouchPos = lastTouchPos;
  } else {
    if(nextPanel) nextPanel.transformTo(-xDiff + clientWidth);
    if(prevPanel) prevPanel.transformTo(-xDiff - clientWidth);
    this.transformTo(-xDiff, 0);
  }
  rafPending = false;
};

Inner.prototype.subclassGestureEnd = function () {
  if(this.vScroll) {
    if(this.pos.y > 0) {
      if(this.pos.y > clientHeight / 5) {
        this.jump(this.pos.y);
      } else {
        this.realign();
      }
    }
  } else {
    if(this.pos.x < -clientWidth / 5) {
      this.next();
    } else if(this.pos.x > clientWidth / 5) {
      this.prev();
    } else {
      this.realign();
    }
  }
};

// #### INNER DECLARATION END


function getGesturePointFromEvent(evt) {
  let point = {};

  if(evt.targetTouches) {
    point.x = evt.targetTouches[0].clientX;
    point.y = evt.targetTouches[0].clientY;
  } else {
    point.x = evt.clientX;
    point.y = evt.clientY;
  }
  return point;
}

function getURL(url) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          resolve(xhr.response)
        } else {
          reject(xhr.response + ' - ' + xhr.status + ' ' + xhr.statusText);
        }
      }
    }
    xhr.send(null);
  });
}

for (let i = 0; i < 2; i++) {
  title.push(new Title(i, './' + i + '-t.html'));
}

for (let i = 0; i < 2; i++) {
  let innerPanel = new Inner(i, './' + i + '-i.html');
  innerPanel.xhr.then(function() {
    inner[i] = innerPanel;
  }).catch(function() {
    inner[i] = null;
  });
}

for (let i = 0; i < styles.length; i++) {
  let stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './' + styles[i] + '.css';
  document.head.appendChild(stylesheet);
}

title[0].content.style.transform = '';

}());
