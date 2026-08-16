export interface PlayerInputState {
    /** Normalized on-screen movement direction (up = -y, right = +x). */
    screenDirX: number;
    screenDirY: number;
    dodgePressed: boolean;
}

/**
 * Maps WASD/arrows to on-screen cardinal directions (not world axes), so
 * "up" always visually moves the character toward the top of the screen
 * even though that corresponds to a diagonal move in the isometric world grid.
 */
export class PlayerInput {

    private up: Phaser.Input.Keyboard.Key;
    private down: Phaser.Input.Keyboard.Key;
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private upArrow: Phaser.Input.Keyboard.Key;
    private downArrow: Phaser.Input.Keyboard.Key;
    private leftArrow: Phaser.Input.Keyboard.Key;
    private rightArrow: Phaser.Input.Keyboard.Key;
    private dodgeKey: Phaser.Input.Keyboard.Key;
    private dodgeKeyAlt: Phaser.Input.Keyboard.Key;

    constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
        const KC = Phaser.Input.Keyboard.KeyCodes;
        this.up = keyboard.addKey(KC.W);
        this.down = keyboard.addKey(KC.S);
        this.left = keyboard.addKey(KC.A);
        this.right = keyboard.addKey(KC.D);
        this.upArrow = keyboard.addKey(KC.UP);
        this.downArrow = keyboard.addKey(KC.DOWN);
        this.leftArrow = keyboard.addKey(KC.LEFT);
        this.rightArrow = keyboard.addKey(KC.RIGHT);
        this.dodgeKey = keyboard.addKey(KC.SPACE);
        this.dodgeKeyAlt = keyboard.addKey(KC.SHIFT);
    }

    public poll(): PlayerInputState {
        let screenDirX = 0;
        let screenDirY = 0;

        if (this.up.isDown || this.upArrow.isDown) screenDirY -= 1;
        if (this.down.isDown || this.downArrow.isDown) screenDirY += 1;
        if (this.left.isDown || this.leftArrow.isDown) screenDirX -= 1;
        if (this.right.isDown || this.rightArrow.isDown) screenDirX += 1;

        const length = Math.hypot(screenDirX, screenDirY);
        if (length > 0) {
            screenDirX /= length;
            screenDirY /= length;
        }

        const dodgePressed =
            Phaser.Input.Keyboard.JustDown(this.dodgeKey) ||
            Phaser.Input.Keyboard.JustDown(this.dodgeKeyAlt);

        return { screenDirX, screenDirY, dodgePressed };
    }
}
