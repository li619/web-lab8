class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score;
        this.canRetry = data.canRetry;
    }

    create() {
        // 添加渐变背景
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x1a237e, 0x1a237e, 0x0d47a1, 0x0d47a1, 1);
        gradient.fillRect(0, 0, 800, 600);

        // 游戏结束文本
        this.add.text(400, 200, '游戏结束', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 分数显示
        this.add.text(400, 300, `最终分数: ${this.score}`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 按钮容器
        const buttonContainer = this.add.container(400, 400);

        if (this.canRetry) {
            const retryButton = this.createButton('再试一次', 0, 0, () => {
                this.scene.start('GameScene');
            });
            buttonContainer.add(retryButton);
        }

        const menuButton = this.createButton('返回主菜单', 0, this.canRetry ? 60 : 0, () => {
            this.scene.start('MenuScene');
        });
        buttonContainer.add(menuButton);
    }

    createButton(text, x, y, callback) {
        const button = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 200, 50, 0x2196f3)
            .setInteractive()
            .on('pointerover', () => bg.setFillStyle(0x1976d2))
            .on('pointerout', () => bg.setFillStyle(0x2196f3))
            .on('pointerdown', callback);

        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        return button.add([bg, label]);
    }
} 