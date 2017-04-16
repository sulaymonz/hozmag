window.onbeforeunload = function () {
    window.scrollTo(0, 0);  // document scrolls to top on refresh
};

window.onload = function(){

    // globals
    var mainCopy = document.getElementById('main-copy-wrap'),
        tabs = document.getElementById('tabs'),
        cards = document.querySelectorAll('.card'),
        categoriesStack = document.getElementById('categories'),
        screenWidth = window.screen.width,
        screenHeight = window.screen.height,
        canvasLength = Math.max(screenWidth, screenHeight),
        categoryFrame,
        category,
        leftFences,
        rightFences,
        closeButton,
        ctx1,
        ctx2,
        mask1X,
        mask2W;

    // Drawing section-2 canvas

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

    // Bouncing scroll icon

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

    // Animating main copy and scroll icon on scroll

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

    // Handling the card click (fences in)

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
        tabs.className = 'block show',
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
        closeButton = document.createElement('div');
        category = document.querySelector('#categories .category-' + categoryIdx);

        categoryFrame.classList.add('category-frame');
        leftFences.classList.add('left-fences');
        rightFences.classList.add('right-fences');
        closeButton.classList.add('close-card');

        closeButton.innerHTML = 'закрыть';

        closeButton.addEventListener('click', closeCard);

        categoryFrame.appendChild(leftFences);
        categoryFrame.appendChild(rightFences);
        categoryFrame.appendChild(closeButton);
        categoryFrame.appendChild(category);

        category.classList.add('block');

        document.body.appendChild(categoryFrame);
    }

    function moveInFences(){
        leftFences.width = screenWidth;
        leftFences.height = screenHeight;
        rightFences.width = screenWidth;
        rightFences.height = screenHeight;

        ctx1.fillStyle = '#000';
        ctx2.fillStyle = '#ffe66d';

        var ctx = ctx1,
            stripeStep = 225,
            stripeHeight = 85,
            step = 75; // bigger value, faster animation

        ctx1.save();
        ctx1.rotate((Math.PI / 180) * 33.5);
        ctx1.translate(canvasLength/2, canvasLength/2);

        ctx2.save();
        ctx2.rotate((Math.PI / 180) * 33.5);
        ctx2.translate(canvasLength/2, canvasLength/2);

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

        // reducing masks' width, so the fences are seen more by each frame
        mask1X += step;
        mask2W -= step;

        // repeat till masks leave the screen
        if (mask1X < screenWidth + step && mask2W > -step){
            window.requestAnimationFrame(moveInFences);
        }
    }

    function closeCard(){
        categoryFrame.classList.remove('block');
        tabs.classList.remove('show');

        setTimeout(function(){
            tabs.classList.remove('block');
        }, 500);

        categoriesStack.appendChild(category);
        document.body.classList.remove('noscroll');  // enable body scroll

        // reset the masks for the next animation
        mask1X = 0;
        mask2W = screenWidth;
    }

    // Subcard mouseover animation

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
            lEven = 10,   // canvas even line length
            dlEven = 1;  // change in even-line length in each animation frame

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
            ctx.lineWidth = 1.5;
            ctx.save();
            ctx.translate(100, 100);

            ctx.rotate((Math.PI / 180) * canvasAngle);
            ctx.beginPath();

            for(var i=0; i<36; i++){
                // even lines
                ctx.moveTo(0, -96);
                ctx.lineTo(0, -96 + lEven); // changing length
                ctx.rotate((Math.PI / 180) * 5);
                // odd lines
                ctx.moveTo(0, -96);
                ctx.lineTo(0, -93); // fixed length
                ctx.rotate((Math.PI / 180) * 5);
            }
            ctx.stroke();
            ctx.restore();

            canvasAngle += 0.3;

            if(lEven >= 10) dlEven = -1;
            else if(lEven <= 2) dlEven = 1;
            lEven = lEven + dlEven/4;

            if(subcardHover) window.requestAnimationFrame(animateSubcard);
            else {
                ctx.clearRect(0, 0, 200, 200);
            }
        }
    }

};





