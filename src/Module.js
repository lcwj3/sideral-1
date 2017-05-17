import SideralObject from "./SideralObject";

import Signal from "./Tool/Signal";


/**
 * SideralObject visible on screen
 * @class Module
 * @extends SideralObject
 */
export default class Module extends SideralObject {

    /* LIFECYCLE */

    /**
     * @constructor
     */
    constructor () {
        super();

        this.setProps({
            x       : 0,
            y       : 0,
            width   : 0,
            follow  : null,
            height  : 0
        });

        this.signals.click = new Signal(this.onBindClick.bind(this), this.onRemoveClick.bind(this));

        this.signals.propChange.bind(["x", "y"], this.onPositionChange.bind(this));
        this.signals.propChange.bind(["width", "height"], this.onSizeChange.bind(this));

        this.signals.update.add(this.updateFollow.bind(this));
    }


    /* METHODS */

    /**
     * Use this method to follow this entity by an other entity
     * @param {boolean} centered - if True, the follower will be centered to the followed
     * @param {number} offsetX - Offset in x axis
     * @param {number} offsetY - Offset in y axis
     * @param {number|null} offsetFlipX - Set a special offset in x axis if the followed is flipped
     * @returns {Object} Configuration object to follow this entity
     */
    beFollowed (centered = false, offsetX = 0, offsetY = 0, offsetFlipX = null) {
        return {
            target      : this,
            centered    : centered,
            offsetX     : offsetX,
            offsetY     : offsetY,
            offsetFlipX : offsetFlipX
        };
    }

    /**
     * Change the position of the current module
     * @param {number} x: new position in x axis
     * @param {number} y: new position in y axis
     * @returns {void}
     */
    position (x, y) {
        x = typeof x !== "undefined" ? x : this.props.x;
        y = typeof y !== "undefined" ? y : this.props.y;

        if (!this.initialized) {
            this.setProps({ x: x, y: y });

        } else {
            this.props.x = x;
            this.props.y = y;
        }
    }

    /**
     * Change the size of the current module
     * @param {number} width: new width of the current module
     * @param {number} height: new height of the current module
     * @returns {void}
     */
    size (width, height) {
        width   = typeof width !== "undefined" ? width : this.props.width;
        height  = typeof height !== "undefined" ? height : this.props.height;

        if (!this.initialized) {
            this.setProps({ width: width, height: height });

        } else {
            this.props.width = width;
            this.props.height = height;
        }
    }

    /**
     * Update the position of the pixi container
     * @returns {void}
     */
    updateContainerPosition () {
        if (this.container) {
            this.container.pivot.set(this.props.width / 2, this.props.height / 2);
            this.container.position.set(this.props.x + this.container.pivot.x, this.props.y + this.container.pivot.y);
        }
    }


    /* EVENTS */

    /**
     * Update the position of this entity if it follows a target
     * @returns {void}
     */
    updateFollow () {
        if (this.props.follow) {
            const { offsetX, offsetY, offsetFlipX, centered, target } = this.props.follow;

            this.props.x = target.props.x + (target.props.flip && offsetFlipX !== null ? offsetFlipX : offsetX) + (centered ? (target.props.width / 2) - (this.props.width / 2) : 0);
            this.props.y = target.props.y + offsetY + (centered ? (target.props.height / 2) - (this.props.height / 2) : 0);
        }
    }

    /**
     * When x or y attributes change
     * @returns {void}
     */
    onPositionChange () {
        this.updateContainerPosition();
    }

    /**
     * When width or height attribtues change
     * @returns {void}
     */
    onSizeChange () {
        this.updateContainerPosition();
    }

    /**
     * Fired when a listener is added to the signal click
     * @returns {void}
     */
    onBindClick () {
        if (this.container && this.signals.click.listenerLength === 1) {
            this.container.interactive  = true;
            this.container.buttonMode   = true;
            this.container.on("click", this.signals.click.dispatch.bind(this));
        }
    }

    /**
     * Fired when a listener is removed from the signal click
     * @returns {void}
     */
    onRemoveClick () {
        if (this.container && !this.signals.click.listenerLength) {
            this.container.interactive  = false;
            this.container.buttonMode   = false;
            this.container.off("click", this.signals.click.dispatch.bind(this));
        }
    }
}
