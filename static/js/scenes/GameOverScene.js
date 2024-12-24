class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score;
        this.canRetry = data.canRetry;
    }

    create() {
        this.add.text(400, 200, '游戏结束', {
            fontSize: '48px',
            fill: '#2196f3',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(400, 300, `最终分数: ${this.score}`, {
            fontSize: '32px',
            fill: '#333'
        }).setOrigin(0.5);

        if (this.canRetry) {
            const restartButton = this.add.text(400, 400, '再试一次', {
                fontSize: '32px',
                fill: '#fff',
                backgroundColor: '#2196f3',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive();

            restartButton.on('pointerdown', () => {
                this.scene.start('GameScene');
            });
        }

        const menuButton = this.add.text(400, this.canRetry ? 460 : 400, '返回主菜单', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#ff4081',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
} 