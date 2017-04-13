window.onbeforeunload = function () {
    window.scrollTo(0, 0);  // document scrolls to top on refresh
};

window.onload = function(){

    // Globals

    var mainCopy = document.getElementById('main-copy-wrap'),
        screenWidth = window.screen.width,
        screenHeight = window.screen.height,
        canvasLength = Math.max(screenWidth, screenHeight);

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

    var cards = document.querySelectorAll('.card'),
        fencesWrapper = document.getElementById('fences-wrapper'),
        closeButton = document.getElementById('close-card'),
        leftFences = document.getElementById('left-fences'),
        rightFences = document.getElementById('right-fences');

    for (var i=0; i<cards.length; i++){
        (function(idx){
            cards[idx].addEventListener('click', function (){
                handleCardClick(idx);
            });
        })(i);
    }

    closeButton.addEventListener('click', closeCard);

    function handleCardClick(idx){
        fencesWrapper.classList.add('block');
        mainCopy.classList.add('nav');  // fixing the nav-bar to top for cases when it's not already there
        document.body.classList.add('noscroll');  // disable body scroll to prevent nav-bar moving
        window.requestAnimationFrame(moveInFences);
    }

    var ctx1 = leftFences.getContext('2d'),
        ctx2 = rightFences.getContext('2d'),
        mask1X = 0,              // x position of the rectangle that masks the left fences
        mask2W = screenWidth;    // width of the rectangle that masks the right fences

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
            step = 75; //bigger value, faster animation

        ctx1.save();
        ctx1.rotate((Math.PI / 180) * 33.5);
        ctx1.translate(canvasLength/2, canvasLength/2);

        ctx2.save();
        ctx2.rotate((Math.PI / 180) * 33.5);
        ctx2.translate(canvasLength/2, canvasLength/2);

        for (var i=-2*canvasLength; i<2*canvasLength; i+=stripeStep){
            //drawing left and right fences in different canvases
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

        //reducing masks' width, so the fences are seen more by each frame
        mask1X += step;
        mask2W -= step;

        //repeat till masks leave the screen
        if (mask1X < screenWidth + step && mask2W > -step){
            window.requestAnimationFrame(moveInFences);
        }

    }

    function closeCard(){
        fencesWrapper.classList.remove('block');
        document.body.classList.remove('noscroll');  // enable body scroll

        // reset the masks for the next animation
        mask1X = 0;
        mask2W = screenWidth;
    }

};





