import { Howl, Howler } from "howler";
import { Assets } from "./index";


export class SoundLoader {

    /* ATTRIBUTES */

    /**
     * The percetange of progression
     * @readonly
     */
    progress: number = 0;

    /**
     * Event to fired during the loading
     * @readonly
     */
    onProgressEvent: Array<Function> = [];

    /**
     * Sound Manager provided by the loader
     * @readonly
     */
    manager: SoundManager = new SoundManager();

    /**
     * List of all sounds to load
     * @readonly
     */
    sounds: any = {};

    /**
     * OnLoad event
     */
    onLoad: Function = null;


    /* METHODS */

    /**
     * Add a new sound to load
     * @param id - id of the sound
     * @param url - path of the sound
     */
    preload (id: string, url: Array<string> | string): void {
        const sound = new Howl({
            src     : [].concat(url),
            preload : false
        });

        sound.on("load", this._onSoundLoad.bind(this));

        this.sounds[id] = sound;
    }

    /**
     * Know if the sound has completly load all sounds
     */
    isReady (): boolean {
        return !Object.keys(this.sounds).
            map(key => this.sounds[key].state()).
            filter(state => state !== "loaded").length;
    }

    /**
     * Load all sounds
     */
    load (onLoad?: Function): void {
        const sounds    = this.getAll(),
            onProgress  = this._onProgress.bind(this);

        this.onLoad = onLoad;
        sounds.forEach(sound => sound.once("load", onProgress));
        sounds.forEach(sound => sound.load());
    }

    /**
     * Get all sounds in array
     */
    getAll (): Array<Howl> {
        return Object.keys(this.sounds).map(key => this.sounds[key]);
    }

    /**
     * Add an event with a callback fired during the loading
     * @param callback - Function to load during the loading
     */
    onProgress (callback: Function): void {
        this.onProgressEvent.push(callback);
    }


    /* PRIVATE */

    /**
     * Event fired when a sound is loaded
     * @private
     */
    _onSoundLoad (): void {
        if (this.onLoad && this.isReady()) {
            this.manager.sounds = this.sounds;
            this.onLoad();
        }
    }

    /**
     * Fired when the loading is in progress
     */
    _onProgress (): void {
        const soundsKeys = Object.keys(this.sounds);

        this.progress = (soundsKeys.filter(key => this.sounds[key].seek() >= 0).length / soundsKeys.length) * 100;

        this.onProgressEvent.forEach(func => func(this.progress));
    }
}


/**
 * Sound manager (use it directly with Assets.sounds)
 */
export class SoundManager {

    /* ATTRIBUTES */

    /**
     * current music
     * @readonly
     */
    music: any = null;

    /**
     * List of all sounds availabe
     * @readonly
     */
    sounds: any = {};


    /* METHODS */

    /**
     * Play a sound
     * @param id - id of the sound to play
     */
    play (id: string): any {
        const sound = this.sounds[id];

        if (sound) {
            sound.play();
        }

        return sound;
    }

    /**
     * Play a music background
     * @param id - id of the sound to play
     */
    playMusic (id: string, loop: boolean = false): void {
        if (this.music) {
            this.music.stop();
        }

        if (id) {
            this.music = this.play(id);

        } else if (this.music) {
            this.music.play();

        }

        if (loop) {
            this.music.loop(loop);
        }
    }

    /**
     * Stop the current music
     */
    stop (): void {
        if (this.music) {
            this.music.stop();
        }
    }

    /**
     * Mute all sounds
     */
    mute (): void {
        Howler.mute(true);
    }

    /**
     * Unmute sounds
     */
    unmute (): void {
        Howler.mute(false);
    }
}