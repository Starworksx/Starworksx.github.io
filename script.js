/* =====================================================
   ENTER SCREEN
===================================================== */

const enterScreen = document.getElementById("enter-screen");
const website = document.getElementById("website");
let hasEntered = false;

function enterWebsite() {
    if (hasEntered) return;
    hasEntered = true;

    enterScreen.classList.add("hidden");

    setTimeout(() => {
        website.classList.add("visible");
    }, 250);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        enterWebsite();
    }
});


/* =====================================================
   CANVAS SETUP
===================================================== */

const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let lastTime = 0;

let stars = [];
let bubbles = [];
let shootingStars = [];


/* =====================================================
   STAR
===================================================== */

class Star {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.3 + 0.4;
        this.speed = Math.random() * 0.11 + 0.02;
        this.opacity = Math.random() * 0.55 + 0.25;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.028 + 0.01;
        this.drift = (Math.random() - 0.5) * 0.05;

        // Special bright stars (more common for Starworks feel)
        if (Math.random() < 0.07) {
            this.size = Math.random() * 2.4 + 1.6;
            this.special = true;
            this.opacity = Math.random() * 0.4 + 0.5;
        } else {
            this.special = false;
        }

        if (!initial) {
            this.y = height + 12;
        }
    }

    update(delta) {
        this.y -= this.speed * delta;
        this.x += this.drift * delta;
        this.twinkle += this.twinkleSpeed * delta;

        if (this.y < -15) this.reset();
        if (this.x < -15) this.x = width + 15;
        if (this.x > width + 15) this.x = -15;
    }

    draw() {
        const pulse = 0.7 + Math.sin(this.twinkle) * 0.3;
        const alpha = this.opacity * pulse;

        if (!this.special) {
            // Normal soft star
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(190, 235, 255, ${alpha})`;
            ctx.fill();
            return;
        }

        // ===== SPECIAL STAR (Starworks style) =====
        const glowSize = this.size * 5;

        // Soft outer glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.15, `rgba(140, 220, 255, ${alpha * 0.8})`);
        gradient.addColorStop(0.4, `rgba(40, 160, 255, ${alpha * 0.35})`);
        gradient.addColorStop(1, "rgba(0, 80, 200, 0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Pointed star shape
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.twinkle * 0.15);

        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(0, -this.size * 2.8);
            ctx.lineTo(0.8, -0.8);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(230, 245, 255, ${alpha * 0.95})`;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        ctx.restore();
    }
}


/* =====================================================
   BUBBLE
===================================================== */

class Bubble {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 30;
        this.size = Math.random() * 7 + 2.5;
        this.speed = Math.random() * 0.55 + 0.2;
        this.opacity = Math.random() * 0.22 + 0.07;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.025 + 0.008;
        this.drift = (Math.random() - 0.5) * 0.35;
    }

    update(delta) {
        this.y -= this.speed * delta;
        this.x += Math.sin(this.wobble) * this.drift * delta;
        this.wobble += this.wobbleSpeed * delta;

        if (this.y < -40) {
            this.reset();
        }
    }

    draw() {
        // Soft outer glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(130, 215, 255, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(60, 170, 255, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, "rgba(0, 90, 220, 0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Main bubble body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 230, 255, ${this.opacity * 0.9})`;
        ctx.fill();

        // Highlight (makes it look more watery)
        ctx.beginPath();
        ctx.arc(
            this.x - this.size * 0.3,
            this.y - this.size * 0.3,
            this.size * 0.35,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 1.4})`;
        ctx.fill();
    }
}


/* =====================================================
   SHOOTING STAR
===================================================== */

class ShootingStar {
    constructor() {
        this.reset();
        this.active = false;
    }

    reset() {
        this.x = Math.random() * width * 0.85;
        this.y = Math.random() * height * 0.35;
        this.length = Math.random() * 100 + 70;
        this.speed = Math.random() * 14 + 10;
        this.angle = Math.PI / 3.8 + (Math.random() - 0.5) * 0.25;
        this.opacity = 0;
        this.life = 0;
        this.maxLife = Math.random() * 45 + 40;
        this.active = false;
    }

    update(delta) {
        if (!this.active) return;

        this.life += delta;
        this.x += Math.cos(this.angle) * this.speed * delta;
        this.y += Math.sin(this.angle) * this.speed * delta;

        if (this.life < 12) {
            this.opacity = this.life / 12;
        } else if (this.life > this.maxLife - 18) {
            this.opacity = Math.max(0, (this.maxLife - this.life) / 18);
        } else {
            this.opacity = 1;
        }

        if (this.life >= this.maxLife) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active || this.opacity <= 0) return;

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        // Trail
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(220, 245, 255, ${this.opacity})`);
        gradient.addColorStop(0.3, `rgba(120, 210, 255, ${this.opacity * 0.6})`);
        gradient.addColorStop(1, "rgba(0, 100, 220, 0)");

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}


/* =====================================================
   CREATE PARTICLES
===================================================== */

function createParticles() {
    stars = [];
    bubbles = [];
    shootingStars = [];

    const area = width * height;

    // More stars for stronger Starworks feel
    const starCount = Math.min(160, Math.floor(area / 8000));
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    // Bubbles
    const bubbleCount = Math.min(40, Math.floor(area / 25000));
    for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(new Bubble());
    }

    // Shooting stars pool
    for (let i = 0; i < 4; i++) {
        shootingStars.push(new ShootingStar());
    }
}


/* =====================================================
   RESIZE
===================================================== */

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createParticles();
}

window.addEventListener("resize", resizeCanvas);


/* =====================================================
   DEEP BLUE ATMOSPHERE
===================================================== */

function drawAtmosphere() {
    // Deep blue space/underwater base
    const mainGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        0,
        width * 0.5,
        height * 0.35,
        Math.max(width, height) * 0.75
    );
    mainGlow.addColorStop(0, "rgba(0, 80, 200, 0.09)");
    mainGlow.addColorStop(0.35, "rgba(0, 50, 140, 0.045)");
    mainGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = mainGlow;
    ctx.fillRect(0, 0, width, height);

    // Soft top light (like light coming through water)
    const topLight = ctx.createLinearGradient(0, 0, 0, height * 0.55);
    topLight.addColorStop(0, "rgba(40, 130, 255, 0.055)");
    topLight.addColorStop(0.6, "rgba(20, 80, 180, 0.02)");
    topLight.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = topLight;
    ctx.fillRect(0, 0, width, height * 0.55);
}


/* =====================================================
   ANIMATION LOOP
===================================================== */

function animate(time) {
    const delta = Math.min((time - lastTime) / 16.67, 3);
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    drawAtmosphere();

    // Stars
    for (const star of stars) {
        star.update(delta);
        star.draw();
    }

    // Bubbles
    for (const bubble of bubbles) {
        bubble.update(delta);
        bubble.draw();
    }

    // Shooting stars
    for (const ss of shootingStars) {
        ss.update(delta);
        ss.draw();
    }

    // Randomly trigger shooting stars
    if (Math.random() < 0.004) {
        const available = shootingStars.find(s => !s.active);
        if (available) {
            available.reset();
            available.active = true;
        }
    }

    requestAnimationFrame(animate);
}


/* =====================================================
   START
===================================================== */

resizeCanvas();
requestAnimationFrame(animate);