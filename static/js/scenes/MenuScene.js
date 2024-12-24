class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.add.text(400, 200, '打砖块游戏', {
            fontSize: '48px',
            fill: '#2196f3',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startButton = this.add.text(400, 300, '开始游戏', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#2196f3',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#1976d2' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#2196f3' });
        });

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
} 