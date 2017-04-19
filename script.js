window.onbeforeunload = function () {
    window.scrollTo(0, 0);  // document scrolls to top on refresh
};

window.onload = function(){

    // GLOBALS
    var mainCopy = document.getElementById('main-copy-wrap'),
        tabs = document.getElementById('tabs'),
        cards = document.querySelectorAll('.card'),
        categoriesStack = document.getElementById('categories'),
        screenWidth = window.screen.width,
        screenHeight = window.screen.height,
        canvasLength = Math.max(screenWidth, screenHeight),
        categoryFrameOpened = false,
        categoryFrame,
        category,
        leftFences,
        rightFences,
        ctx1,
        ctx2,
        mask1X,
        mask2W;

    // DRAWING SECTION-2 CANVAS

    drawSectionTwo();

    function drawSectionTwo(){
        var diagonalStripes = document.getElementById('diagonal-stripes');

        diagonalStripes.width = screenWidth;
        diagonalStripes.height = screenHeight;

        var ctx = diagonalStripes.getContext('2d');

        ctx.fillStyle = '#000';
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

    var scrollArrow = document.getElementById('scroller'),
        windowHeight = document.documentElement.clientHeight,
        heightLevel1 = windowHeight * 0.95 - 200;

    handleScroll(scrollArrow, 170, 'hide');
    handleScroll(mainCopy, heightLevel1, 'nav');

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
            top = Math.max(0 ,windowHeight * 0.475 - 100 - distanceY);
        mainCopy.style.top = top + 'px';
    });

    // HANDLING THE CARD CLICK (FENCES IN)

    for (var i=0; i<cards.length; i++){
        (function(idx){
            cards[idx].addEventListener('click', function (){
                handleCardClick(idx);
            });
        })(i);
    }

    function handleCardClick(idx){
        newCategoryFrame(idx);

        categoryFrame.classList.add('block');
        mainCopy.classList.add('nav');            // fixing the nav-bar to top for cases when it's not already there
        tabs.className = 'block show';
        document.body.classList.add('noscroll');  // disable body scroll to prevent nav-bar moving

        ctx1 = leftFences.getContext('2d');
        ctx2 = rightFences.getContext('2d');
        mask1X = 0;            // x position of the rectangle that masks the left fences
        mask2W = screenWidth;  // width of the rectangle that masks the right fences

        window.requestAnimationFrame(moveInFences);
    }

    function newCategoryFrame(categoryIdx){
        categoryFrame = document.createElement('div');
        leftFences = document.createElement('canvas');
        rightFences = document.createElement('canvas');
        category = document.querySelector('#categories .category-' + categoryIdx);

        categoryFrame.classList.add('category-frame');
        leftFences.classList.add('left-fences');
        rightFences.classList.add('right-fences');

        categoryFrame.appendChild(leftFences);
        categoryFrame.appendChild(rightFences);
        categoryFrame.appendChild(category);

        category.classList.add('block');
        category.classList.remove('hidden');

        document.body.appendChild(categoryFrame);
    }

    var ctx,
        stripeStep = 225,
        stripeHeight = 85,
        step = 75; // bigger value, faster animation

    function drawFences(){
        leftFences.width = screenWidth;
        leftFences.height = screenHeight;
        rightFences.width = screenWidth;
        rightFences.height = screenHeight;

        ctx1.fillStyle = '#000';
        ctx2.fillStyle = '#ffe66d';

        ctx1.save();
        ctx1.rotate((Math.PI / 180) * 33.5);
        ctx1.translate(canvasLength/2, canvasLength/2);

        ctx2.save();
        ctx2.rotate((Math.PI / 180) * 33.5);
        ctx2.translate(canvasLength/2, canvasLength/2);

        ctx = ctx1;

        for (var i=-2*canvasLength; i<2*canvasLength; i+=stripeStep){
            // drawing left and right fences in different canvases
            ctx.fillRect(-canvasLength, i, canvasLength*2, stripeHeight);
            if (i%2 == 0) {
                ctx = ctx2;
                stripeStep = 85;
                stripeHeight = 225;
            }
            else {
                ctx = ctx1;
                stripeStep = 225;
                stripeHeight = 85;
            }
        }

        ctx1.restore();
        ctx2.restore();
        ctx1.clearRect(mask1X, 0, screenWidth - mask1X, screenHeight);
        ctx2.clearRect(0, 0 , mask2W, screenHeight);
    }

    function moveInFences(){
        drawFences();
        // reducing masks' width, so the fences are seen more by each frame
        mask1X += step;
        mask2W -= step;
        // repeat till masks leave the screen
        if (mask1X < screenWidth + step && mask2W > -step){
            window.requestAnimationFrame(moveInFences);
        }
        else categoryFrameOpened = true;
    }

    function moveOutFences(){
        drawFences();
        // expanding masks, so the fences are hidden more by each frame
        mask1X -= step;
        mask2W += step;
        // repeat till masks cover all the screen
        if (mask1X > -step && mask2W < screenWidth + step){
            window.requestAnimationFrame(moveOutFences);
        }
        else removeFrame();

    }

    function removeFrame(){
        categoryFrame.classList.remove('block');
        categoriesStack.appendChild(category);
        document.body.removeChild(categoryFrame);
        document.body.classList.remove('noscroll');  // enable body scroll

        // reset the masks for the next animation
        mask1X = 0;
        mask2W = screenWidth;
    }

    function closeCategoryFrame(){
        category.classList.add('hidden');
        categoryFrameOpened = false;

        tabs.classList.remove('show');
        setTimeout(function(){
            tabs.classList.remove('block');
        }, 220);

        setTimeout(function(){
            window.requestAnimationFrame(moveOutFences);
        }, 50);
    }

    // HANDLING LOGO CLICK

    var logo = document.getElementById('main-title');

    logo.addEventListener('click', function(){
        if(categoryFrameOpened) {
            closeCategoryFrame();
        }
    });

    // SUBCARD HOVER ANIMATION

    var subcards = document.querySelectorAll('.subcard'),
        subcardCanvas,
        subcardHover;

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

            ctx.strokeStyle = '#ff6b6b';
            // ctx.lineWidth = 1.5;
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
            ctx.strokeStyle = '#000';
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

};





