export const Enum = {
    
    /**
     * The type of an entity
     */
    TYPE: {
        NONE    : -2,
        GHOST   : -1,
        STATIC  : 0,
        WEAK    : 1,
        SOLID   : 2
    },

    /**
     * The different type of shape
     */
    BOX: {
        RECTANGLE   : "rectangle",
        CIRCLE      : "circle"
    },

    /**
     * Group of collisions
     */
    GROUP: {
        NONE    : 1,
        ALL     : 2,
        GROUND  : 3,
        ALLY    : 4,
        ENEMY   : 5,
        NEUTRAL : 6,
        ENTITIES: 7
    },

    /**
     * Different measuration of the time
     */
    DURATION_TYPE: {
        FRAME           : "frame",
        MS              : "ms",
        ANIMATION_LOOP  : "animationLoop"
    },

    /**
     * The state of an input key
     */
    KEY_STATE: {
        PRESSED         : "pressed",
        HOLD            : "hold",
        RELEASED        : "released"
    },

    /**
     * List of all key inputs
     */
    KEY: {
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
    }
};
