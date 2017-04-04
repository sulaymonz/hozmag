
window.onload = function(){

    // Drawing section-2 canvas

    drawSectionTwo();

    function drawSectionTwo(){

        var diagonalStripes = document.getElementById('diagonal-stripes'),
            screenWidth = window.screen.width,
            screenHeight = window.screen.height,
            distance = Math.max(screenWidth, screenHeight);

        diagonalStripes.width = screenWidth;
        diagonalStripes.height = screenHeight;

        var ctx = diagonalStripes.getContext('2d');

        ctx.fillStyle = '#000';
        ctx.rotate((Math.PI / 180) * 33.5);
        ctx.translate(distance/2, distance/2);

        for(var i=-distance; i<distance; i+=225){
            ctx.fillRect(-distance/2, i, distance*2, 85);
        }

    }

    // Bouncing scroll icon

    animateScrollIcon();

    function animateScrollIcon(){

        var scrollArrow = document.getElementById('scroller');

        setTimeout(function(){
            scrollArrow.classList.remove('hide');
        },2000);
        setTimeout(function(){
            scrollArrow.classList.add('animate');
        },3500);

    }

    // Animating main copy and scroll icon on scroll

    var mainCopy = document.getElementById('main-copy-wrap'),
        scrollArrow = document.getElementById('scroller');

    window.addEventListener('scroll', function(){
        var heightLevel1 = document.documentElement.clientHeight * 0.3,
            heightLevel2 = document.documentElement.clientHeight * 0.1;


        handleScroll(mainCopy, heightLevel1, 'nav');
        handleScroll(scrollArrow, heightLevel2, 'hide');
    });

    function handleScroll(el, shrinkOn, classToToggle){

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

    }

}

