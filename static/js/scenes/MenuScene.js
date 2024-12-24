class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // 添加渐变背景
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x1976d2, 0x1976d2, 0x2196f3, 0x2196f3, 1);  // 蓝色渐变
        gradient.fillRect(0, 0, 800, 600);

        // 标题
        this.add.text(400, 200, '打砖块游戏', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 开始按钮
        const startButton = this.add.container(400, 300);
        
        const buttonBg = this.add.rectangle(0, 0, 200, 50, 0x4caf50)  // 绿色按钮
            .setInteractive()
            .on('pointerover', () => {
                buttonBg.setFillStyle(0x388e3c);  // 深绿色
                startButton.setScale(1.05);
            })
            .on('pointerout', () => {
                buttonBg.setFillStyle(0x4caf50);
                startButton.setScale(1);
            });

        const buttonText = this.add.text(0, 0, '开始游戏', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        startButton.add([buttonBg, buttonText]);

        buttonBg.on('pointerdown', () => {
            // 确保游戏场景被重置
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                gameScene.resetGame();
            }
            
            // 切换到游戏场景
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });
    }
} 