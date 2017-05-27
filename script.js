window.onbeforeunload = function () {
    if(window.location.hash == '') document.body.scrollTop = 0;
};

window.onload = function(){

    var mainCopy = document.getElementById('main-copy-wrap');
    var tabs = document.getElementById('tabs');
    var cards = document.querySelectorAll('.card');
    var categoriesStack = document.getElementById('categories');
    var scrollArrow = document.getElementById('scroller');
    var tab = document.querySelectorAll('.tab');
    var logo = document.getElementById('main-title');
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var canvasLength = Math.max(screenWidth, screenHeight);
    var categoryFrameIsOpen = false;
    var subcategoryFrameIsOpen = false;
    var categoryFrame;
    var category;
    var categoryIdx;
    var prevCategoryIdx;
    var leftFences;
    var rightFences;
    var ctx1;
    var ctx2;
    var mask1X;
    var mask2W;
    var openedSubcardIdx;
    var subcategoryBackground;
    var subcategoryCtx;
    var currentCategoryIdx;
    var ctx;
    var stripStep = 225;
    var stripHeight = 85;
    var stripDelay = 1;         // used for closing very thin gaps between fences that appear in some browsers
    var step = 75;              // bigger value, faster animation
    var heightLevel1 = 170;
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
        var keyword = hash.split('/')[0].split('-')[0];

        var map = {
            '': function(){
                if(categoryFrameIsOpen) closeCategoryFrame();
                else releaseNavbar();
                resetOutgoings();
            },
            '#category': function(){
                prevCategoryIdx = categoryIdx;
                categoryIdx = hash.split('#category-')[1].trim().split('/')[0];
                if (categoryIdx >= 0 && categoryIdx <= 6 && categoryIdx != prevCategoryIdx){
                    fixNavbarToTop();
                    disableBodyScroll();
                    if(categoryFrameIsOpen) {
                        outgoingFrame = categoryFrame;
                        outgoingCategory = category;
                    }
                    newCategoryFrame(categoryIdx);
                }
                else {
                    handleSubcategory();
                }
            },
            '#cards': function(){
                mainCopy.classList.add('nav');
                if(categoryFrameIsOpen) closeCategoryFrame();
                else enableBodyScroll();
                scrollToSection3();
                handleSubcategory();
                resetOutgoings();
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

        diagonalstrips.width = screenWidth;
        diagonalstrips.height = screenHeight;

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

    window.addEventListener('scroll', function(){
        var heightLevel2 = document.documentElement.clientHeight * 0.95 - 200;
        handleScroll(scrollArrow, heightLevel1, 'hide');
        handleScroll(mainCopy, heightLevel2, 'nav');
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
        document.body.scrollTop = screenHeight;
        if(!mainCopy.classList.contains('nav')){
            mainCopy.classList.add('nav');
        }
    }

    // HANDLING THE CARD CLICK (FENCES IN)

    for (var i=0; i<cards.length; i++){
        (function(idx){
            cards[idx].addEventListener('click', function (){
                window.location.hash = 'category-' + idx;
            });
        })(i);
    }

    // creating event that triggers when a new frame is built
    var buildFrameEvent = document.createEvent('Event');
    buildFrameEvent.initEvent('buildFrameEvent', true, true);

    document.addEventListener('buildFrameEvent', function () {
        if(outgoingFrame && outgoingCategory) {
            // clear outgoing background first, show subcards, then remove frame
            outgoingCategory.querySelector('.subcategory-background').getContext('2d').clearRect(0, 0, 1030, 550);
            removeSubcategoryFrame(outgoingCategory, false);
            showSubcards();
            removeFrame(outgoingFrame, outgoingCategory);
            subcategoryFrameIsOpen = false;
        }
        handleSubcategory();
    });

    function fixNavbarToTop(){
        mainCopy.classList.add('nav');            // fixing the nav-bar to top for cases when it's not already there
        tabs.className = 'block show';
    }

    function releaseNavbar(){
        mainCopy.classList.remove('nav');
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
        mask2W = screenWidth;  // width of the rectangle that masks the right fences

        subcategoryCtx = subcategoryBackground.getContext('2d');

        // switching fence color set
        colorSetIdx = (colorSetIdx < 4) ? colorSetIdx + 1 : 1;
        currentColorSet = colorSets['set' + colorSetIdx];
        category.style.backgroundColor = currentColorSet[0];
        // category.style.borderColor = currentColorSet[1];
        category.querySelector('.title').style.color = currentColorSet[1];

        categoryFrameIsOpen = true;
        window.requestAnimationFrame(moveInFences);
    }

    function drawFences(){
        leftFences.width = screenWidth;
        leftFences.height = screenHeight;
        rightFences.width = screenWidth;
        rightFences.height = screenHeight;

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
        else {
            categoryFrameIsOpen = true;
            document.dispatchEvent(buildFrameEvent);
        }
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
        else {
            removeFrame(categoryFrame, category);
            // reset the masks for the next animation
            mask1X = 0;
            mask2W = screenWidth;
        }

    }

    function removeFrame(frame, category){
        frame.classList.remove('block');
        categoriesStack.appendChild(category);
        document.body.removeChild(frame);
    }

    function closeCategoryFrame(){
        category.classList.add('hidden');
        categoryFrameIsOpen = false;
        prevCategoryIdx = null;
        categoryIdx = null;


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
                    window.location.hash = 'category-' + idx;
                }
            });
        })(i);
    }

    // HANDLING LOGO CLICK

    logo.addEventListener('click', function(){
        if(categoryFrameIsOpen) {
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
                window.location.hash = 'category-' + categoryIdx + '/' + 'subcategory-' + idx;
            });
        })(i);
    }
    
    function handleSubcategory(){
        if(!hash) var hash = window.location.hash;
        if(hash.match(/subcategory/)){
            var subcategoryIdx = hash.split('subcategory-')[1].trim();
            openSubcategory(subcategoryIdx);
        }
        else if(subcategoryFrameIsOpen) {
            removeSubcategoryFrame(category, true);
            window.requestAnimationFrame(function () {
                collapseBackground(openedSubcardIdx, 90);
            });
        }
    }

    function openSubcategory(idx) {
        for(var i=0; i<subcards.length; i++){
            subcards[i].classList.add('none');
        }
        openedSubcardIdx = idx;
        subcategoryCtx.fillStyle = '#f7fff7';
        backgroundRadius = 99;
        subcategoryFrameIsOpen = true;
        window.requestAnimationFrame(function(){
            expandBackground(idx, 930);
        });
    }

    function expandBackground(idx, goalRadius){
        drawCircle(idx, backgroundRadius);
        backgroundRadius += step/2;

        if(backgroundRadius < goalRadius) {
            window.requestAnimationFrame(function(){
                expandBackground(idx, goalRadius);
            });
        }
        else {
            createSubcategoryFrame(idx);
        }
    }

    function collapseBackground(idx, goalRadius){
        drawCircle(idx, backgroundRadius);
        backgroundRadius -= step/2;

        if(backgroundRadius >= goalRadius) {
            window.requestAnimationFrame(function(){
                collapseBackground(idx, goalRadius);
            });
        }
        else {
            showSubcards();
        }
    }

    function showSubcards(){
        for(var i=0; i<subcards.length; i++){
            subcards[i].classList.remove('none');
        }
    }

    function drawCircle(idx, radius){
        subcategoryCtx.clearRect(0, 0, 1030, 550);
        subcategoryCtx.beginPath();
        subcategoryCtx.arc(subcardPositionX['subcard' + idx], 295, radius, 0, Math.PI * 2, false);
        subcategoryCtx.fill();
    }

    var subcategoryWrapper;
    var subcategoryFrame;
    var subcategoryHeader;
    var goods = {
        category0: {
            subcategory0: {
                good0: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good1: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good2: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good3: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good4: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good5: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good6: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good7: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good8: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good9: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good10: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good11: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good12: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good13: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good14: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                }
            },
            subcategory1: {
                good0: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good1: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good2: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good3: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good4: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good5: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good6: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good7: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good8: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good9: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good10: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good11: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good12: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good13: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                },
                good14: {
                    name: 'Топливный Генератор 2000i+',
                    price: '640с',
                    thumb: 'images/goods/generator-thumb.jpg'
                }
            }
        }
    };

    function createSubcategoryFrame(idx){
        subcategoryWrapper = category.querySelector('.subcategory-wrapper');
        subcategoryFrame = subcategoryWrapper.querySelector('.subcategory-frame');
        subcategoryHeader = subcategoryWrapper.querySelector('.subcategory-header');
        subcategoryHeader.innerHTML = subcards[idx].querySelector('.header').innerHTML.replace('\<br\>', '');
        subcategoryWrapper.classList.add('block');
        setTimeout(function(){
            subcategoryWrapper.classList.add('show');
        }, 10);
        generateGoodsList(idx);
    }

    function removeSubcategoryFrame(category, animate){
        var wrapper = category.querySelector('.subcategory-wrapper');
        var frame = wrapper.querySelector('.subcategory-frame');
        wrapper.classList.remove('show');
        if(animate){
            setTimeout(function(){
                wrapper.classList.add('block');
                frame.innerHTML = '';
                subcategoryFrameIsOpen = false;
            }, 210);
        }
        else {
            wrapper.classList.add('block');
            frame.innerHTML = '';
            subcategoryFrameIsOpen = false;
        }
    }

    function generateGoodsList(idx){
        for (var i=0; i<Object.keys(goods['category0']['subcategory' + idx]).length; i++){
            var name = goods['category0']['subcategory' + idx]['good' + i]['name'];
            var price = goods['category0']['subcategory' + idx]['good' + i]['price'];
            var thumb = goods['category0']['subcategory' + idx]['good' + i]['thumb'];

            var good = document.createElement('div');
            var goodName = document.createElement('div');
            var goodPrice = document.createElement('div');
            var goodThumb = document.createElement('div');

            good.className = 'good';
            goodName.className = 'good-name';
            goodPrice.className = 'good-price';
            goodThumb.className = 'good-thumb';

            goodName.innerHTML = name;
            goodPrice.innerHTML = price;
            goodThumb.style.backgroundImage = "url(\'" + thumb + "\')";

            good.appendChild(goodThumb);
            good.appendChild(goodName);
            good.appendChild(goodPrice);
            subcategoryFrame.appendChild(good);
        }
    }

    // HANDLING SUBCATEGORY CLOSE BUTTON CLICK

    var closeSubcategory = document.querySelectorAll('.close-subcategory');

    closeSubcategory.forEach(function(close){
        close.addEventListener('click', function(){
            window.location.hash = window.location.hash.split('/subcategory-')[0];
        });
    });

};





