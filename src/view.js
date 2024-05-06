/**
 * View context
 */

class View {

    /**
     * Constructor
     * @param args.canvas: DOM object - Canvas element
     * @param args.debug: bool - Debug enabled
     */

    constructor(args) {

        // Canvas and context
        this.canvas = args.canvas;
        this.ctx = this.canvas.getContext('2d');

        // Center of the canvas
        this.center = {x: 0, y: 0};

        // Offset for scroll
        this.offset = {x: 0, y: 0};

        // Debug info posted by other classes
        this.debugEnabled = 'debug' in args ? args.debug : false;
        this.debugBox = [];

        // Resize window
        window.addEventListener('resize', () => {
            this.fitCanvas();
        });
        
        // Fit first time
        this.fitCanvas();
    }

    /**
     * Clear screen
     */

    cls() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Fill with background image
     * @param resource: DOMElement - image ref to display
     * @param size: {w, h} - image width and height
     * @param repeat: {x, y} - repeat tiles
     * @param parallax: {x, y} - parallax speed
     */

    background(resource, size, repeat, parallax) {

        // Fit to screen
        if (repeat.x == 0 && repeat.y == 0) {
            const transform = this.coverCanvas(size.w, size.h);
            const parallaxX = (this.offset.x * parallax.x) % size.w;
            const parallaxY = (this.offset.y * parallax.y) % size.h;
            transform[0] = transform[0] + parallaxX;
            transform[1] = transform[1] + parallaxY;
            this.ctx.drawImage(resource, ...transform);
        }

        // Repeat X
        else if (repeat.x == 1 && repeat.y == 0) {
            const parallaxX = (this.offset.x * parallax.x) % size.w;
            const parallaxY = (this.offset.y * parallax.y) % size.h;
            for (let x = parallaxX - size.w; x < this.canvas.width; x += size.w) {
                this.ctx.drawImage(resource, x, parallaxY, size.w, size.h);
            }
        }

        // Repeat X,Y
        else if (repeat.x == 1 && repeat.y == 1) {
            const parallaxY = (this.offset.y * parallax.y) % size.h;
            for (let y = parallaxY - size.h; y < this.canvas.height; y += size.h) {
                const parallaxX = (this.offset.x * parallax.x) % size.w;
                for (let x = parallaxX - size.w; x < this.canvas.width; x += size.w) {
                    this.ctx.drawImage(resource, x, y, size.w, size.h);
                }
            }
        }

    }

    /**
     * Util: calculate image dimensions similiar to background-size: cover
     */

    coverCanvas(imgWidth, imgHeight) {
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imgRatio = imgWidth / imgHeight;
        let width = 0;
        let height = 0;
        let x = 0;
        let y = 0;

        if (canvasRatio > imgRatio) {
            width = this.canvas.width;
            height = this.canvas.width / imgRatio;
            x = 0;
            y = (this.canvas.height - height) / 2;
        } else {
            width = this.canvas.height * imgRatio;
            height = this.canvas.height;
            x = (this.canvas.width - width) / 2;
            y = 0;
        }
        return [x, y, width, height];
    }

    /**
     * Util: round number to nearest even
     * @param number: Number - value to round
     */

    roundToNearestEven(number) {
        let roundedNumber = Math.round(number);
        if (roundedNumber % 2 !== 0) roundedNumber += 1;
        return roundedNumber;
    }

    /**
     * Fit canvas dimensions and settings
     */

    fitCanvas() {
        this.canvas.width = this.roundToNearestEven(window.innerWidth);
        this.canvas.height = this.roundToNearestEven(window.innerHeight);
        this.center.x = this.canvas.width / 2;
        this.center.y = this.canvas.height / 2;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
    }

    /**
     * Centre screen on given point
     * @param args.x: Number - x coordinate
     * @param args.y: Number - y coordinate
     */

    centre(args) {
        this.offset.x = -args.x;
        this.offset.y = -args.y;
    }

    /**
     * World transform -> output screen transform (0,0 in the corner)
     * @param transform: {x, y}
     */

    world2Screen(transform) {
        return {
            x: transform.x + this.center.x + this.offset.x,
            y: transform.y + this.center.y + this.offset.y
        };
    }

    /**
     * Debug render
     * @param args.center: bool - display 0,0 of the world coordinates
     * @param args.sprite: Sprite object - sprite to display it's bounds
     */

    debug() {

        // Draw world coordinates center
        this.ctx.fillStyle = 'rgba(0,255,0,0.8)';
        this.ctx.beginPath();
        this.ctx.moveTo(...Object.values(this.world2Screen({x: 0, y: 0})));
        this.ctx.lineTo(...Object.values(this.world2Screen({x: -8, y: -16})));
        this.ctx.lineTo(...Object.values(this.world2Screen({x: 8, y: -16})));
        this.ctx.fill();

        // Name
        this.ctx.font = "14px sans-serif";
        const txtc = this.ctx.measureText('center').width / 2;
        this.ctx.fillText('center', this.center.x + this.offset.x - txtc, this.center.y + this.offset.y + 16);

        // Draw other classes boxes
        this.ctx.fillStyle = 'rgba(255,255,0,0.3)';
        this.debugBox.forEach(box => {
            this.ctx.fillRect(
                box.x + view.center.x + view.offset.x,
                box.y + view.center.y + view.offset.y,
                box.w,
                box.h
            );
        });

        // Clear debug info
        if (this.debugBox.length) this.debugBox = [];

        // Helper dot
        /*this.ctx.beginPath();
        this.ctx.arc(...Object.values(this.world2Screen({x: 961.09, y: 865.10})), 4, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(0,255,0,0.9)';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(...Object.values(this.world2Screen({x: 1090.37, y: 920.1})), 4, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255,0,255,0.9)';
        this.ctx.fill();*/

    }

}
