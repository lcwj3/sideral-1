import Signal from "./../Command/Signal";


export default class AbstractClass {

    /* LIFECYCLE */

    /**
     * @constructor
     */
    constructor () {

        /**
         * Unique id for the current object
         * @type {string}
         */
        this.id = AbstractClass.generateId();

        /**
         * Properties of the class
         * @type {{}}
         */
        this.props      = {};

        /**
         * Last value of properties of the class
         * @type {{}}
         */
        this.last       = {};

        /**
         * Slots for signals
         * @type {Array<Signal>}
         */
        this.signals    = [];

        /**
         * Children of AbstractClass
         * @type {Array<Object>}
         */
        this.children   = [];

        /**
         * Parent of the object
         * @type {*}
         */
        this.parent     = null;

        /**
         * PIXI Container
         * @type {*}
         */
        this.container  = new PIXI.Container();

        /**
         * List of all signals of the class
         * @type {{}}
         */
        this.SIGNAL     = {
            VALUE_CHANGE    : properties    => new Signal("VALUE_CHANGE", properties),
            UPDATE          : ()            => new Signal("UPDATE")
        };
    }

    /**
     * When initialized by a parent
     * @lifecycle
     * @param {Object} props: properties to merge
     * @returns {void}
     */
    initialize (props = {}) {
        Object.keys(props).forEach(key => this.props[key] = props[key]);
    }

    /**
     * Kill event
     * @lifecycle
     * @returns {void}
     */
    kill () {
        this.children.forEach(child => child.kill());

        if (this.container) {
            this.container.destroy(true);
        }
    }

    /**
     * Update called every loop
     * @lifecycle
     * @returns {void}
     */
    update () {
        this.children.forEach(child => child.update());
        this.trigger(this.SIGNAL.UPDATE());
    }

    /**
     * Called before a new game loop
     * @lifecycle
     * @returns {void}
     */
    nextCycle () {
        this.children.forEach(child => child.nextCycle());

        Object.keys(this.props).forEach(key => {
            if (this.props[key] !== this.last[key]) {
                this.trigger(this.SIGNAL.VALUE_CHANGE(key), this.props[key]);
            }

            this.last[key] = this.props[key];
        });

        // reset trigger of signals
        this.signals.forEach(signal => signal.triggered = false);
    }


    /* METHODS */

    /**
     * Set new properties to the object
     * @param {Object} props: properties to merge
     * @returns {*} current instance
     */
    setProps (props) {
        Object.keys(props).forEach(key => this.last[key] = this.props[key] = props[key]);

        return this;
    }

    /**
     * Swap the current PIXI container to another PIXI container
     * @param {*} nextContainer: PIXI Container
     * @returns {void|null} -
     */
    swapContainer (nextContainer) {
        if (!this.parent || (this.parent && !this.parent.container)) {
            return null;
        }

        const containerIndex    = this.parent.container.children.findIndex(child => child === this.container),
            children            = this.container.children.slice(0);

        this.parent.container.removeChild(this.container);
        this.container.destroy();

        if (containerIndex > -1) {
            this.parent.container.addChildAt(nextContainer, containerIndex);
        } else {
            this.parent.container.addChild(nextContainer);
        }

        this.container = nextContainer;
        children.forEach(child => this.container.addChild(child));
    }

    /**
     * Add an item to the current object
     * @param {Object} item: an AbstractClass inheritance item
     * @param {Object=} settings: props to merge to the item
     * @param {number=} index: set an index position for the item
     * @returns {Object} the item initialized
     */
    add (item, settings = {}, index) {
        if (!(item instanceof AbstractClass)) {
            throw new Error("AbstractClass.add : item must be an instance of Sideral Abstract Class");
        }

        item.parent = this;

        this.children.push(item);
        item.initialize(settings);

        if (item.container && this.container) {
            if (typeof index !== "undefined") {
                this.container.addChildAt(item.container, index);
            } else {
                this.container.addChild(item.container);
            }
        }

        return item;
    }

    /**
     * Bind a signal to an action
     * @param {Signal} signal: Signal to bind
     * @param {function} action: action to bind into the Signal
     * @returns {*} Current object
     */
    bind (signal, action) {
        let currentSignal = this.findSignal(signal.name, signal.properties);

        if (!currentSignal) {
            currentSignal = signal;
            this.signals.push(currentSignal);
        }

        currentSignal.actions.push(action);

        return this;
    }

    /**
     * Find a signal of signal by the name of a signal and properties
     * @param {string} signalName: name of the signal
     * @param {Array<*>} properties: array of properties
     * @returns {Signal} the signal
     */
    findSignal (signalName, properties) {
        return this.signals.find(signal => signal.name === signalName && signal.hasProperties(properties));
    }

    /**
     * Trigger a signal
     * @param {Signal} signalReference: signal to trigger
     * @param {*=} value: value of the changement
     * @returns {void}
     */
    trigger (signalReference, value) {
        const signal = this.findSignal(signalReference.name, signalReference.properties);

        if (signal) {
            signal.trigger(value);
        }
    }

    /* STATICS */

    /**
     * Generate an unique id
     * @returns {string} return the unique id
     */
    static generateId () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
}
