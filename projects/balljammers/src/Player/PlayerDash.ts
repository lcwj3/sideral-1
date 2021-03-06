import { Skill } from "sideral/Entity";
import { Sprite } from "sideral/Module";
import { Assets } from "sideral/Tool";

import { Player } from './Player';


Assets.preload("smoke", "images/effects/smoke.png")
    .preloadSound("dash", "sounds/dash.wav");

export class PlayerDashSkill extends Skill {

    /* ATTRIBUTES */

    side: number = Player.SIDE.NONE;
    owner: Player;


    /* LIFECYCLE */

    /**
     * @constructor
     */
    constructor () {
        super();

        this.movable    = false;
        this.duration   = 60;

        this.signals.skillStart.add(this.onSkillStart.bind(this));
        this.signals.skillUpdate.add(this.onSkillUpdate.bind(this));
        this.signals.skillComplete.add(this.onSkillComplete.bind(this));
    }


    /* EVENTS */

    /**
     * When skill starts
     * @returns {void}
     */
    onSkillStart () {
        Assets.getSound().play("dash");

        (<Sprite> this.owner.context.scene.add(new Sprite(), {
            imageId     : "smoke",
            width       : 128,
            height      : 128,
            x           : this.owner.props.x + (this.owner.props.width / 2) - 64,
            y           : this.owner.props.y + (this.owner.props.height / 2) - 64,
            autoKill    : true,
            flip        : this.owner.props.flip

        })).addAnimation("idle", 25, [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 1);
    }

    /**
     * When skill updates
     */
    onSkillUpdate () {
        this.owner.props.vx = this.owner.props.speed * (this.side === Player.SIDE.LEFT ? -5 : 5);
        this.owner.props.vy = 0;
    }

    /**
     * When skill is complete
     */
    onSkillComplete () {
        this.owner.dashSide = Player.SIDE.NONE;
    }
}
