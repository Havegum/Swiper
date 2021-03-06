(function() {
'use strict';

let title = [],
    inner = [],
    container = document.getElementById('container'),
    clientWidth = window.innerWidth,
    clientHeight = window.innerHeight,
    activePanel,
    rafPending = false,
    initialTouchPos,
    ignoreGestureEnd = false,
    lastTouchPos,
    swipes = 0,
    swipeHints = 5;

window.onresize = function() {
  clientWidth = window.innerWidth;
  clientHeight = window.innerHeight;
};

// #### PANEL DECLARATION START
function Panel(obj) {
  this.num = +obj.id;
  this.nav = obj.nav;
  let panel = this;
  let content = this.content = document.createElement('div');
  content.classList.add('card');

  this.xhr = getURL(obj.url);
  this.xhr.then(function(response) {
    let headlessHTML = response.split(/<body[^>]*>/)[1].split('</body>')[0];
    content.innerHTML = headlessHTML;
    container.appendChild(content);
  }).catch(console.error);

  this.handleGestureStart = this.handleGestureStart.bind(this);
  this.handleGestureMove = this.handleGestureMove.bind(this);
  this.handleGestureEnd = this.handleGestureEnd.bind(this);

  if(window.PointerEvent) {
    //Add Pointer event listener
    content.addEventListener('pointerdown',   this.handleGestureStart, false);
    content.addEventListener('pointermove',   this.handleGestureMove, false);
    content.addEventListener('pointerup',     this.handleGestureEnd, false);
    content.addEventListener('pointercancel', this.handleGestureEnd, false);

  } else {
    // Add Touch Listener
    content.addEventListener('touchstart',  this.handleGestureStart, false);
    content.addEventListener('touchmove',   this.handleGestureMove, false);
    content.addEventListener('touchend',    this.handleGestureEnd, false);
    content.addEventListener('touchcancel', this.handleGestureEnd, false);

    // Mouse listener
    content.addEventListener('mousedown',   this.handleGestureStart, false);
  }

  this.pos = { x: null, y: null };
  this.vScroll = false;
}

Panel.prototype.handleGestureStart = function (evt) {
  evt.preventDefault();
  if(evt.target.classList.contains('nav-arrow')) {
    let classList = evt.target.classList;
    if(classList.contains('nav-arrow-right')) {
      this.next();
    } else if(classList.contains('nav-arrow-left')) {
      this.prev();
    } else if (classList.contains('nav-arrow-down')) {
      this.jump();
    }
    ignoreGestureEnd = true;
    return;
  }




  if(evt.touches && evt.touches.length > 1) return;

  this.pos.x = 0;

  if(window.PointerEvent) {
    evt.target.setPointerCapture(evt.pointerId);
  } else {
    document.addEventListener('mousemove', this.handleGestureMove, false);
    document.addEventListener('mouseup', this.handleGestureEnd, false);
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
  if(ignoreGestureEnd) {
    ignoreGestureEnd = false;
    return;
  }

  if(window.PointerEvent) {
    evt.target.releasePointerCapture(evt.pointerId);
  } else {
    document.removeEventListener('mouseup', this.handleGestureEnd, false);
    document.removeEventListener('mousemove', this.handleGestureMove, false);
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

  if (x !== false) {
    this.pos.x = +x || 0;
  }

  if(y !== false) {
    this.pos.y = +y || 0;
  }

  let style = 'translateX(' + this.pos.x + 'px) translateY(' + this.pos.y + 'px)';
  content.style.webkitTransform = style;
  content.style.MozTransform = style;
  content.style.msTransform = style;
  content.style.transform = style;
};

Panel.prototype.next = function () {
  let num = this.num;
  let nextPanel = title[num + 1];
  if(!nextPanel) return;
  nextPanel.realign(0);
  nextPanel.content.style.zIndex = 1;

  this.realign(-1, false);
  this.content.style.zIndex = '';

  if(title[num]) title[num].realign(-1);
  if(title[num - 1]) title[num - 1].realign(-2);
  if(title[num + 2]) title[num + 2].realign(1);

  if(this instanceof Title && inner[num + 1]) inner[num + 1].realign(0, 1);

  activePanel = nextPanel;

  swipes++;
  if(swipes > swipeHints) anime({
      targets: nextPanel.arrows,
      opacity: [.8, 0],
      duration: 3000,
      easing: 'easeInQuad'
    });
};

Panel.prototype.prev = function () {
  let num = this.num;
  let prevPanel = title[num - 1];
  if(!prevPanel) return;
  prevPanel.realign(0);
  prevPanel.content.style.zIndex = 1;

  this.realign(1, false);
  this.content.style.zIndex = '';

  if(title[num]) title[num].realign(1);
  if(title[num + 1]) title[num + 1].realign(2);
  if(title[num - 2]) title[num - 2].realign(-1);

  if(this instanceof Title && inner[num - 1]) inner[num - 1].realign(0, 1);

  activePanel = prevPanel;

  swipes++;
  if(swipes > swipeHints) anime({
      targets: prevPanel.arrows,
      opacity: [.8, 0],
      duration: 3000,
      easing: 'easeInQuad'
    });
};

Panel.prototype.realign = function (x, y) {
  let panel = this;

  if(x === false) {
    x = panel.pos.x;
  } else {
    x = +x || 0;
    x = (-2 <= x && x <= 2 ? clientWidth * x : x);
  }

  if(y === false) {
    y = panel.pos.y;
  } else {
    y = +y || 0;
    y = (y*y <= 1 ? clientHeight * y : y);
  }

  anime({
    targets: panel.content,
    translateX: x,
    translateY: y,
    duration: 250,
    easing: 'easeOutQuad',
    complete: function() {
      panel.pos.x = x;
      panel.pos.y = y;
    }
  });
};

Panel.prototype.jump = function () {
  let innerPanel = inner[this.num];
  let titlePanel = title[this.num];

  if(this === titlePanel) {
    if(!innerPanel) return;

    innerPanel.realign(0, 0);
    innerPanel.content.style.zIndex = 1;
    this.realign(0, -1);

    activePanel = innerPanel;
  } else {
    titlePanel.realign(0);
    titlePanel.content.style.zIndex = 1;
    this.realign(0, 1);

    activePanel = titlePanel;
  }

  this.content.style.zIndex = ''
};
// #### PANEL DECLARATION END




// #### TITLE DECLARATION START
function Title(obj) {
  'use strict';
  Panel.call(this, obj);

  let num = this.num;
  let nav = this.nav;
  let content = this.content;
  let pendingNav = this.pendingNav = null;


  if(obj.inner) {
    inner[num] = new Inner({
      id: num,
      url: obj.inner
    });
  }

  this.xhr.then(function() {
    this.arrows = [];
    let dark = (obj.darkUI ? '-dark' : '');
    if(nav.left) {
      let leftArrow = document.createElement('img');
      leftArrow.src = './img/arrow-left'+dark+'.svg';
      leftArrow.classList.add('arrow', 'nav-arrow', 'nav-arrow-left');
      leftArrow.style.left = 0;
      leftArrow.alt = 'Naviger til neste side';

      content.getElementsByClassName('wrapper')[0].appendChild(leftArrow);
      this.arrows.push(leftArrow);
    }

    if(nav.right) {
      let rightArrow = document.createElement('img');
      rightArrow.src = './img/arrow-right'+dark+'.svg';
      rightArrow.classList.add('arrow', 'nav-arrow', 'nav-arrow-right');
      rightArrow.style.right = 0;
      rightArrow.alt = 'Naviger til forrige side';

      content.getElementsByClassName('wrapper')[0].appendChild(rightArrow);
      this.arrows.push(rightArrow);
    }

    if(nav.down) {
      let arrowWrapper = document.createElement('div');
      arrowWrapper.classList.add('down-arrow-wrapper');
      let downArrow = document.createElement('img');
      downArrow.src = './img/arrow-down'+dark+'.svg';
      downArrow.alt = 'Naviger til innsiden av saken';
      downArrow.classList.add('down-arrow', 'nav-arrow', 'nav-arrow-down');
      arrowWrapper.appendChild(downArrow);

      content.appendChild(arrowWrapper);
    }

    if(num === 0) {
      this.pos = { x:0, y:0 };
      content.style.zIndex = 1;
      content.style.transform = 'translateX(0) translateY(0)';
    } else {
      this.pos = { x:clientWidth, y:0 };
      content.style.transform = 'translateX(' + this.pos.x + 'px)';
    }
  }.bind(this));
}
Title.prototype = Object.create(Panel.prototype);

Title.prototype.onAnimFrame = function () {
  if(!rafPending) return;
  if(!initialTouchPos) { rafPending = false; return; }

  let content = this.content;
  let vScroll = this.vScroll;
  let nav = this.nav;

  let nextPanel = title[this.num + 1];
  let prevPanel = title[this.num - 1];
  let innerPanel = inner[this.num];

  let xDiff = initialTouchPos.x - lastTouchPos.x;
  let yDiff = initialTouchPos.y - lastTouchPos.y;

  if(yDiff < 0) yDiff = 0;
  if(!nav.right && xDiff > 0) xDiff = 0;
  if(!nav.left && xDiff < 0) xDiff = 0;


  let vScrollChange = vScroll === true;
  if(vScroll) {
    this.vScroll = vScroll = !(Math.abs(xDiff) > Math.abs(yDiff) * 2 + 20);
    // Magic number
  } else {
    if(nav.down) this.vScroll = vScroll = (Math.abs(yDiff) > Math.abs(xDiff) * 2 + 20);
  }
  vScrollChange = !vScroll === vScrollChange;

  if(vScroll) {
    if(nav.down)  {
      innerPanel.transformTo(0, -yDiff + clientHeight);
      this.transformTo(0, -yDiff);
      if(vScrollChange) {
        if(nav.right) nextPanel.transformTo(-clientWidth);
        if(nav.left) prevPanel.transformTo(clientWidth);
      }
    }
  } else {
    if(nav.right) nextPanel.transformTo(-xDiff + clientWidth);
    if(nav.left) prevPanel.transformTo(-xDiff - clientWidth);
    this.transformTo(-xDiff, 0);
    if(vScrollChange && nav.down) {
      innerPanel.transformTo(0, clientHeight)
    }
  }
  rafPending = false;
};

Title.prototype.subclassGestureEnd = function () {
  let innerPanel = inner[this.num];

  if(this.vScroll) {
    if(Math.abs(this.pos.y) > Math.abs(clientHeight/8)) {
      this.jump();

    } else if(typeof this.pendingNav == 'function') {
      this.pendingNav();

    } else {
      this.realign();
      if(innerPanel) innerPanel.realign(0, 1)
    }

  } else {
    let prevPanel = title[this.num - 1];
    let nextPanel = title[this.num + 1];

    if(this.pos.x < -clientWidth/5) {
      this.next();

    } else if(this.pos.x > clientWidth/5) {
      this.prev();

    } else if(typeof this.pendingNav == 'function') {
      this.pendingNav();

    } else {
      this.realign(0, 0);
      if(innerPanel) innerPanel.realign(0, 1);
      if(prevPanel) prevPanel.realign(-1);
      if(nextPanel) nextPanel.realign(1);
    }
  }
  this.pendingNav = null;
};
// #### TITLE DECLARATION END




// #### INNER DECLARATION START
function Inner(obj) {
  'use strict';
  Panel.call(this, obj);
  let content = this.content;
  content.style.height = 'initial';
  content.style.transform = 'translateY(' + clientHeight + 'px)';
  this.vScroll = true;

  this.xhr.then(function(response) {
    let nextArrow = this.content.getElementsByClassName('next-arrow')[0];
    if(nextArrow) nextArrow.classList.add('nav-arrow', 'nav-arrow-right');
  }.bind(this));
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

  let vScrollChange = vScroll === true;
  if(vScroll) {
    this.vScroll = vScroll = !(Math.abs(xDiff) > Math.abs(yDiff) * 2 + 20);
  } else {
    this.vScroll = vScroll = (Math.abs(yDiff) > Math.abs(xDiff) * 2 + 20);
  }
  vScrollChange = vScroll === vScrollChange;

  if(vScroll) {
    if(titlePanel) titlePanel.transformTo(0, this.pos.y - yDiff - clientHeight);
    this.transformTo(0, this.pos.y - yDiff);
    initialTouchPos = lastTouchPos;

    if(vScrollChange) {
      if(nextPanel) nextPanel.transformTo(clientWidth);
      if(prevPanel) prevPanel.transformTo(-clientWidth);
    }

  } else {
    if(nextPanel) nextPanel.transformTo(-xDiff + clientWidth);
    if(prevPanel) prevPanel.transformTo(-xDiff - clientWidth);
    this.transformTo(-xDiff, false);
  }
  rafPending = false;
};

Inner.prototype.subclassGestureEnd = function () {
  if(this.vScroll) {
    if(this.pos.y > 0) {
      if(this.pos.y > clientHeight / 5) {
        this.jump();
      } else {
        this.realign();
        title[this.num].realign(0, -1);
      }
    } else {
      let maxHeight = this.content.scrollHeight - clientHeight;
      if(maxHeight < -this.pos.y) this.realign(0, -maxHeight);
    }
  } else {
    if(this.pos.x < -clientWidth / 5) {
      this.next();
    } else if(this.pos.x > clientWidth / 5) {
      this.prev();
    } else {
      this.realign(0, false);
      if(this.pos.x > 0 && title[this.num - 1]) {
        title[this.num - 1].realign(-1);
      } else if(this.pos.x < 0 && title[this.num + 1]) {
        title[this.num + 1].realign(1);
      }
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


getURL('./article.json')
  .then(JSON.parse)
  .then(function(json) {
    json.stylesheets.forEach(function loadStyles(url) {
      let style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = './css/' + url;
      document.head.appendChild(style);
    });

    for (let i = 0; i < json.panels.length; i++) {
      let panel = json.panels[i];
      panel.nav = {
        left: (+panel.id > 0),
        right: (+panel.id < json.panels.length - 1),
        down: panel.inner
      };
      title[+json.panels[i].id] = new Title(json.panels[i]);
    }
    title[0].content.style.transform = '';
    activePanel = title[0];
    document.addEventListener('keydown', function(evt) {
      switch (evt.keyCode) {
        case 65:
        case 37: activePanel.prev(); break;

        case 68:
        case 39: activePanel.next(); break;

        case 87:
        case 38: if(activePanel instanceof Inner) activePanel.jump(); break;

        case 83:
        case 40: if(activePanel instanceof Title) activePanel.jump(); break;
      }
    });
  })
  .catch(console.error);
}());
