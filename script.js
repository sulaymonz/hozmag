
window.onload = function(){

    // Drawing sction-2 canvas

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

    // Animating scroll icon

    animateScrollIcon();

    function animateScrollIcon(){

        var scrollArrow = document.getElementById('scroller');

        setTimeout(function(){
            scrollArrow.classList.add('show');
        },2000);
        setTimeout(function(){
            scrollArrow.classList.add('animate');
        },3500);

    }

    // Animating main title on scroll

    handleScroll();

    function handleScroll(){

        var title = document.getElementById('main-title'),
            shrinkOn = 200;
        console.log(title.offsetParent);

        window.addEventListener('scroll', function(){
            var distanceY = window.pageYOffset || document.documentElement.scrollTop;
            // console.log(title.clientY);
            if(distanceY > shrinkOn){
                if(!(title.classList.contains('fixed'))){
                    title.classList.add('fixed');
                }
            }
            else {
                if(title.classList.contains('fixed')){
                    title.classList.remove('fixed');
                }
            }
        });

    }

}

