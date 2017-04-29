window.onbeforeunload = function () {
    // if(window.location.hash == '') document.body.scrollTop = 0;
};

window.onload = function(){

    var mainCopy = document.getElementById('main-copy-wrap');
    var tabs = document.getElementById('tabs');
    var cards = document.querySelectorAll('.card');
    var categoriesStack = document.getElementById('categories');
    var scrollArrow = document.getElementById('scroller');
    var tab = document.querySelectorAll('.tab');
    var logo = document.getElementById('main-title');
    var categoryFrameOpened = false;
    var categoryFrame;
    var category;
    var leftFences;
    var rightFences;
    var ctx1;
    var ctx2;
    var mask1X;
    var mask2W;
    var subcategoryBackground;
    var subcategoryCtx;
    // var categoryFrameOpened = false;
    var currentCategoryIdx;
    var ctx;
    var stripStep = 225;
    var stripHeight = 85;
    var stripDelay = 1;         // used for closing very thin gaps between fences that appear in some browsers
    var step = 75;              // bigger value, faster animation
    var outgoingFrame = null;
    var outgoingCategory = null;
    var colorSets = {
        set1: ['#ffe66d', '#333333', '#ff6b6b', '#333333'],
        set2: ['#ff6b6b', '#4ecdc4', '#ff6b6b', '#4ecdc4'],
        set3: ['#333333', '#ffe66d', '#333333', '#ff6b6b'],
        set4: ['#4ecdc4', '#ff6b6b', '#4ecdc4', '#ff6b6b']
    };
    var colorSetIdx = 0;
    var currentColorSet = colorSets['set1'];
    var subcards = document.querySelectorAll('.subcard');
    var subcardCanvas;
    var subcardHover;
    var backgroundRadius = 99;
    var goalRadius = 990;
    var subcardPositionX = {
            subcard0: 400,
            subcard1: 630,
            subcard2: 170,
            subcard3: 400,
            subcard4: 630,
            subcard5: 860,
            subcard6: 170,
            subcard7: 400,
            subcard8: 630,
            subcard9: 860,
            subcard10: 285,
            subcard11: 515,
            subcard12: 745,
            subcard13: 170,
            subcard14: 400,
            subcard15: 630,
            subcard16: 860,
            subcard17: 400,
            subcard18: 630,
            subcard19: 285,
            subcard20: 515,
            subcard21: 745
        };

    // HANDLING HASH CHANGE

    handleHashchange(decodeURI(window.location.hash));

    window.addEventListener('hashchange', function(){
        handleHashchange(decodeURI(window.location.hash));
    });

    function handleHashchange(hash){
        var keyword = hash.split('/')[0];

        var map = {
            '': function(){
                if(categoryFrameOpened) closeCategoryFrame();
                else releaseNavbar();
                resetOutgoings();
                // categoryFrameOpened = false;
            },
            '#category': function(){
                var index = hash.split('#category/')[1].trim();
                if (index <= 6){
                    fixNavbarToTop();
                    disableBodyScroll();
                    if(categoryFrameOpened) {
                        outgoingFrame = categoryFrame;
                        outgoingCategory = category;
                    }
                    newCategoryFrame(index);
                }
            },
            '#cards': function(){
                if(categoryFrameOpened) closeCategoryFrame();
                else enableBodyScroll();
                scrollToSection3();
                resetOutgoings();
                // categoryFrameOpened = false;
            }
        };
        if(map[keyword]){
            map[keyword]();
        }
    }

    function resetOutgoings(){
        outgoingFrame = null;     // the vars for outgoings should be cleared to prevent the last but one
        outgoingCategory = null;  // opened category from deleting on the next frame opening
    }

    // DRAWING SECTION-2 CANVAS

    drawSectionTwo();

    function drawSectionTwo(){
        var diagonalstrips = document.getElementById('diagonal-strips');
        var canvasLength = Math.max(window.screen.width, window.screen.height);

        diagonalstrips.width = window.screen.width;
        diagonalstrips.height = window.screen.height;

        var ctx = diagonalstrips.getContext('2d');

        ctx.fillStyle = '#333333';
        ctx.rotate((Math.PI / 180) * 33.5);
        ctx.translate(canvasLength/2, canvasLength/2);

        for(var i=-canvasLength; i<canvasLength; i+=225){
            ctx.fillRect(-canvasLength, i, canvasLength*2, 85);
        }
    }

    // BOUNCING SCROLL ICON

    animateScrollIcon();

    function animateScrollIcon(){
        var scrollArrow = document.getElementById('scroller');

        setTimeout(function(){
            scrollArrow.classList.remove('hide');
        },1500);
        setTimeout(function(){
            scrollArrow.classList.add('animate');
        },2500);
    }

    // ANIMATING MAIN COPY AND SCROLL ICON ON SCROLL

    handleScroll(scrollArrow, 170, 'hide');
    handleScroll(mainCopy, document.documentElement.clientHeight * 0.95 - 200, 'nav');

    function handleScroll(el, shrinkOn, classToToggle){
        window.addEventListener('scroll', function(){
            var distanceY = window.pageYOffset || document.documentElement.scrollTop;
            if(distanceY > shrinkOn){
                if(!(el.classList.contains(classToToggle))){
                    el.classList.add(classToToggle);
                }
            }
            else {
                if(el.classList.contains(classToToggle)){
                    el.classList.remove(classToToggle);
                }
            }
        });
    }

    window.addEventListener('scroll', function(){
        var distanceY = window.pageYOffset || document.documentElement.scrollTop,
            top = Math.max(0 ,document.documentElement.clientHeight * 0.475 - 100 - distanceY);
        mainCopy.style.top = top + 'px';
    });

    function disableBodyScroll(){
        document.body.classList.add('noscroll');
    }

    function enableBodyScroll() {
        document.body.classList.remove('noscroll');
    }

    function scrollToSection3(){
        document.body.scrollTop = window.screen.height;
    }

    // HANDLING THE CARD CLICK (FENCES IN)

    for (var i=0; i<cards.length; i++){
        (function(idx){
            cards[idx].addEventListener('click', function (){
                window.location.hash = 'category/' + idx;
            });
        })(i);
    }

    // creating event that triggers when a new frame is built
    var buildFrameEvent = document.createEvent('Event');
    buildFrameEvent.initEvent('buildFrameEvent', true, true);

    document.addEventListener('buildFrameEvent', function () {
        if(outgoingFrame && outgoingCategory) {
            removeFrame(outgoingFrame, outgoingCategory);
        }
    });

    function fixNavbarToTop(){
        mainCopy.classList.add('nav');            // fixing the nav-bar to top for cases when it's not already there
        tabs.className = 'block show';
    }

    function releaseNavbar(){
        mainCopy.classList.remove('nav');            // fixing the nav-bar to top for cases when it's not already there
        tabs.className = '';
    }

    function newCategoryFrame(categoryIdx){
        currentCategoryIdx = categoryIdx;

        categoryFrame = document.createElement('div');
        leftFences = document.createElement('canvas');
        rightFences = document.createElement('canvas');
        category = document.querySelector('#categories .category-' + categoryIdx);
        subcategoryBackground = category.querySelector('.subcategory-background');

        categoryFrame.classList.add('category-frame');
        leftFences.classList.add('left-fences');
        rightFences.classList.add('right-fences');

        categoryFrame.appendChild(leftFences);
        categoryFrame.appendChild(rightFences);
        categoryFrame.appendChild(category);

        category.classList.add('block');
        category.classList.remove('hidden');

        document.body.appendChild(categoryFrame);
        categoryFrame.classList.add('block');

        ctx1 = leftFences.getContext('2d');
        ctx2 = rightFences.getContext('2d');
        mask1X = 0;            // x position of the rectangle that masks the left fences
        mask2W = window.screen.width;  // width of the rectangle that masks the right fences

        subcategoryCtx = subcategoryBackground.getContext('2d');

        // switching fence color set
        colorSetIdx = (colorSetIdx < 4) ? colorSetIdx + 1 : 1;
        currentColorSet = colorSets['set' + colorSetIdx];
        category.style.backgroundColor = currentColorSet[0];
        // category.style.borderColor = currentColorSet[1];
        category.querySelector('.title').style.color = currentColorSet[1];

        categoryFrameOpened = true;
        window.requestAnimationFrame(moveInFences);
    }

    function drawFences(){
        var canvasLength = Math.max(window.screen.width, window.screen.height);
        leftFences.width = window.screen.width;
        leftFences.height = window.screen.height;
        rightFences.width = window.screen.width;
        rightFences.height = window.screen.height;

        ctx1.fillStyle = currentColorSet[0];
        ctx2.fillStyle = currentColorSet[1];
        /*ctx2.shadowBlur = 5;
        ctx2.shadowColor = '#000';*/

        ctx1.save();
        ctx1.rotate((Math.PI / 180) * 33.5);
        ctx1.translate(canvasLength/2, canvasLength/2);

        ctx2.save();
        ctx2.rotate((Math.PI / 180) * 33.5);
        ctx2.translate(canvasLength/2, canvasLength/2);

        ctx = ctx1;

        for (var i=-2*canvasLength; i<2*canvasLength; i+=stripStep){
            // drawing left and right fences in different canvases
            ctx.fillRect(-canvasLength, i - stripDelay, canvasLength*2, stripHeight + stripDelay*2);
            if (i%2 == 0) {
                ctx = ctx2;
                stripStep = 85;
                stripHeight = 225;
                stripDelay = 0;
            }
            else {
                ctx = ctx1;
                stripStep = 225;
                stripHeight = 85;
                stripDelay = 1;
            }
        }

        ctx1.restore();
        ctx2.restore();
        ctx1.clearRect(mask1X, 0, window.screen.width - mask1X, window.screen.height);
        ctx2.clearRect(0, 0 , mask2W, window.screen.height);
    }

    function moveInFences(){
        drawFences();
        // reducing masks' width, so the fences are seen more by each frame
        mask1X += step;
        mask2W -= step;
        // repeat till masks leave the screen
        if (mask1X < window.screen.width + step && mask2W > -step){
            window.requestAnimationFrame(moveInFences);
        }
        else {
            categoryFrameOpened = true;
            document.dispatchEvent(buildFrameEvent);
        }
    }

    function moveOutFences(){
        drawFences();
        // expanding masks, so the fences are hidden more by each frame
        mask1X -= step;
        mask2W += step;
        // repeat till masks cover all the screen
        if (mask1X > -step && mask2W < window.screen.width + step){
            window.requestAnimationFrame(moveOutFences);
        }
        else {
            removeFrame(categoryFrame, category);
            // reset the masks for the next animation
            mask1X = 0;
            mask2W = window.screen.width;
        }

    }

    function removeFrame(frame, category){
        frame.classList.remove('block');
        categoriesStack.appendChild(category);
        document.body.removeChild(frame);
    }

    function closeCategoryFrame(){
        category.classList.add('hidden');
        categoryFrameOpened = false;

        tabs.classList.remove('show');
        setTimeout(function(){
            tabs.classList.remove('block');
            document.body.classList.remove('noscroll');  // enable body scroll
        }, 220);

        setTimeout(function(){
            window.requestAnimationFrame(moveOutFences);
        }, 50);
    }

    // HANDLING THE TAB CLICK

    for(var i=0; i<tab.length; i++){
        (function(idx){
            tab[idx].addEventListener('click', function(){
                if(idx != currentCategoryIdx){
                    window.location.hash = 'category/' + idx;
                }
            });
        })(i);
    }

    // HANDLING LOGO CLICK

    logo.addEventListener('click', function(){
        if(categoryFrameOpened) {
            window.location.hash = 'cards';
        }
    });

    // SUBCARD HOVER ANIMATION

    for(var i=0; i<subcards.length; i++){
        (function(idx){
            subcards[idx].addEventListener('mouseenter', function(){
                subcardHover = true;
                handleSubcardHover(idx);
            });
        })(i);
    }

    for(var i=0; i<subcards.length; i++){
        (function(idx){
            subcards[idx].addEventListener('mouseleave', function(){
                subcardHover = false;
            });
        })(i);
    }

    function handleSubcardHover(idx){
        var canvasAngle = 0,
            lEven = 10,  // initial length of even playing lines
            dlEven = 1,  // change in even-line length in each animation frame
            lOdd = 2,
            dlOdd = -1;

        if(!subcardCanvas) subcardCanvas = document.createElement('canvas');
        subcards[idx].appendChild(subcardCanvas);
        subcardCanvas.width = 200;
        subcardCanvas.height = 200;

        window.requestAnimationFrame(animateSubcard);

        function animateSubcard(){
            var ctx = subcardCanvas.getContext('2d');
            ctx.globalCompositeOperation = 'destination-over';
            ctx.clearRect(0, 0, 200, 200);

            ctx.strokeStyle = currentColorSet[2];
            ctx.lineWidth = 1.5;
            ctx.save();
            ctx.translate(100, 100);

            ctx.rotate((Math.PI / 180) * canvasAngle);
            ctx.beginPath();

            for(var i=0; i<18; i++){
                // even playing lines
                ctx.moveTo(0, -96);
                ctx.lineTo(0, -96 + lEven); // changing length
                ctx.rotate((Math.PI / 180) * 10);

                // odd playing lines
                ctx.moveTo(0, -96);
                ctx.lineTo(0, -96 + lOdd); // changing length
                ctx.rotate((Math.PI / 180) * 10);
            }
            ctx.stroke();

            ctx.rotate((Math.PI / 180) * 5);
            ctx.strokeStyle = currentColorSet[3];
            ctx.beginPath();

            // fixed lines
            for(var i=0; i<36; i++){
                ctx.moveTo(0, -96);
                ctx.lineTo(0, -94); // fixed length
                ctx.rotate((Math.PI / 180) * 10);
            }
            ctx.stroke();

            ctx.restore();
            canvasAngle += 0.12;

            if(lEven >= 10) dlEven = -1;
            else if(lEven <= 2) dlEven = 1;
            lEven = lEven + dlEven/4; // bigger denominator, slower length-change animation

            if(lOdd >= 10) dlOdd = -1;
             else if(lOdd <= 2) dlOdd = 1;
             lOdd = lOdd + dlOdd/4;

            if(subcardHover) window.requestAnimationFrame(animateSubcard);
            else {
                ctx.clearRect(0, 0, 200, 200);
            }
        }
    }

    // HANDLING SUBCARD CLICK

    for(var i=0; i<subcards.length; i++){
        (function(idx){
            subcards[idx].addEventListener('click', function(){
                handleSubcardClick(idx);
            });
        })(i);
    }

    function handleSubcardClick(idx) {
        for(var i=0; i<subcards.length; i++){
            subcards[i].classList.add('none');
        }
        subcategoryCtx.fillStyle = '#f7fff7';
        window.requestAnimationFrame(function(){
            expandBackground(idx);
        });
    }

    function expandBackground(idx){
        subcategoryCtx.clearRect(0, 0, 1030, 550);
        subcategoryCtx.arc(subcardPositionX['subcard' + idx], 295, backgroundRadius, 0, Math.PI * 2, false);
        subcategoryCtx.fill();

        backgroundRadius += step/2;

        if(backgroundRadius < goalRadius) {
            window.requestAnimationFrame(function(){
                expandBackground(idx);
            });
        }
    }

};





