import { Scene, Text } from "sideral/Module";
import { Enum, Assets, Color } from "sideral/Tool";
import { Particles } from "sideral/Entity";
import { Button } from "sideral/Graphic";

import { Ball } from "./../Ball";
import { Goal } from "./../Goal";

import { Cat } from "./../Player/Cat/Cat";

import * as tilemapGrass from "./../../tilemaps/grass.json";
import * as fireConfig from "./../Particles/flame.json";


// Preload
Assets.preloadTilemap(tilemapGrass)
    .preload("fire", "images/particles/fire.png")
    .preloadSound("goal", "sounds/goal.mp3")
    .preloadSound("explosion", "sounds/explosion.mp3")
    .preloadSound("battleTheme", "sounds/battleTheme.mp3");


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
    playerLeft: Cat;

    /**
     * The player right
     */
    playerRight: Cat;

    /**
     * The score text
     */
    score: Text;

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
        this.enablePhysics(75);

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


        this.ball           = <Ball> this.spawn(new Ball(), 100, 100);
        this.goalLeft       = <Goal> this.spawn(new Goal(), 0, 448 - 130);
        this.goalRight      = <Goal> this.spawn(new Goal(), this.props.width - 45, 448 - 130, { flip: true });
        this.playerLeft     = <Cat> this.spawn(new Cat(), this.spawnX, 150, { playerLeft: true });
        this.playerRight    = <Cat> this.spawn(new Cat(true), this.props.width - this.spawnX - 150, 320, { playerRight: true });
        this.score          = <Text> this.spawn(new Text(), this.props.width / 2, 10, {
            text: "0 - 0",
            fill: "white",
            stroke: "black",
            strokeThickness: 4
        });

        this.flameParticles = <Particles> this.add(new Particles(), {
            images  : ["bolt", "fire"],
            config  : fireConfig,
            autoRun : false
        });

        (<any>window).scene = this;

        Assets.getSound().playMusic("battleTheme", true);
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

        const playerWon = goalSide.props.flip ? this.playerLeft : this.playerRight,
            sound       = Assets.getSound();

        sound.play("explosion");
        sound.play("goal");

        playerWon.props.score++;
        this.score.props.text = `${this.playerLeft.props.score} - ${this.playerRight.props.score}`;

        this.timers.addTimer("goal", 500, () => {
            this.props.motionFactor = 1;

            this.ball.respawn();
            this.flameParticles.stop();
        });
    }
}
