import AbstractModule from "./../Abstract/AbstractModule";

import Shape from "./Shape";

import Body from "./../Command/Body";
import Enum from "./../Command/Enum";


export default class Tilemap extends AbstractModule {

    /* LIFECYCLE */

    /**
     * @constructor
     */
    constructor () {
        super();

        this.setProps({
            tilewidth   : 0,
            tileheight  : 0
        });

        this.bodies                 = [];
        this._debugs                = [];
        this.grid                   = {};
        this.gridContainer          = null;
        this.backgroundContainers   = [];
        this.decoratorContainers    = [];
    }


    /* METHODS */

    /**
     * Set a data to construct the tilemap
     * @param {*} data: data generaly provided by a json file
     * @returns {void}
     */
    setData (data) {
        const loader    = new PIXI.loaders.Loader();

        this.removeData();

        this.props.width        = 0;
        this.props.height       = 0;
        this.props.tilewidth    = data.tilewidth;
        this.props.tileheight   = data.tileheight;
        this.grid               = data.grid;

        // Determine the size of the tilemap
        data.grid.forEach(layer => layer.forEach(line => {
            this.props.width = line.length > this.props.width ? line.length : this.props.width;
        }));

        this.props.width *= this.props.tilewidth;
        this.props.height = data.grid[0].length * this.props.tileheight;

        // Load all assets
        if (data.backgrounds) {
            data.backgrounds.forEach((background, index) => loader.add(`background${index}`, background.path));
        }

        if (data.decorators) {
            Object.keys(data.decorators.data).forEach(key => loader.add(key, data.decorators.data[key]));
        }

        loader.load((currentLoader, resources) => {
            this._loadBackgrounds(data.backgrounds, resources);
            this._loadGrids(data.grid, data.path, data.debug);
            this._loadDecorators(data.decorators, resources);
            this._loadWalls(data.walls);
        });
    }

    /**
     * Remove all data from the tilemap
     * @returns {void}
     */
    removeData () {
        [].concat(this.gridContainer || [], this.backgroundContainers, this.decoratorContainers).forEach(container => {
            this.container.removeChild(container);
            container.destroy(true);
        });

        this.gridContainer          = null;
        this.backgroundContainers   = [];
        this.decoratorContainers    = [];
    }

    /**
     * when debug attributes change
     * @return {void}
     */
    toggleDebug () {
        this._debugs.forEach(_debug => _debug.kill());

        this._debugs = this.bodies.map(body => this.add(new Shape(), {
            x       : body.x,
            y       : body.y,
            box     : Enum.BOX.RECTANGLE,
            width   : body.width,
            height  : body.height,
            stroke  : "#FF0000",
            fill    : "transparent"
        }));
    }


    /* PRIVATE */

    /**
     * Load all grids provided by the data
     * @private
     * @param {*} grid: grid provided by the data
     * @param {string} path: path to the image
     * @param {Boolean=} debug: Active the debug mode
     * @returns {void}
     */
    _loadGrids (grid, path, debug) {
        const canvas    = document.createElement("canvas"),
            ctx         = canvas.getContext("2d"),
            image       = new Image();

        const { width, height, tilewidth, tileheight } = this.props;

        canvas.width    = width;
        canvas.height   = height;

        // Render the tilemap into the canvas
        image.onload = () => {
            grid.forEach(layer => layer.forEach((line, y) => line.forEach((tile, x) => {
                ctx.drawImage(image,
                    Math.floor(tile * tilewidth) % image.width,
                    Math.floor(tile * tilewidth / image.width) * tileheight,
                    tilewidth, tileheight,
                    x * tilewidth, y * tileheight,
                    tilewidth, tileheight
                );
            })));

            this.gridContainer = PIXI.Sprite.from(canvas);
            this.container.addChild(this.gridContainer);

            if (debug) {
                this.toggleDebug();
            }
        };

        image.src = path;
    }

    /**
     * Load all walls of the maps
     * @private
     * @param {*} walls: wall data
     * @returns {void}
     */
    _loadWalls (walls) {
        walls.forEach(wall => {
            const box      = wall[0],
                settings    = { mass: 0, gravityScale: 0, fixedX: true, fixedY: true, group: Enum.GROUP.GROUND };
            let body        = null;

            switch (box) {
            case Enum.BOX.CIRCLE: body = new Body.CircularBody(this.scene, wall[1], wall[2], wall[3], settings);
                break;
            default: body = new Body.RectangularBody(this.scene, wall[1], wall[2], wall[3], wall[4], settings);
                break;
            }

            if (body) {
                this.scene.world.addBody(body.data);
                this.bodies.push(body);
            }
        });
    }

    /**
     * Load all backgrounds provided by the tilemap
     * @param {Array<*>} backgrounds: array of backgrounds data
     * @param {*} resources: PIXI Loader resources
     * @returns {void|null} -
     * @private
     */
    _loadBackgrounds (backgrounds, resources) {
        if (!backgrounds) {
            return null;
        }

        this.backgroundContainers = backgrounds.reverse().map((background, index) => {
            const backgroundContainer = new PIXI.Sprite(resources[`background${index}`].texture);

            this.container.addChildAt(backgroundContainer, 0);

            if (background.offset) {
                backgroundContainer.x = background.offset.x;
                backgroundContainer.y = background.offset.y;
            }

            if (typeof background.ratio !== "undefined" && background.ratio !== 1) {
                backgroundContainer.scale.x = background.ratio;
                backgroundContainer.scale.y = background.ratio;
            }

            return backgroundContainer;
        });
    }

    /**
     * Load all decorators provided by the tilemap
     * @param {*} decorators: array of decorators data
     * @param {*} resources: PIXI Textures resources
     * @returns {void|null} -
     * @private
     */
    _loadDecorators (decorators, resources) {
        if (!decorators || (decorators && !decorators.items)) {
            return null;
        }

        this.decoratorContainers = decorators.items.map(item => {
            const decoratorContainer = new PIXI.Sprite(resources[item[0]].texture);

            decoratorContainer.x = item[1];
            decoratorContainer.y = item[2];

            return decoratorContainer;

        }).forEach(decoratorContainer => this.container.addChild(decoratorContainer));
    }
}
