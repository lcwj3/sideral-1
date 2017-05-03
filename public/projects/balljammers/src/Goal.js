import Entity from "src/Entity";


export default class Goal extends Entity {

    /* LIFECYCLE */

    /**
     * @constructor
     */
    constructor () {
        super();

        this.setProps({
            width           : 45,
            height          : 130
        });

        this.name   = "goal";
        this.type   = Entity.TYPE.STATIC;

        this.addSprite("images/goal.png", this.props.width, this.props.height);
    }
}
