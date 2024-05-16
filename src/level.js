/**
 * Level map with all tiles, items and actors
 */

class Level {

    /**
     * Constructor
     */

    constructor() {

        // Center of the coordinate system correction (this is constant not scroll)
        this.offset = {x: 0, y: 0};

        // Scale
        this.scale = 1;

        // Tileset definitions {'tileset id': {ref: TileSet object reference, first: Number of index offset}, ...}
        this.tilesets = {};

        // Environment layers [{name: 'string', class: 'colliders|empty', map: [[]]}, ...]
        this.layers = [];

        // Items {'name/id': object, ...}
        this.items = {};

        // Characters {'name/id': Actor-like object, ...}
        this.chars = {};

        // NPCs {'name/id': Actor-like object, ...}
        this.npcs = {};

        // MOBS {'name/id': MOB object, ...}
        this.mobs = {};

        // Spawn points {'player': [{x, y}, ...], 'mob': [{x, y}, ...], ...}
        this.spawnpoints = {};

        // Stairs [{x1, y1, x2, y2, x3, y3, x4, y4}, ...] from left-top clockwise in world coordinates
        this.stairs = [];

        // Portals to other maps [{map, spawn, left, top, right, bottom}, ...]
        this.portals = [];

    }

    /**
     * Returns list of all colliders
     */

    getColliders(view) {
        const colliders = [];
        const tileset = Object.values(this.tilesets).length ? Object.values(this.tilesets)[0] : null;
        if (tileset) {
            this.layers.forEach(layer => {
                if (layer.class == 'colliders') {
                    colliders.push(...tileset.ref.getColliders(view, layer.map, this.offset.x, this.offset.y, tileset.first));
                }
            });
        }
        return colliders;
    }

    /**
     * Pre-calucations for stairs
     */

    precalcStairs(view) {
        for (let i = 0; i < this.stairs.length; i ++) {
            this.stairs[i]['left'] = Math.min(this.stairs[i].x1, this.stairs[i].x2, this.stairs[i].x3, this.stairs[i].x4);
            this.stairs[i]['top'] = Math.min(this.stairs[i].y1, this.stairs[i].y2, this.stairs[i].y3, this.stairs[i].y4);
            this.stairs[i]['right'] = Math.max(this.stairs[i].x1, this.stairs[i].x2, this.stairs[i].x3, this.stairs[i].x4);
            this.stairs[i]['bottom'] = Math.max(this.stairs[i].y1, this.stairs[i].y2, this.stairs[i].y3, this.stairs[i].y4);
            this.stairs[i]['angle'] = this.calculateTopEdgeAngle(this.stairs[i]);
        }
    }

    /**
     * Util: finding angle of top edge
     */

    calculateTopEdgeAngle(coordinates) {
        const points = [
            { x: coordinates.x1, y: -coordinates.y1 },
            { x: coordinates.x2, y: -coordinates.y2 },
            { x: coordinates.x3, y: -coordinates.y3 },
            { x: coordinates.x4, y: -coordinates.y4 }
        ];

        points.sort((a, b) => {
            if (a.y !== b.y) {
                return a.y - b.y;
            } else {
                return a.x - b.x;
            }
        });

        const [topPoint1, topPoint2] = points.slice(0, 2);

        let leftPoint, rightPoint;
        if (topPoint1.x < topPoint2.x) {
            leftPoint = topPoint1;
            rightPoint = topPoint2;
        } else {
            leftPoint = topPoint2;
            rightPoint = topPoint1;
        }

        const deltaX = rightPoint.x - leftPoint.x;
        const deltaY = rightPoint.y - leftPoint.y;
        const angleInRadians = Math.atan2(deltaY, deltaX);
        const angleInDegrees = angleInRadians * (180 / Math.PI);

        return angleInDegrees;
    }

    /**
     * Returns list of all stairs/slopes
     */

    getStairs(view) {
        return this.stairs;
    }

    /**
     * Returns a random spawn point
     */

    getSpawnPoint(type, fallback = {x: 0, y: 0}) {
        if (type in this.spawnpoints && this.spawnpoints[type].length > 0) {
            const spawnpoint = this.spawnpoints[type][randomRangeInt(0, this.spawnpoints[type].length - 1)];
            return {x: spawnpoint.x, y: spawnpoint.y};
        }
        return fallback;
    }

    /**
     * Returns all spawn point for given type
     */

    getSpawnPoints(type, fallback = [{x: 0, y: 0}]) {
        if (type in this.spawnpoints && this.spawnpoints[type].length > 0) {
            return this.spawnpoints[type];
        }
        return fallback;
    }

    /**
     * Returns spawn points with given match name e.g. 'mob.*'
     */

    // getSpawnPoints(pattern) {
    //     const spawnpoints = [];
    //     Object.entries(this.spawnpoints).forEach(([name, point]) => {
    //         console.log(point)
    //         if (matchWithAsterisk(pattern, name)) {
    //             point.forEach(p => {
    //                 spawnpoints.push({name, ...p});
    //             });
    //         }
    //     });
    //     return spawnpoints;
    // }

    /**
     * Returns list of all objects with class 'portal'
     */

    getPortals(view) {
        return this.portals;
    }

    /**
     * Update all actors
     */

    update(view, deltaTime) {

        // Update tilesets
        for (const tileset of Object.values(this.tilesets)) {
            tileset.ref.update(deltaTime);
        }

        // Gather level colliders
        const colliders = this.getColliders(view);

        // Idle all NPCs
        Object.values(this.npcs).forEach(character => {
            character.animIdle(deltaTime);
        });

        // Move all MOBs
        Object.values(this.mobs).forEach(character => {
            character.update({
                view,
                deltaTime,
                colliders
            });
        });

    }

    /**
     * Render all layers
     */

    render(view) {

        // Iterate layers
        this.layers.forEach(layer => {

            // Render backgrounds/foregrounds
            if (layer.class == 'image') {
                view.background(layer.src, {w: layer.w * this.scale, h: layer.h * this.scale}, layer.repeat, layer.parallax);
            }

            // Render objects
            else if (layer.class == 'objects') {

                // Items
                Object.values(this.items).forEach(item => item.render(view));

                // Characters
                const characters = [];

                // Collect culled characters
                Object.values(this.chars).forEach(character => {
                    const pos = view.world2Screen({
                        x: character.transform.x - character.tile.scaled.halfWidth,
                        y: character.transform.y - character.tile.scaled.halfHeight
                    });
                    if (pos.x > -character.tile.scaled.width && pos.x < view.canvas.width + character.tile.scaled.width && pos.y > -character.tile.scaled.height && pos.y < view.canvas.height + character.tile.scaled.height) characters.push(character);
                });

                // Collect culled NPCs
                Object.values(this.npcs).forEach(character => {
                    const pos = view.world2Screen({
                        x: character.transform.x - character.tile.scaled.halfWidth,
                        y: character.transform.y - character.tile.scaled.halfHeight
                    });
                    if (pos.x > -character.tile.scaled.width && pos.x < view.canvas.width + character.tile.scaled.width && pos.y > -character.tile.scaled.height && pos.y < view.canvas.height + character.tile.scaled.height) characters.push(character);
                });

                // Collect culled MOBs
                Object.values(this.mobs).forEach(character => {
                    const pos = view.world2Screen({
                        x: character.transform.x - character.tile.scaled.halfWidth,
                        y: character.transform.y - character.tile.scaled.halfHeight
                    });
                    if (pos.x > -character.tile.scaled.width && pos.x < view.canvas.width + character.tile.scaled.width && pos.y > -character.tile.scaled.height && pos.y < view.canvas.height + character.tile.scaled.height) characters.push(character);
                });

                // Sort characters
                characters.sort(function(a, b) {
                    return (a.transform.y + a.tile.scaled.halfHeight) - (b.transform.y + b.tile.scaled.halfHeight);
                });

                // Render characters
                characters.forEach(character => {
                    character.render(view);
                });
            }

            // Render tiles
            else {
                for (const tileset of Object.values(this.tilesets)) {
                    tileset.ref.render(view, layer.map, this.offset.x - layer.offset.x, this.offset.y - layer.offset.y, tileset.first);
                }

            }

        });

    }

    /**
     * Render debug info
     */

    debug(view) {

        // Iterate layers
        this.layers.forEach(layer => {

            // Colliders
            for (const tileset of Object.values(this.tilesets)) {
                if (layer.class == 'colliders')
                    tileset.ref.debug(view, layer.map, this.offset.x, this.offset.y, tileset.first);
            }

        });

        // Center view correction
        const ox = view.center.x + view.offset.x;
        const oy = view.center.y + view.offset.y;

        // Spawn points
        Object.entries(this.spawnpoints).forEach(([name, points]) => {
            points.forEach(point => {
                // Arrow
                view.ctx.fillStyle = 'rgba(0,255,0,0.8)';
                view.ctx.beginPath();
                const ax = point.x + ox;
                const ay = point.y + oy;
                view.ctx.moveTo(0 + ax, 0 + ay);
                view.ctx.lineTo(-8 + ax, -16 + ay);
                view.ctx.lineTo(8 + ax, -16 + ay);
                view.ctx.fill();
                // Name
                view.ctx.font = "14px sans-serif";
                const txtc = view.ctx.measureText(name).width / 2;
                view.ctx.fillText(name, ax - txtc, ay + 16);
            });
        });

        // Stairs
        view.ctx.fillStyle = 'rgba(0,255,255,0.5)';
        this.stairs.forEach(shape => {
            // Draw path
            view.ctx.beginPath();
            view.ctx.moveTo(shape.x1 + ox, shape.y1 + oy);
            view.ctx.lineTo(shape.x2 + ox, shape.y2 + oy);
            view.ctx.lineTo(shape.x3 + ox, shape.y3 + oy);
            view.ctx.lineTo(shape.x4 + ox, shape.y4 + oy);
            view.ctx.fill();
        });

        // Portals
        view.ctx.fillStyle = 'rgba(50,0,50,0.5)';
        this.portals.forEach(shape => {
            view.ctx.fillRect(
                shape.left + ox,
                shape.top + oy,
                shape.right - shape.left,
                shape.bottom - shape.top
            );
        });

        // Items
        Object.values(this.items).forEach(item => item.debug(view));

        // Characters
        Object.values(this.chars).forEach(character => character.debug(view));

        // View
        if (view.debugEnabled) view.debug();
    }


}
