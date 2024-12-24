// 在游戏结束的地方添加
if (this.gameOver) {
    // 原有的游戏结束代码...
    window.saveGameScore(this.score);  // 添加这行来保存分数
} 

// 在 GameScene 类中的相关位置添加
if (this.lives <= 0) {
    // 保存分数
    window.saveGameScore(this.score);
    
    // 检查重试次数
    if (this.retryCount < 1) {
        this.retryCount++;
        this.scene.start('GameOverScene', { 
            score: this.score,
            canRetry: true 
        });
    } else {
        this.scene.start('GameOverScene', { 
            score: this.score,
            canRetry: false 
        });
    }
} 