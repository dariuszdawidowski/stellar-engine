class Sprite {

    /**
     * Constructor
     * @param transform: {x, y} - initial position
     * @params resource: string - selector for image preloaded resource
     * @params width: Number - image width in pixels
     * @params height: Number - image height in pixels
     * @params cols: Number - number of columns in atlas (optional)
     * @params rows: Number - number of rows in atlas (optional)
     * @params cell: Number - grid cell size in pixels instead of providing rows and cols (optional)
     * @params scale: Number - scale image (optional)
     */

    constructor(args = {}) {

        /**
         * Current position in space
         * x,y: screen
         */
        this.transform = {
            x: 'transform' in args && 'x' in args.transform ? args.transform.x : 0,
            y: 'transform' in args && 'y' in args.transform ? args.transform.y : 0,
        };

        // Sprite atlas
        this.atlas = {
            width: args.width,
            height: args.height,
            cols: 'cell' in args ? args.width / args.cell : args.cols || 1,
            rows: 'cell' in args ? args.height / args.cell : args.rows || 1,
            cell: 'cell' in args ? args.cell : args.width / args.cols,
            image: document.querySelector(args.resource)
        };

        // Dimensions of one tile
        this.tile = {
            current: 0, // current frame
            width: this.atlas.width / this.atlas.cols,
            height: this.atlas.height / this.atlas.rows,
            scaled: {
                factor: args.scale || 1,
                width: (this.atlas.width / this.atlas.cols) * (args.scale || 1),
                height: (this.atlas.height / this.atlas.rows) * (args.scale || 1),
                halfWidth: ((this.atlas.width / this.atlas.cols) * (args.scale || 1)) / 2,
                halfHeight: ((this.atlas.height / this.atlas.rows) * (args.scale || 1)) / 2
            }
        };

    }

    /**
     * Set coordinates
     * @param x: Number
     * @param y: Number
     */

    position(x, y) {
        this.transform.x = x;
        this.transform.y = y;
    }

    /**
     * Set current frame cell
     * @param nr: Number
     */

    cell(nr) {
        this.tile.current = nr;
    }

    /**
     * Returns screen collider
     * @param view: View context
     */

    getCollider(view) {
        return {
            left: this.transform.x + view.canvasCenter.x - this.tile.scaled.halfWidth,
            top: this.transform.y + view.canvasCenter.y - this.tile.scaled.halfHeight,
            right: this.transform.x + view.canvasCenter.x + this.tile.scaled.halfWidth,
            bottom: this.transform.y + view.canvasCenter.y + this.tile.scaled.halfHeight
        };
    }

    /**
     * Draw single tile
     * @param view: View context
     */

    render(view) {
        // const sx = 'col' in args ? this.tile.width * args.col : 'nr' in args ? this.tile.width * (args.nr % this.atlas.cols) : 0;
        // const sy = 'row' in args ? this.tile.height * args.row : 'nr' in args ? this.tile.height * Math.floor(args.nr / this.atlas.cols) : 0;
        const sx = this.tile.width * (this.tile.current % this.atlas.cols);
        const sy = this.tile.height * Math.floor(this.tile.current / this.atlas.cols);
        // const dx = 'x' in args ? args.x + args.render.canvasCenter.x - this.tile.scaled.halfWidth : (args.gx * this.tile.scaled.width);
        // const dy = 'y' in args ? args.y + args.render.canvasCenter.y - this.tile.scaled.halfHeight : (args.gy * this.tile.scaled.height);
        const dx = this.transform.x + view.canvasCenter.x - this.tile.scaled.halfWidth;
        const dy = this.transform.y + view.canvasCenter.y - this.tile.scaled.halfHeight;
        view.ctx.drawImage(
            this.atlas.image,
            sx,
            sy,
            this.tile.width,
            this.tile.height,
            dx,
            dy,
            this.tile.scaled.width,
            this.tile.scaled.height
        );
    }

    /**
     * Debug render
     * @param view: View context
     */

    debug(view) {
        view.ctx.fillStyle = 'rgba(225,0,0,0.5)';
        const my = this.getCollider(view);
        view.ctx.fillRect(
            my.left,
            my.top,
            my.right - my.left,
            my.bottom - my.top
        );
    }

}
