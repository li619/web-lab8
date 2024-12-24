class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.resetGame();
    }

    // 添加重置游戏的方法
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.powerUps = [];
        this.soundEnabled = false;
        this.retryCount = 0;
        this.isPaused = false;
        this.ballLaunched = false;
    }

    preload() {
        // 加载音效
        this.load.audio('hitSound', '/static/penzhuang.mp3');

        // 创建临时图形
        const graphics = this.add.graphics();
        
        // 创建背景（使用更亮的渐变）
        graphics.fillGradientStyle(0xb3e5fc, 0xb3e5fc, 0x81d4fa, 0x81d4fa, 1);  // 明亮的天蓝色渐变
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture('background', 800, 600);
        
        // 创建闪亮的球
        graphics.clear();
        graphics.lineStyle(2, 0xffffff);
        graphics.fillStyle(0x03a9f4);
        graphics.beginPath();
        graphics.arc(10, 10, 8, 0, Math.PI * 2);
        graphics.closePath();
        graphics.strokePath();
        graphics.fill();
        graphics.generateTexture('ball', 20, 20);
        
        // 创建炫酷的球拍
        graphics.clear();
        graphics.lineStyle(2, 0xffffff);
        graphics.fillStyle(0x2196f3);
        graphics.fillRoundedRect(0, 0, 100, 20, 10);
        graphics.strokeRoundedRect(0, 0, 100, 20, 10);
        graphics.generateTexture('paddle', 100, 20);
        
        // 创建彩色砖块
        const colors = [
            0xff4081,  // 粉红
            0x7c4dff,  // 紫色
            0x00bcd4,  // 青色
            0x64dd17,  // 绿色
            0xffd600   // 黄色
        ];

        colors.forEach((color, i) => {
            graphics.clear();
            graphics.lineStyle(2, 0xffffff);
            graphics.fillStyle(color);
            graphics.fillRoundedRect(0, 0, 80, 30, 5);
            graphics.strokeRoundedRect(0, 0, 80, 30, 5);
            graphics.generateTexture(`brick${i}`, 80, 30);
        });

        graphics.destroy();
    }

    create() {
        // 从主菜单开始时重置游戏状态
        if (this.scene.previous === 'MenuScene') {
            this.resetGame();
        }
        // 从游戏结束场景重试时继续当前状态
        else if (this.scene.previous === 'GameOverScene') {
            // 只重置球和球拍的位置
            this.ballLaunched = false;
        }

        // 添加背景（使用更亮的颜色）
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff);  // 纯白色背景
        bg.fillRect(0, 0, 800, 600);
        
        // 添加一些装饰性的图案让背景不那么单调
        bg.lineStyle(2, 0xe3f2fd);
        for (let i = 0; i < 10; i++) {
            bg.strokeRect(i * 80, 0, 80, 600);
        }
        for (let i = 0; i < 8; i++) {
            bg.strokeRect(0, i * 80, 800, 80);
        }

        // 添加音效
        this.hitSound = this.sound.add('hitSound');

        // 创建UI
        this.createUI();
        
        // 设置物理系统
        this.physics.world.setBoundsCollision(true, true, true, false);

        // 创建球拍
        this.paddle = this.add.sprite(400, 580, 'paddle');
        this.physics.add.existing(this.paddle, false);
        this.paddle.body.immovable = true;
        this.paddle.setOrigin(0.5, 1);
        
        // 创建球
        this.ball = this.add.sprite(400, 560, 'ball');
        this.physics.add.existing(this.ball);
        this.ball.setOrigin(0.5);
        this.ball.body.setCircle(8);
        this.ball.body.setBounce(1);
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setMaxVelocity(400, 400);

        // 创建砖块组
        this.bricks = this.physics.add.staticGroup();
        this.createBricks();

        // 设置碰撞
        this.physics.add.collider(
            this.ball,
            this.paddle,
            this.hitPaddle,
            null,
            this
        );

        this.physics.add.collider(
            this.ball,
            this.bricks,
            this.hitBrick,
            null,
            this
        );

        // 初始化状态
        this.ballLaunched = false;

        // 添加开始提示
        this.startText = this.add.text(400, 450, '点击发射小球', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // 添加暂停功能
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        });

        // 添加暂停UI
        this.pauseText = this.add.text(400, 300, '游戏暂停', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(1000).setVisible(false);

        // 添加继续按钮
        this.resumeButton = this.add.text(400, 380, '点击继续', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#2196f3',
            padding: { x: 20, y: 10 },
            borderRadius: 10
        }).setOrigin(0.5).setDepth(1000).setVisible(false)
        .setInteractive()
        .on('pointerover', () => this.resumeButton.setStyle({ backgroundColor: '#1976d2' }))
        .on('pointerout', () => this.resumeButton.setStyle({ backgroundColor: '#2196f3' }))
        .on('pointerdown', () => this.resumeGame());

        // 暂停背景（使用浅色半透明）
        this.pauseOverlay = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0.3)
            .setDepth(999)
            .setVisible(false);
    }

    createUI() {
        // 创建UI容器
        const uiContainer = this.add.container(0, 0);
        
        // 创建顶部UI背景（使用浅色半透明）
        const uiBg = this.add.rectangle(400, 25, 800, 50, 0xffffff, 0.2);
        uiContainer.add(uiBg);

        // 分数显示
        this.scoreText = this.add.text(20, 15, '分数: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // 生命值显示
        this.livesText = this.add.text(200, 15, '❤️'.repeat(this.lives), {
            fontSize: '24px'
        });
        
        // 关卡显示
        this.levelText = this.add.text(400, 15, `关卡 ${this.level}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0);

        uiContainer.add([this.scoreText, this.livesText, this.levelText]);
    }

    createBricks() {
        const rows = 5;
        const cols = 8;
        const brickWidth = 80;
        const brickHeight = 30;
        const padding = 10;
        const offsetX = 80;
        const offsetY = 60;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const brickX = offsetX + j * (brickWidth + padding);
                const brickY = offsetY + i * (brickHeight + padding);
                const brick = this.bricks.create(
                    brickX,
                    brickY,
                    `brick${i % 5}`
                );
                brick.setScale(0.8);
            }
        }
    }

    hitBrick(ball, brick) {
        // 播放音效
        this.hitSound.play();

        // 计算碰撞角度
        const angle = Phaser.Math.Angle.Between(
            ball.x - ball.body.velocity.x,
            ball.y - ball.body.velocity.y,
            brick.x,
            brick.y
        );

        // 根据碰撞角度调整反弹方向
        const normalX = Math.cos(angle);
        const normalY = Math.sin(angle);
        const dot = ball.body.velocity.x * normalX + ball.body.velocity.y * normalY;
        
        ball.body.velocity.x -= 2 * dot * normalX;
        ball.body.velocity.y -= 2 * dot * normalY;

        // 确保最小垂直速度
        const minVerticalSpeed = 100;
        if (Math.abs(ball.body.velocity.y) < minVerticalSpeed) {
            ball.body.velocity.y = ball.body.velocity.y > 0 ? minVerticalSpeed : -minVerticalSpeed;
        }

        // 添加粒子效果
        const particles = this.add.particles(brick.x, brick.y, {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            tint: brick.tintTopLeft,
            lifespan: 500,
            quantity: 20
        });

        // 自动销毁粒子发射器
        this.time.delayedCall(500, () => {
            particles.destroy();
        });

        brick.destroy();
        this.score += 10;
        this.scoreText.setText('分数: ' + this.score);

        if (this.bricks.countActive() === 0) {
            this.levelComplete();
        }
    }

    hitPaddle(ball, paddle) {
        // 播放音效
        this.hitSound.play();

        const diff = ball.x - paddle.x;
        const normalizedDiff = Phaser.Math.Clamp(diff / (paddle.displayWidth / 2), -1, 1);
        const angle = normalizedDiff * 60;
        const speed = 400;
        
        ball.body.setVelocity(
            speed * Math.sin(Phaser.Math.DegToRad(angle)),
            -speed * Math.cos(Phaser.Math.DegToRad(angle))
        );
    }

    update() {
        if (this.isPaused) return;

        // 球拍跟随鼠标移动
        if (this.input.activePointer.x) {
            this.paddle.x = Phaser.Math.Clamp(
                this.input.activePointer.x,
                52,
                748
            );
        }

        // 未发射时球跟随球拍
        if (!this.ballLaunched) {
            this.ball.x = this.paddle.x;
            this.ball.y = this.paddle.y - 20;

            // 点击发射球
            if (this.input.activePointer.isDown) {
                this.ballLaunched = true;
                this.ball.body.setVelocity(0, -300);
                if (this.startText) {
                    this.startText.destroy();
                }
            }
        }

        // 检查球是否掉落
        if (this.ball.y > 600) {
            this.lives--;
            // 确保生命值不会小于0
            this.lives = Math.max(0, this.lives);
            this.livesText.setText('❤️'.repeat(Math.max(0, this.lives)));

            if (this.lives <= 0) {
                window.saveGameScore(this.score);
                this.scene.start('GameOverScene', {
                    score: this.score,
                    canRetry: this.retryCount < 1
                });
            } else {
                this.ballLaunched = false;
                this.ball.body.setVelocity(0, 0);
            }
        }
    }

    levelComplete() {
        this.level++;
        this.levelText.setText(`关卡 ${this.level}`);
        
        // 显示过关动画
        const levelCompleteText = this.add.text(400, 300, '关卡完成！', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        // 添加连续动画
        this.tweens.add({
            targets: levelCompleteText,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
                this.tweens.add({
                    targets: levelCompleteText,
                    alpha: 0,
                    scale: 1.5,
                    duration: 500,
                    delay: 1000,
                    ease: 'Back.in',
                    onComplete: () => {
                        levelCompleteText.destroy();
                        this.ballLaunched = false;
                        this.createBricks();
                    }
                });
            }
        });
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        this.pauseText.setVisible(true);
        this.resumeButton.setVisible(true);
        this.pauseOverlay.setVisible(true);

        // 添加动画效果
        this.tweens.add({
            targets: [this.pauseText, this.resumeButton],
            scale: { from: 0.5, to: 1 },
            duration: 200,
            ease: 'Back.out'
        });
    }

    resumeGame() {
        // 添加动画效果
        this.tweens.add({
            targets: [this.pauseText, this.resumeButton],
            scale: { from: 1, to: 0.5 },
            duration: 200,
            ease: 'Back.in',
            onComplete: () => {
                this.isPaused = false;
                this.physics.resume();
                this.pauseText.setVisible(false);
                this.resumeButton.setVisible(false);
                this.pauseOverlay.setVisible(false);
            }
        });
    }
} 