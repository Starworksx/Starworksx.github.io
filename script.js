/* =====================================================
   ENTER SCREEN
===================================================== */

const enterScreen =
    document.getElementById("enter-screen");

const website =
    document.getElementById("website");

let hasEntered = false;


/* =====================================================
   ENTER WEBSITE
===================================================== */

function enterWebsite() {

    if (hasEntered) {
        return;
    }

    hasEntered = true;

    enterScreen.classList.add("hidden");

    setTimeout(function () {

        website.classList.add("visible");

    }, 250);

}


/* =====================================================
   KEYBOARD SUPPORT
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            enterWebsite();

        }

    }
);


/* =====================================================
   SPACE CANVAS
===================================================== */

const canvas =
    document.getElementById("space");

const ctx =
    canvas.getContext("2d");


let width = 0;
let height = 0;

let stars = [];

let lastTime = 0;


/* =====================================================
   STAR CLASS
===================================================== */

class Star {

    constructor() {

        this.reset(true);

    }


    reset(initial = false) {

        this.x =
            Math.random() * width;

        this.y =
            Math.random() * height;

        this.size =
            Math.random() * 1.5 + 0.3;

        this.speed =
            Math.random() * 0.15 + 0.03;

        this.opacity =
            Math.random() * 0.65 + 0.15;

        this.twinkle =
            Math.random() * Math.PI * 2;

        this.twinkleSpeed =
            Math.random() * 0.025 + 0.008;

        this.drift =
            (Math.random() - 0.5) * 0.08;

        /*
            A few stars are larger.
        */

        if (Math.random() < 0.035) {

            this.size =
                Math.random() * 2.5 + 2;

            this.special = true;

        } else {

            this.special = false;

        }

        if (!initial) {

            this.y = height + 10;

        }

    }


    update(delta) {

        this.y -=
            this.speed * delta;

        this.x +=
            this.drift * delta;

        this.twinkle +=
            this.twinkleSpeed * delta;


        if (this.y < -10) {

            this.reset();

        }


        if (this.x < -10) {

            this.x = width + 10;

        }


        if (this.x > width + 10) {

            this.x = -10;

        }

    }


    draw() {

        const pulse =
            0.65 +
            Math.sin(this.twinkle) * 0.35;

        const alpha =
            this.opacity * pulse;


        /*
            Normal star
        */

        if (!this.special) {

            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                this.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(
                    170,
                    225,
                    255,
                    ${alpha}
                )`;

            ctx.fill();

            return;

        }


        /*
            Large glowing star
        */

        const glowSize =
            this.size * 5;


        const gradient =
            ctx.createRadialGradient(
                this.x,
                this.y,
                0,
                this.x,
                this.y,
                glowSize
            );


        gradient.addColorStop(
            0,
            `rgba(255,255,255,${alpha})`
        );


        gradient.addColorStop(
            0.2,
            `rgba(100,210,255,${alpha * 0.7})`
        );


        gradient.addColorStop(
            1,
            "rgba(0,120,255,0)"
        );


        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            glowSize,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            gradient;

        ctx.fill();


        /*
            Star cross
        */

        ctx.beginPath();

        ctx.moveTo(
            this.x,
            this.y - this.size * 3
        );

        ctx.lineTo(
            this.x,
            this.y + this.size * 3
        );

        ctx.moveTo(
            this.x - this.size * 3,
            this.y
        );

        ctx.lineTo(
            this.x + this.size * 3,
            this.y
        );

        ctx.strokeStyle =
            `rgba(
                220,
                245,
                255,
                ${alpha}
            )`;

        ctx.lineWidth = 0.7;

        ctx.stroke();

    }

}


/* =====================================================
   CREATE STARS
===================================================== */

function createStars() {

    stars = [];

    const area =
        width * height;


    /*
        Keep the amount reasonable.

        Maximum: 140 stars.
    */

    const count =
        Math.min(
            140,
            Math.floor(area / 9000)
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        stars.push(
            new Star()
        );

    }

}


/* =====================================================
   RESIZE
===================================================== */

function resizeCanvas() {

    const pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            1.5
        );


    width =
        window.innerWidth;

    height =
        window.innerHeight;


    canvas.width =
        width * pixelRatio;

    canvas.height =
        height * pixelRatio;


    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


    createStars();

}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =====================================================
   BACKGROUND HAZE
===================================================== */

function drawHaze() {

    /*
        Very subtle blue atmospheric glow.
    */

    const gradient =
        ctx.createRadialGradient(
            width * 0.5,
            height * 0.5,
            0,
            width * 0.5,
            height * 0.5,
            Math.max(width, height) * 0.65
        );


    gradient.addColorStop(
        0,
        "rgba(0,100,255,0.035)"
    );


    gradient.addColorStop(
        0.5,
        "rgba(0,60,180,0.015)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}


/* =====================================================
   ANIMATION
===================================================== */

function animate(time) {

    const delta =
        Math.min(
            (time - lastTime) / 16.67,
            3
        );


    lastTime = time;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawHaze();


    for (
        const star
        of stars
    ) {

        star.update(delta);

        star.draw();

    }


    requestAnimationFrame(
        animate
    );

}


/* =====================================================
   START
===================================================== */

resizeCanvas();

requestAnimationFrame(
    animate
);