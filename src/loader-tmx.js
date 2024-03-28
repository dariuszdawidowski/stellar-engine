/**
 * Loads .tmx Tiled Editor level file
 * https://doc.mapeditor.org/en/stable/reference/tmx-map-format/
 */

class LoaderTMX {

    parseLevel(xmlStr) {

        // Parse XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlStr, 'application/xml');

        // Create Level instance to return to
        const level = new Level();

        // Used tilesets
        doc.querySelectorAll('tileset').forEach(tileset => {
            level.tileset[tileset.getAttribute('source')] = tileset.getAttribute('firstgid');
        });

        // Layers
        doc.querySelectorAll('layer').forEach(layer => {
            const name = layer.getAttribute('name').toLowerCase();
            const data = layer.querySelector('data');
            if (['ground', 'colliders', 'cover'].includes(name) && data) {
                const arrayContent = data.textContent.split(',').map(Number); //.map(num => num - 1);
                level.env[name] = this.create2DArray(arrayContent, parseInt(layer.getAttribute('width')));
            }
        });

        return level;
    }

    create2DArray(arr, width) {
        let result = [];
        for (let i = 0; i < arr.length; i += width) {
            result.push(arr.slice(i, i + width));
        }
        return result;
    }

}
