import { SideralObject } from "./SideralObject";
import { Util } from "./Tool/Util";
import { Signal } from "./Tool/Signal";
import { Scene } from "./Scene";
// import * as PIXI from 'pixi.js';

/**
 * The engine of the game
 * @class Game
 */
export class Game extends SideralObject {
    container: any;
    inputs: any = {};
    _inputs: any = {};
    fps: number = 60;
    latency: number = 0;
    tick: number = 1;
    lastUpdate: number = 0;
    stopped: boolean = true;
    preventInputPropagation: boolean = true;
    KEY: any;

    /* LIFECYCLE */

    /**
     * @constructor
     */
    constructor () {
        super();

        /**
         * Properties of the class
         * @name Game#props
         * @type {Object}
         * @property {number} width - The width of the game
         * @property {number} height - The height of the game
         * @property {Element} dom - The DOM Element to attach the game
         * @property {string} background - The color of the background of the game
         */
        this.setProps({
            width       : 10,
            height      : 10,
            dom         : document.getElementById("sideral"),
            background  : "#DDDDDD"
        });

        /**
         * @override
         */
        this.container  = PIXI.autoDetectRenderer(this.props.width, this.props.height, { autoResize: true, roundPixels: false });

        /**
         * List of all keyboard input pressed or released
         * @type {Object}
         * @name Game#inputs
         * @readonly
         */
        this.inputs     = {};
        this._inputs    = {};

        /**
         * The current frame per second of the engine
         * @readonly
         * @name Game#fps
         * @type {number}
         */
        this.fps        = 60;

        /**
         * The current latency of the game (in ms)
         * @readonly
         * @name Game#latency
         * @type {number}
         */
        this.latency    = 0;

        /**
         * The factor of velocity of object related to the latency
         * @readonly
         * @name Game#tick
         * @type {number}
         */
        this.tick       = 1;

        /**
         * The date of the last update in timestamp
         * @readonly
         * @name Game#lastUpdate
         * @type {number}
         */
        this.lastUpdate = 0;

        /**
         * Know if the game is currently looping or not
         * @readonly
         * @name Game#stopped
         * @type {boolean}
         */
        this.stopped    = true;

        /**
         * If true, the keyboard event will not be propaged
         * @name Game#preventInputPropagation
         * @type {boolean}
         */
        this.preventInputPropagation    = true;

        /**
         * Fired every time a keyboard input has been pressed or released
         * @name Game#keyPress
         * @event keyPress
         * @param {number} keyCode - The key code corresponding of the key input
         * @param {boolean} pressed - Check if the key input has been pressed or released
         */
        this.signals.keyPress = new Signal();

        this.signals.propChange.bind("dom", this._attachGame.bind(this));
        this.signals.propChange.bind(["width", "height"], this._resizeGame.bind(this));
        this.signals.propChange.bind("background", this._backgroundChange.bind(this));

        window.addEventListener("keydown", this._onKeydown.bind(this));
        window.addEventListener("keyup", this._onKeyup.bind(this));
    }

    /**
     * @override
     */
    kill () {
        super.kill();

        window.removeEventListener("keydown", this._onKeydown.bind(this));
        window.removeEventListener("keyup", this._onKeydown.bind(this));
    }

    /**
     * Update loop
     * @override
     * @lifecycle
     * @param {number=} performance - performance returned by the navigator
     * @returns {void|null} -
     */
    update (performance?: number) {
        if (this.stopped) {
            return null;
        }

        performance = performance || window.performance.now();
        requestAnimationFrame(this.update.bind(this));

        // 100ms latency max
        this.latency    = Util.limit(performance - this.lastUpdate, 0, 100);
        this.fps        = Math.floor(1000 / this.latency);
        this.tick       = 1000 / (this.fps * 1000);
        this.tick       = this.tick < 0 ? 0 : this.tick;

        this._updateInputs();

        this.children.forEach(scene => scene.update());
        this.children.forEach(scene => this.container.render(scene.container));

        this.nextCycle();

        this.lastUpdate = window.performance.now();
    }


    /* METHODS */

    /**
     * Add a new Scene into the game
     * @access public
     * @param {Scene} scene - scene to add to the lifecycle
     * @param {Object=} props - properties to pass to the object
     * @returns {Scene} The scene initialized
     */
    addScene (scene: Scene, props: any = {}): Scene {
        if (!(scene instanceof Scene)) {
            throw new Error("Game.add : object must be an instance of Sideral Scene Class.");
        }

        this.children.push(scene);
        scene.initialize(props);

        return scene;
    }

    /**
     * Start the game loop
     * @acess public
     * @param {number=} width - width of the game
     * @param {number=} height - height of the game
     * @param {Element=} dom - dom to attach the game
     * @returns {Game} current instance
     */
    start (width: number, height: number, dom?): this {
        this.setProps({
            width   : width || this.props.width,
            height  : height || this.props.height,
            dom     : dom || this.props.dom
        });

        if (!this.props.width || !this.props.height || !this.props.dom) {
            throw new Error("Engine.start: You must set 'width', 'height' and a 'dom' container");
        }

        this.stopped = false;
        this._attachGame();
        this._resizeGame();
        this.update();

        return this;
    }

    /**
     * resize the current canvas
     * @returns {void|null} -
     */
    resize () {
        if (!this.container) {
            return null;
        }

        this.container.resize(this.props.width, this.props.height);
    }


    /* PRIVATE */

    /**
     * Update all device inputs
     * @private
     * @returns {void}
     */
    _updateInputs () {
        const HOLD      = "HOLD",
            PRESSED     = "PRESSED",
            RELEASED    = "RELEASED";

        for (const key in this._inputs) {
            if (!this._inputs.hasOwnProperty(key)) {
                continue;
            }

            const input = this.inputs[key],
                _input = this._inputs[key];

            // Pressed
            if (_input === PRESSED) {
                if (input === _input) {
                    this.inputs[key] = HOLD;

                } else if (input !== HOLD) {
                    this.inputs[key] = PRESSED;
                    this.signals.keyPress.dispatch(key, true);
                }

            // Released
            } else if (_input === RELEASED) {
                if (!input) {
                    this.inputs[key] = PRESSED;

                } else if (input === _input) {
                    delete this.inputs[key];
                    delete this._inputs[key];

                } else {
                    this.inputs[key] = RELEASED;
                    this.signals.keyPress.dispatch(key, false);
                }
            }
        }
    }

    /**
     * Attach the game to the dom in props
     * @private
     * @returns {void}
     */
    _attachGame () {
        if (this.last.dom) {
            try {
                this.last.dom.removeChild(this.container.view);
            } catch (e) { }
        }

        if (this.props.dom) {
            this.props.dom.appendChild(this.container.view);
        }
    }

    /**
     * When width or height attributes change
     * @private
     * @returns {void|null} -
     */
    _resizeGame () {
        if (!this.container) {
            return null;
        }

        this.container.resize(this.props.width, this.props.height);
    }

    /**
     * When background attribute changes
     * @private
     * @returns {void}
     */
    _backgroundChange () {
        const color = Util.colorToDecimal(this.props.background) as number;

        if (!isNaN(color)) {
            this.container.backgroundColor = color;
        }
    }

    /**
     * event on keydown
     * @event keydown
     * @param {*} e - event
     * @returns {Boolean} Input propagation
     */
    _onKeydown (e) {
        if (this.preventInputPropagation) {
            e.preventDefault();
            e.stopPropagation();
        }

        this._inputs[e.keyCode] = "PRESSED";

        return !this.preventInputPropagation;
    }

    /**
     * event on keyup
     * @event keyup
     * @param {*} e - event
     * @returns {Boolean} Input propagation
     */
    _onKeyup (e) {
        if (this.preventInputPropagation) {
            e.preventDefault();
            e.stopPropagation();
        }

        this._inputs[e.keyCode] = "RELEASED";

        return !this.preventInputPropagation;
    }
}


PIXI.utils.skipHello();


export const currentGame = new Game();

/**
 * List of all Key Input
 * @name Game#KEY
 * @static
 * @type {Object}
 */
currentGame.KEY = {
    "BACKSPACE": "8",
    "TAB": "9",
    "ENTER": "13",
    "PAUSE": "19",
    "CAPS": "20",
    "ESC": "27",
    "SPACE": "32",
    "PAGE_UP": "33",
    "PAGE_DOWN": "34",
    "END": "35",
    "HOME": "36",
    "ARROW_LEFT": "37",
    "ARROW_UP": "38",
    "ARROW_RIGHT": "39",
    "ARROW_DOWN": "40",
    "INSERT": "45",
    "DELETE": "46",
    "NUM_0": "48",
    "NUM_1": "49",
    "NUM_2": "50",
    "NUM_3": "51",
    "NUM_4": "52",
    "NUM_5": "53",
    "NUM_6": "54",
    "NUM_7": "55",
    "NUM_8": "56",
    "NUM_9": "57",
    "A": "65",
    "B": "66",
    "C": "67",
    "D": "68",
    "E": "69",
    "F": "70",
    "G": "71",
    "H": "72",
    "I": "73",
    "J": "74",
    "K": "75",
    "L": "76",
    "M": "77",
    "N": "78",
    "O": "79",
    "P": "80",
    "Q": "81",
    "R": "82",
    "S": "83",
    "T": "84",
    "U": "85",
    "V": "86",
    "W": "87",
    "X": "88",
    "Y": "89",
    "Z": "90",
    "NUMPAD_0": "96",
    "NUMPAD_1": "97",
    "NUMPAD_2": "98",
    "NUMPAD_3": "99",
    "NUMPAD_4": "100",
    "NUMPAD_5": "101",
    "NUMPAD_6": "102",
    "NUMPAD_7": "103",
    "NUMPAD_8": "104",
    "NUMPAD_9": "105",
    "MULTIPLY": "106",
    "ADD": "107",
    "SUBSTRACT": "109",
    "DECIMAL": "110",
    "DIVIDE": "111",
    "F1": "112",
    "F2": "113",
    "F3": "114",
    "F4": "115",
    "F5": "116",
    "F6": "117",
    "F7": "118",
    "F8": "119",
    "F9": "120",
    "F10": "121",
    "F11": "122",
    "F12": "123",
    "SHIFT": "16",
    "CTRL": "17",
    "ALT": "18",
    "PLUS": "187",
    "COMMA": "188",
    "MINUS": "189",
    "PERIOD": "190"
};

// export default currentGame;
