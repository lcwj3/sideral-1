import Mixin from "./../Mixin";
import Entity from "./../Entity";
import Engine from "./../Engine";


export default class Collision extends Mixin {

    /* LIFECYCLE */

    /**
     * @constructor
     */
    constructor () {
        super();

        this.name = "collision";

        /**
         * Mass of the entity (collision)
         * @type {number}
         */
        this.mass           = 2;

        /**
         * Set the current factor of bounce when entering in collision
         * @type {number}
         */
        this.bouncing       = 0;

        /**
         * Know if the parent is in collision with wall within axis
         * @type {{x: boolean, y: boolean}}
         */
        this.collide = {x: false, y: false};

        /**
         * Mass enumeration
         * @readonly
         * @type {{NONE: string, WEAK: string, SOLID: string}}
         */
        this.MASS = {
            NONE    : 0,
            WEAK    : 1,
            SOLID   : 2
        };

        // private

        this._resolved = false;
    }

    /**
     * @initialize
     * @override
     */
    initialize (props) {
        super.initialize(props);

        this.interceptFunction("updateVelocity", this.updateVelocity);
    }

    /**
     * @nextCycle
     * @override
     */
    nextCycle () {
        super.nextCycle();

        this._entities  = null;
        this._scene     = null;
        this._resolved  = false;
    }

    /* OVERRIDES */

    /**
     * @override
     */
    updateVelocity () {
        const scene         = this.getScene();

        if (scene) {
            this.parent.vy      += scene.gravity * Engine.tick;
        }

        this.parent.moving  = this.parent.vx || this.parent.vy;

        if (!this._resolved) {
            this.resolveAll();
        }
    }

    /* METHODS */

    /**
     * Resolve all collision (wall and between entities) when entity is moving
     * @returns {void}
     */
    resolveAll () {
        const entity    = this.parent,
            scene       = this.getScene(),
            nextX       = entity.x + (entity.vx * Engine.tick),
            nextY       = entity.y + (entity.vy * Engine.tick);


        if (!entity.moving) {
            this.getEntitiesInCollision(entity.x, entity.x + entity.width, entity.y, entity.y + entity.height, { scene: scene, id: entity.id }).forEach(ent => entity.onCollisionWith(ent));

        } else {
            if (entity.x !== nextX) {
                this.resolveChain("x", this.shiftInX(entity, nextX));
            }

            if (entity.y !== nextY) {
                this.resolveChain("y", this.shiftInY(entity, nextY));
            }
        }

        this._resolved = true;
    }

    /**
     * Get all entities in contact
     * @param {number} xmin: position x min
     * @param {number} xmax: position x max
     * @param {number} ymin: position y min
     * @param {number} ymax: position y max
     * @param {Scene=} scene: scene to get all entities
     * @param {string=} id: id to filter
     * @param {Entity=} entities: entities to check
     * @returns {Array.<Entity>} array of entities in collision
     */
    getEntitiesInCollision (xmin, xmax, ymin, ymax, { scene, id, entities }) {
        entities = (entities || this.getEntities(scene)).
            filter(ent => this.filterEntityByPositionY(ent, ymin - 1, ymax + 1)).
            filter(ent => this.filterEntityByPositionX(ent, xmin - 1, xmax + 1));

        return id ? entities.filter(ent => ent.id !== id) : entities;
    }

    /**
     * Shift an entity on x axis
     * @param {Entity} entity: current entity
     * @param {number} nextX: next position
     * @param {Array<{entity: Entity, movable: boolean, nextPos: number, collide: boolean, onLeft: boolean}>} chains: current chains of collisions
     * @returns {Array<{entity: Entity, movable: boolean, nextPos: number, collide: boolean, onLeft: boolean}>} chains of collisions
     */
    shiftInX (entity, nextX, chains = []) {
        if (chains.find(chain => chain.entity.id === entity.id)) {
            return chains;
        }

        if (this.isGhost(entity)) {
            chains.push({ entity: entity, movable: true, nextPos: entity.x, collide: entity.collide, onLeft: true, ghost: true });

            return chains;
        }

        const scene     = this.getScene(),
            onLeft      = nextX < entity.x,
            logic       = this.getLogicXAt(scene, entity.x, nextX, entity.y, entity.y + entity.height, entity.width),
            lastChain   = chains[chains.length - 1],
            movable     = lastChain ? this.isMovable(entity, chains) && !logic.collide : !logic.collide;

        chains.push({ entity: entity, movable: movable, nextPos: logic.value, collide: logic.collide, onLeft: onLeft });

        this.getEntities(scene).
            filter(ent => this.filterEntityByPositionY(ent, entity.y, entity.y + entity.height)).
            filter(ent => this.filterEntityByPositionX(ent, logic.value, logic.value + entity.width)).
            filter(ent => !chains.find(chain => chain.entity.id === ent.id)).
            forEach(ent => this.shiftInX(ent, onLeft ? logic.value - ent.width : logic.value + entity.width, chains));

        return chains;
    }

    /**
     * Shift an entity on y axis
     * @param {Entity} entity: current entity
     * @param {number} nextY: next position
     * @param {Array<{entity: Entity, movable: boolean, nextPos: number, collide: boolean, onTop: boolean}>} chains: current chains of collisions
     * @returns {Array<{entity: Entity, movable: boolean, nextPos: number, collide: boolean, onTop: boolean, ghost: boolean}>} chains of collisions
     */
    shiftInY (entity, nextY, chains = []) {
        if (this.isGhost(entity)) {
            chains.push({ entity: entity, movable: true, nextPos: entity.y, collide: entity.collide, onTop: true, ghost: true });

            return chains;
        }

        const scene     = this.getScene(),
            onTop       = nextY > entity.y,
            logic       = this.getLogicYAt(scene, entity.y, nextY, entity.x, entity.x + entity.width, entity.height),
            lastChain   = chains[chains.length - 1],
            movable    = lastChain ? this.isMovable(entity, chains) && !logic.collide : !logic.collide;

        chains.push({ entity: entity, movable: movable, nextPos: logic.value, collide: logic.collide, onTop: onTop });

        this.getEntities(scene).
            filter(ent => this.filterEntityByPositionX(ent, entity.x, entity.x + entity.width)).
            filter(ent => this.filterEntityByPositionY(ent, logic.value, logic.value + entity.height)).
            filter(ent => !chains.find(chain => chain.entity.id === ent.id) && ent.id !== entity.id).
            forEach(ent => this.shiftInY(ent, onTop ? logic.value + entity.height : logic.value - ent.height, chains));

        return chains;
    }

    /**
     * Resolve all chains of collisions
     * @param {string} axis: axis x or y
     * @param {Array<{entity: Entity, movable: boolean, nextPos: number, collide: boolean, onLeft: boolean, onTop: boolean, ghost: boolean}>} chains: current chains of collisions
     * @returns {void}
     */
    resolveChain (axis, chains = []) {
        const indexEntityBlocked    = chains.findIndex(chain => !chain.movable);
        let lastChain               = null;

        if (indexEntityBlocked >= 0) {
            chains.slice(0, indexEntityBlocked + 1).reverse().forEach((chain, index, array) => {
                const nextChain     = array.slice(index + 1).find(x => !x.ghost);

                if (nextChain) {
                    if (axis === "x" && this.filterEntityByPositionY(nextChain.entity, chain.entity.y, chain.entity.y + chain.entity.height)) {
                        nextChain.entity.x  = chain.onLeft ? chain.entity.x + chain.entity.width : chain.entity.x - nextChain.entity.width;

                    } else if (axis === "y" && this.filterEntityByPositionX(nextChain.entity, chain.entity.x, chain.entity.x + chain.entity.width)) {
                        nextChain.entity.y  = chain.onTop ? chain.entity.y - nextChain.entity.height : chain.entity.y + chain.entity.height;

                    }
                }

                chain.entity.collision.collide[axis] = chain.collide;

                this.resolveBouncing(chain, lastChain && lastChain.entity);

                lastChain = chain;
            });

        } else {
            chains.filter(chain => !chain.ghost).forEach((chain, index, array) => {
                chain.entity[axis]                      = chain.nextPos;
                chain.entity.collision.collide[axis]    = chain.collide;

                if (axis === "y") {
                    chain.entity.standing               = chain.collide;
                }

                lastChain = index && array[index - 1];

                this.resolveBouncing(chain, lastChain && lastChain.entity);
            });
        }

        // Call event onCollisionWith
        chains.forEach((chain, index, array) => {
            if (chain.ghost) {
                this.getEntitiesInCollision(chain.entity.x, chain.entity.x + chain.entity.width, chain.entity.y, chain.entity.y + chain.entity.height, { id: chain.entity.id, entities: chains.map(x => x.entity) }).
                    forEach(other => {
                        chain.entity.onCollisionWith(other);
                        other.onCollisionWith(chain.entity)
                    }
                );

            } else {
                const nextChain = array[index + 1];

                lastChain       = array[index - 1];

                if (lastChain && !lastChain.ghost) {
                    chain.entity.onCollisionWith(lastChain.entity);
                }

                if (nextChain && !nextChain.ghost) {
                    chain.entity.onCollisionWith(nextChain.entity);
                }
            }

            if (chain.entity.collision) {
                chain.entity.collision._resolved = true;
            }
        });
    }

    resolveBouncing (chain, other) {
        if (typeof chain.onTop === "undefined") {
            this.resolveBouncingX(chain.entity, other, chain.collide, chain.onLeft);

        } else {
            this.resolveBouncingY(chain.entity, other, chain.collide, chain.onTop);

        }
    }

    resolveBouncingX (entity, other, collide, onLeft) {
        if (!entity.collision.bouncing || entity.collision.mass === this.MASS.SOLID) {
            return null;
        }

        entity.vx = other
            ? Math.abs(other.vx || entity.vx) * (other.x < entity.x ? 1 : -1) * entity.collision.bouncing
            : (collide ? Math.abs(entity.vx) * (onLeft ? 1 : -1) * entity.collision.bouncing : entity.vx);

        if (other && !entity.vy && other.vy) {
            entity.vy = other.vy * entity.collision.bouncing;
        }
    }

    resolveBouncingY (entity, other, collide, onTop) {
        if (!entity.collision.bouncing || entity.collision.mass === this.MASS.SOLID) {
            return null;
        }

        const bouncing      = entity.collision.bouncing;

        entity.vy = other
            ? Math.abs(other.vy || entity.vy) * (other.y < entity.y ? 1 : -1) * bouncing
            : (collide ? Math.abs(entity.vy) * (onTop ? -bouncing : bouncing) : entity.vy);
    }

    /**
     * Determine if there is a collision on X axis
     * @param {Scene} scene : current scene
     * @param {number} posX: position X
     * @param {number} nextX: position X needed
     * @param {number} ymin: position Y Min
     * @param {number} ymax: position Y Max
     * @param {number} width: width of the object
     * @returns {{collide: boolean, value: number}} get the position x
     */
    getLogicXAt (scene, posX, nextX, ymin, ymax, width) {
        if (!scene.tilemap || (scene.tilemap && !scene.tilemap.sprite)) {
            return nextX;
        }

        const orientation   = nextX > posX ? 1 : -1,
            cellXMin        = orientation > 0 ? Math.floor((posX + width) / scene.tilemap.tilewidth) : Math.floor(posX / scene.tilemap.tilewidth) - 1,
            cellXMax        = orientation > 0 ? Math.floor((nextX + width) / scene.tilemap.tilewidth) : Math.floor(nextX / scene.tilemap.tileheight),
            cellYMin        = Math.floor(Math.abs(ymin) / scene.tilemap.tileheight),
            cellYMax        = Math.floor(Math.abs(ymax - 1) / scene.tilemap.tileheight),
            grid            = scene.tilemap.grid.logic,
            result          = { collide: false, value: nextX };

        let cellY           = null;

        for (let y = cellYMin; y <= cellYMax; y++) {
            cellY = grid[y];

            if (!cellY) {
                continue;
            }

            for (let x = cellXMin; x !== (cellXMax + orientation); x += orientation) {
                if (cellY[x]) {
                    result.collide  = true;
                    result.value    = orientation > 0 ? (x * scene.tilemap.tilewidth) - width : (x + 1) * scene.tilemap.tilewidth;

                    return result;
                }
            }
        }

        return result;
    }

    /**
     * Determine if there is a collision on y axis
     * @param {Scene} scene : current scene
     * @param {number} posY : Y axis
     * @param {number} nextY : Y axis position needed
     * @param {number} xmin : X Min
     * @param {number} xmax : X Max
     * @param {number} height : height of the object
     * @returns {{collide: boolean, value: number}} get the position y
     */
    getLogicYAt (scene, posY, nextY, xmin, xmax, height) {
        if (!scene.tilemap || (scene.tilemap && !scene.tilemap.sprite)) {
            return nextY;
        }

        const orientation   = nextY > posY ? 1 : -1,
            cellYMin        = orientation > 0 ? Math.floor((posY + height) / scene.tilemap.tileheight) : Math.floor(nextY / scene.tilemap.tileheight),
            cellYMax        = orientation > 0 ? Math.floor((nextY + height) / scene.tilemap.tileheight) : Math.floor(posY / scene.tilemap.tileheight),
            cellXMin        = Math.floor(Math.abs(xmin) / scene.tilemap.tilewidth),
            cellXMax        = Math.floor(Math.abs(xmax - 1) / scene.tilemap.tilewidth),
            result          = { collide: false, value: nextY };

        let grid            = null;

        const loopParameter = {
            start: orientation > 0 ? cellYMin : cellYMax,
            end: orientation > 0 ? cellYMax : cellYMin
        };

        for (let y = loopParameter.start; y !== (loopParameter.end + orientation); y += orientation) {
            grid = scene.tilemap.grid.logic[y];

            if (!grid) {
                continue;
            }

            for (let x = cellXMin; x <= cellXMax; x++) {
                if (grid[x]) {
                    result.collide  = true;
                    result.value    = orientation > 0 ? (y * scene.tilemap.tileheight) - height : (y + 1) * scene.tilemap.tileheight;

                    return result;
                }
            }
        }

        return result;
    }

    /**
     * Check if the entity is movable relative to other entity
     * @param {Entity} entity : the entity
     * @param {Array} chains : chains of collisions
     * @returns {boolean} is movable
     */
    isMovable (entity, chains = []) {
        if (!entity || (entity && !entity.has("collision"))) {
            return false;
        }

        const mass = entity.collision.mass;

        if (chains.length > 1) {
            return mass !== this.MASS.SOLID;
        }

        const lastChain     = chains[chains.length - 1],
            lastEntity      = chains[chains.length - 1].entity,
            lastEntityMass  = lastEntity.collision.mass;

        if (lastEntityMass === this.MASS.WEAK && lastEntityMass === mass) {
            return !(lastEntity["v" + lastChain.axis] || entity["v" + lastChain.axis]);
        }

        return mass < lastEntityMass;
    }

    /**
     * Check if the entity passed in parameter is a ghost (mass === NONE)
     * @param {Entity} entity: entity to check
     * @returns {boolean} return true if the entity is a ghost
     */
    isGhost (entity) {
        if (!entity) {
            return true;
        }

        return !entity.has("collision") || (entity.has("collision") && entity.collision.mass === this.MASS.NONE);
    }

    /**
     * Get all entities in same axis with min and max value of this axis
     * @param {Array<Entity>} entities: entites to check
     * @param {string} axis: axis x or y
     * @param {number} min: min value of the axis
     * @param {number} max: max value of the axis
     * @returns {Array<Entity>} list of entities in the same axis
     */
    getEntitiesInAxis (entities, axis, min, max) {
        const size  = axis === "x" ? "width" : "height";

        return entities.filter(entity => {
            const posMin    = entity[axis],
                posMax      = posMin + entity[size];

            return posMin <= max || posMax >= min;
        });
    }

    /**
     * Filter an entity by range of position in x axis
     * @param {Entity} entity: entity to check
     * @param {number} xmin: position x min
     * @param {number} xmax: position x max
     * @returns {boolean} if entity is in range of position in x axis
     */
    filterEntityByPositionX (entity, xmin, xmax) {
        return entity.x > (xmin - entity.width) && entity.x < xmax;
    }

    /**
     * Filter an entity by range of position in y axis
     * @param {Entity} entity: entity to check
     * @param {number} ymin: position y min
     * @param {number} ymax: position y max
     * @returns {boolean} if entity is in range of position in y axis
     */
    filterEntityByPositionY (entity, ymin, ymax) {
        return entity.y > (ymin - entity.height) && entity.y < ymax;
    }

    /**
     * Get all entities from the scene
     * @param {Scene} scene: Get entities from the current scene
     * @returns {Array<Entity>} list of entities provided by the scene
     */
    getEntities (scene) {
        if (this._entities) {
            return this._entities;
        }

        this._entities = scene.children.filter(child => child instanceof Entity && child.id !== this.parent.id);

        return this._entities;
    }

    /**
     * Get current scene
     * @returns {Scene} current scene
     */
    getScene () {
        if (this._scene) {
            return this._scene;
        }

        this._scene = this.parent.getScene();

        return this._scene;
    }
}