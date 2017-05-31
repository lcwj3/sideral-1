import { Scene } from "src/Module";
import { Enum } from "src/Tool";
import { Particles } from "src/Entity";

import { Ball } from "./Ball";
import { Goal } from "./Goal";

import { PlayerCat } from "./Player/Cat/Cat";

import * as tilemapGrass from "../tilemaps/grass.json";
import * as fireConfig from "./Particles/flame.json";


/**
 * The arena class (extended from Scene)
 */
export class Arena extends Scene {

    /* ATTRIBUTES */

    /**
     * The current ball
     */
    ball: Ball;

    /**
     * The left goal
     */
    goalLeft: Goal;

    /**
     * The right goal
     */
    goalRight: Goal;

    /**
     * The player left
     */
    playerLeft: PlayerCat;

    /**
     * The player right
     */
    playerRight: PlayerCat;

    /**
     * The particles to be emitted when there is a new goal
     */
    flameParticles: Particles;

    /**
     * The position of the player spawn in x axis
     */
    spawnX: number = 100;


    /* LIFECYCLE */

    initialize (props: any) {
        super.initialize(props);
        this.setTilemap(tilemapGrass);
        this.enablePhysics(2000);

        const keyboard = this.context.game.keyboard;

        // signals
        keyboard.signals.keyChange.bind(Enum.KEY.Q, pressed => this.playerLeft && this.playerLeft.moveLeft(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.D, pressed => this.playerLeft && this.playerLeft.moveRight(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.Z, pressed => this.playerLeft && this.playerLeft.jump(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.S, pressed => this.playerLeft && this.playerLeft.fall(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.SPACE, pressed => pressed && this.playerLeft && this.playerLeft.attack());

        keyboard.signals.keyChange.bind(Enum.KEY.ARROW_LEFT, pressed => this.playerRight && this.playerRight.moveLeft(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.ARROW_RIGHT, pressed => this.playerRight && this.playerRight.moveRight(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.ARROW_UP, pressed => this.playerRight && this.playerRight.jump(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.ARROW_DOWN, pressed => this.playerRight && this.playerRight.fall(pressed));
        keyboard.signals.keyChange.bind(Enum.KEY.ENTER, pressed => pressed && this.playerRight && this.playerRight.attack());


        this.ball           = <Ball> this.spawn(new Ball(), 100, 100, { debug: true });
        this.goalLeft       = <Goal> this.spawn(new Goal(), 0, 448 - 130, { debug: true });
        this.goalRight      = <Goal> this.spawn(new Goal(), this.props.width - 45, 448 - 130, { flip: true, debug: true });
        this.playerLeft     = <PlayerCat> this.spawn(new PlayerCat(), this.spawnX, 150, { playerLeft: true, debug: true });
        this.playerRight    = <PlayerCat> this.spawn(new PlayerCat(true), this.props.width - this.spawnX - 150, 320, { playerRight: true, debug: true });

        this.flameParticles = <Particles>this.add(new Particles(), {
            images  : ["images/particles/bolt.png", "images/particles/fire.png"],
            config  : fireConfig,
            autoRun : false
        });

        (<any>window).scene = this;
    }


    /* METHODS */

    /**
     * When there is a new goal
     * @param goalSide - The goal
     */
    goal (goalSide: Goal) {
        this.shake(50);

        this.flameParticles.position(this.ball.props.x + (goalSide.props.flip ? this.ball.props.width + 20 : -20), this.ball.props.y + (this.ball.props.height / 2));
        this.flameParticles.run();
        this.props.motionFactor = 0.25;

        this.timers.addTimer("goal", 1000, () => {
            this.props.motionFactor = 1;

            this.ball.respawn();
            this.flameParticles.stop();
        });
    }
}
