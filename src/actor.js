/**
 * Actor - sprite with collision checking, animation and movement
 */

class Actor extends Sprite {

    /**
     * Create sprite
     * All Sprite params plus:
     * @param speed: Number - movement speed (pixels on second)
     * @param anim: Object - map of animations { speed: seconds, idle: [], moveUp: [], moveDown: [], moveLeft: [], moveRight: [] }
     * @param collider: {x, y, width, height} (in screen pixels already scaled)
     */

    constructor(args) {
        super(args);

        // Stats
        this.stats = {
            speed: args.speed,
        };

        /**
         * Movement direction
         * v: vertical action (n=north,s=south)
         * h: horizontal action (w=west,e=east)
         */
        this.transform['v'] = '';
        this.transform['h'] = '';

        // Collider
        this.collider = 'collider' in args ? args.collider : {x: 0, y: 0, width: this.tile.scaled.width, height: this.tile.scaled.height};

        // Animation map
        this.anim = 'anim' in args ? args.anim : { speed: 0, idle: [], moveUp: [], moveDown: [], moveLeft: [], moveRight: [] };
        this.anim.speed = this.anim.speed / 100.0;

        // Current frame
        this.frame = 0;

        // Current frame counter (horizontal movement)
        this.frameCounterH = 0;

        // Time of the last animation frame (horizontal movement)
        this.frameTimeH = this.anim.speed;

        // Current frame counter (vertical movement)
        this.frameCounterV = 0;

        // Time of the last animation frame (vertical movement)
        this.frameTimeV = this.anim.speed;
    }

    /**
     * Idle movement
     */

    idle() {
        this.frame = this.anim.idle[0];
        this.transform.v = '';
        this.transform.h = '';
    }

    /**
     * Returns world collider
     * @param context: Render context
     */

    getCollider(context) {
        return {
            left: this.transform.x + context.canvasCenter.x - this.tile.scaled.halfWidth + this.collider.x,
            top: this.transform.y + context.canvasCenter.y - this.tile.scaled.halfHeight + this.collider.y,
            right: this.transform.x + context.canvasCenter.x - this.tile.scaled.halfWidth + this.collider.x + this.collider.width,
            bottom: this.transform.y + context.canvasCenter.y - this.tile.scaled.halfHeight + this.collider.y + this.collider.height
        };
    }

    /**
     * Up collision checking
     * @param args.deltaTime Number - time passed since last frame
     * @param args.left: Number - left corner of collision layer
     * @param args.top: Number - top corner of collision layer
     * @param args.tiles: [Array] - collision tiles layer
     * @param args.edge: Number - single tile edge size (square)
     */

    collideUp(args) {

        // Move by pixels
        let pixels = this.stats.speed * args.deltaTime;

        // My collider
        const my = this.getCollider(args.context);

        // Check intersections
        for (const other of args.with) {
            if (my.top - pixels <= other.bottom && my.top - pixels >= other.top && my.right >= other.left && my.left <= other.right) {
                pixels -= other.bottom - (my.top - pixels - 1);
                if (pixels < 0) pixels = 0;
                return pixels;
            }
        }

        return pixels;
    }

    /**
     * Animate to the up side
     * @param deltaTime Number - time passed since last frame
     */

    animUp(deltaTime) {
        // Anim
        this.frameTimeV -= deltaTime;
        if (this.frameTimeV <= 0) {
            this.frameTimeV = this.anim.speed - this.frameTimeV;
            this.frameCounterV ++;
            if (this.frameCounterV == this.anim.moveUp.length) this.frameCounterV = 0;
        }
        this.frame = this.anim.moveUp[this.frameCounterV];
    }

    /**
     * Transfrom to the up side
     * @param pixels Number - how many pixels to move (constant or calculated by collideUp)
     */

    moveUp(pixels) {

        // Vertical action
        this.transform.v = 'n';

        // Move
        this.transform.y -= pixels;
    }

    /**
     * Down movement
     */

    /**
     * Down collision checking
     * @param args.deltaTime Number - time passed since last frame
     * @param args.left: Number - left corner of collision layer
     * @param args.top: Number - top corner of collision layer
     * @param args.tiles: [Array] - collision tiles layer
     * @param args.edge: Number - single tile edge size (square)
     */

    collideDown(args) {

        // Move by pixels
        let pixels = this.stats.speed * args.deltaTime;

        // My collider
        const my = this.getCollider(args.context);

        // Check intersections
        for (const other of args.with) {
            if (my.bottom + pixels >= other.top && my.bottom + pixels <= other.bottom && my.right >= other.left && my.left <= other.right) {
                pixels -= (my.bottom + pixels + 1) - other.top;
                if (pixels < 0) pixels = 0;
                return pixels;
            }
        }

        return pixels;
    }

    /**
     * Animate to the up side
     * @param deltaTime Number - time passed since last frame
     */

    animDown(deltaTime) {
        // Anim
        this.frameTimeV -= deltaTime;
        if (this.frameTimeV <= 0) {
            this.frameTimeV = this.anim.speed - this.frameTimeV;
            this.frameCounterV ++;
            if (this.frameCounterV == this.anim.moveDown.length) this.frameCounterV = 0;
        }
        this.frame = this.anim.moveDown[this.frameCounterV];
    }

    /**
     * Transfrom to the down side
     * @param pixels Number - how many pixels to move (constant or calculated by collideDown)
     */

    moveDown(pixels) {

        // Vertical action
        this.transform.v = 's';

        // Move
        this.transform.y += pixels;
    }

    /**
     * Right collision checking
     * @param args.deltaTime Number - time passed since last frame
     * @param args.left: Number - left corner of collision layer
     * @param args.top: Number - top corner of collision layer
     * @param args.tiles: [Array] - collision tiles layer
     * @param args.edge: Number - single tile edge size (square)
     */

    collideRight(args) {

        // Move by pixels
        let pixels = this.stats.speed * args.deltaTime;

        // My collider
        const my = this.getCollider(args.context);

        // Check intersections
        for (const other of args.with) {
            if (my.right + pixels >= other.left && my.right + pixels <= other.right && my.top <= other.bottom && my.bottom >= other.top) {
                pixels -= (my.right + pixels + 1) - other.left;
                if (pixels < 0) pixels = 0;
                return pixels;
            }
        }

        return pixels;
    }

    /**
     * Animate to the right side
     * @param deltaTime Number - time passed since last frame
     */

    animRight(deltaTime) {
        // Anim
        this.frameTimeH -= deltaTime;
        if (this.frameTimeH <= 0) {
            this.frameTimeH = this.anim.speed - this.frameTimeH;
            this.frameCounterH ++;
            if (this.frameCounterH == this.anim.moveRight.length) this.frameCounterH = 0;
        }
        this.frame = this.anim.moveRight[this.frameCounterH];
    }

    /**
     * Transfrom to the right side
     * @param pixels Number - how many pixels to move (constant or calculated by collideRight)
     */

    moveRight(pixels) {

        // Horizontal action
        this.transform.h = 'e';

        // Move
        this.transform.x += pixels;
    }

    /**
     * Left collision checking
     * @param args.context Render object - render context
     * @param args.deltaTime Number - time passed since last frame
     * @param args.with: [Array] - collision array [{left: Number, top: Number, right: Number, bottom: Number}, ...]
     */

    collideLeft(args) {

        // Move by pixels
        let pixels = this.stats.speed * args.deltaTime;

        // My collider
        const my = this.getCollider(args.context);

        // Check intersections
        for (const other of args.with) {
            if (my.left - pixels <= other.right && my.left - pixels >= other.left && my.top <= other.bottom && my.bottom >= other.top) {
                pixels += other.right - (my.left + pixels + 1);
                if (pixels < 0) pixels = 0;
                return pixels;
            }
        }

        return pixels;

    }

    /**
     * Animate to the left side
     * @param deltaTime Number - time passed since last frame
     */

    animLeft(deltaTime) {
        // Anim
        this.frameTimeH -= deltaTime;
        if (this.frameTimeH <= 0) {
            this.frameTimeH = this.anim.speed - this.frameTimeH;
            this.frameCounterH ++;
            if (this.frameCounterH == this.anim.moveLeft.length) this.frameCounterH = 0;
        }
        this.frame = this.anim.moveLeft[this.frameCounterH];
    }

    /**
     * Transfrom to the left side
     * @param pixels Number - how many pixels to move (constant or calculated by collideLeft)
     */

    moveLeft(pixels) {

        // Horizontal action
        this.transform.h = 'e';

        // Move
        this.transform.x -= pixels;
    }

    /**
     * Generic collision checking
     * @param other: any abstract object supports transform {x, y} and collider {x, y, width, height}
     */

    collideWith(other, scroll) {

        // My collider
        const my = {
            left: this.transform.x + (window.innerWidth / 2) - (this.tile.scaled.width / 2) + this.collider.x,
            top: this.transform.y + (window.innerHeight / 2) - (this.tile.scaled.height / 2) + this.collider.y,
            right: this.transform.x + (window.innerWidth / 2) - (this.tile.scaled.width / 2) + this.collider.x + this.collider.width,
            bottom: this.transform.y + (window.innerHeight / 2) - (this.tile.scaled.height / 2) + this.collider.y + this.collider.height
        };

        // That collider
        const that = {
            left: other.transform.x + (window.innerWidth / 2) - (other.tile.scaled.width / 2) + other.collider.x + scroll.x,
            top: other.transform.y + (window.innerHeight / 2) - (other.tile.scaled.height / 2) + other.collider.y + scroll.y,
            right: other.transform.x + (window.innerWidth / 2) - (other.tile.scaled.width / 2) + other.collider.x  + scroll.x + (other.collider.width * other.tile.scaled.factor),
            bottom: other.transform.y + (window.innerHeight / 2) - (other.tile.scaled.height / 2) + other.collider.y + scroll.y + (other.collider.height * other.tile.scaled.factor)
        };

        // Check crossections for all corners
        // Left-top
        if (my.left > that.left && my.left < that.right && my.top > that.top && my.top < that.bottom) return true;
        // Right-top
        else if (my.right > that.left && my.right < that.right && my.top > that.top && my.top < that.bottom) return true;
        // Left-bottom
        else if (my.left > that.left && my.left < that.right && my.bottom > that.top && my.bottom < that.bottom) return true;
        // Right-bottom
        else if (my.right > that.left && my.right < that.right && my.bottom > that.top && my.bottom < that.bottom) return true;

        return false;
    }

    /**
     * Render sprite
     */

    render(context) {
        super.position(this.transform.x, this.transform.y);
        super.cell(this.frame);
        super.render(context);
    }

}
