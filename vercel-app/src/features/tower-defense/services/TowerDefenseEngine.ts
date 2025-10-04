import {
  GameState,
  GameMap,
  Tower,
  Enemy,
  Projectile,
  GameWave,
  EnemyType,
  EnemyStats,
  TowerAbility,
  AbilityType,
  EnemyVisualData,
  AnimationData
} from '@/types/TowerDefense';
import { AudioService } from '@/shared/services/AudioService';

export class TowerDefenseEngine {
  private gameState: GameState;
  private animationFrameId: number | null = null;
  private onGameStateUpdate?: (state: GameState) => void;
  private lastWaveSpawn: number = 0;
  private enemySpawnIndex: number = 0;

  constructor(initialMap: GameMap, onStateUpdate?: (state: GameState) => void) {
    this.onGameStateUpdate = onStateUpdate;
    this.gameState = this.initializeGameState(initialMap);
  }

  private initializeGameState(map: GameMap): GameState {
    return {
      isPlaying: false,
      isPaused: false,
      currentWave: 0,
      waveProgress: 0,
      enemiesRemaining: 0,
      health: 100,
      maxHealth: 100,
      gold: 500, // Starting gold
      experience: 0,
      score: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      selectedTower: undefined,
      hoveredTile: undefined,
      currentMap: map,
      gameSpeed: 1.0,
      lastUpdate: Date.now()
    };
  }

  // Game control methods
  startGame(): void {
    this.gameState.isPlaying = true;
    this.gameState.isPaused = false;
    this.startGameLoop();
    this.notifyStateUpdate();
  }

  pauseGame(): void {
    this.gameState.isPaused = true;
    this.notifyStateUpdate();
  }

  resumeGame(): void {
    this.gameState.isPaused = false;
    this.notifyStateUpdate();
  }

  stopGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.notifyStateUpdate();
  }

  resetGame(): void {
    this.stopGame();
    this.gameState = this.initializeGameState(this.gameState.currentMap);
    this.lastWaveSpawn = 0;
    this.enemySpawnIndex = 0;
    this.notifyStateUpdate();
  }

  setGameSpeed(speed: number): void {
    this.gameState.gameSpeed = Math.max(0.1, Math.min(3.0, speed));
    this.notifyStateUpdate();
  }

  // Tower management methods
  placeTower(tower: Tower, x: number, y: number): boolean {
    // Check if position is valid
    if (!this.isValidTowerPlacement(x, y)) {
      return false;
    }

    // Check if player has enough gold
    if (this.gameState.gold < tower.cost) {
      return false;
    }

    // Place the tower
    const placedTower = {
      ...tower,
      id: `tower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: { x, y }
    };

    this.gameState.towers.push(placedTower);
    this.gameState.gold -= tower.cost;
    this.notifyStateUpdate();
    return true;
  }

  sellTower(towerId: string): boolean {
    const towerIndex = this.gameState.towers.findIndex(t => t.id === towerId);
    if (towerIndex === -1) return false;

    const tower = this.gameState.towers[towerIndex];
    const sellValue = Math.floor(tower.cost * 0.7); // 70% sell value

    this.gameState.towers.splice(towerIndex, 1);
    this.gameState.gold += sellValue;
    
    if (this.gameState.selectedTower?.id === towerId) {
      this.gameState.selectedTower = undefined;
    }

    this.notifyStateUpdate();
    return true;
  }

  upgradeTower(towerId: string, upgradeId: string): boolean {
    const tower = this.gameState.towers.find(t => t.id === towerId);
    if (!tower) return false;

    const upgrade = tower.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    // Check requirements
    if (upgrade.requirements?.towerLevel && tower.level < upgrade.requirements.towerLevel) {
      return false;
    }

    if (this.gameState.gold < upgrade.cost) {
      return false;
    }

    // Apply upgrade
    tower.level = upgrade.level;
    this.gameState.gold -= upgrade.cost;

    // Apply stat modifications
    Object.entries(upgrade.effects.statModifiers).forEach(([stat, modifier]) => {
      if (modifier !== undefined && stat in tower.stats) {
        (tower.stats as unknown as Record<string, number>)[stat] += modifier;
      }
    });

    // Add new abilities
    if (upgrade.effects.newAbilities) {
      tower.abilities.push(...upgrade.effects.newAbilities);
    }

    // Apply visual changes
    if (upgrade.effects.visualChanges) {
      Object.assign(tower.visualData, upgrade.effects.visualChanges);
    }

    this.notifyStateUpdate();
    return true;
  }

  selectTower(towerId: string): void {
    const tower = this.gameState.towers.find(t => t.id === towerId);
    this.gameState.selectedTower = tower;
    this.notifyStateUpdate();
  }

  // Wave and enemy management
  startNextWave(): void {
    if (this.gameState.currentWave >= this.gameState.currentMap.waves.length) {
      // Game won!
      this.stopGame();
      return;
    }

    this.gameState.currentWave++;
    this.gameState.waveProgress = 0;
    this.enemySpawnIndex = 0;
    this.lastWaveSpawn = Date.now();
    
    const wave = this.getCurrentWave();
    if (wave) {
      this.gameState.enemiesRemaining = wave.enemies.reduce((sum, e) => sum + e.count, 0);
    }

    this.notifyStateUpdate();
  }

  private getCurrentWave(): GameWave | undefined {
    return this.gameState.currentMap.waves[this.gameState.currentWave - 1];
  }

  // Main game loop
  private startGameLoop(): void {
    const gameLoop = () => {
      if (!this.gameState.isPlaying) return;
      
      if (!this.gameState.isPaused) {
        const now = Date.now();
        const deltaTime = (now - this.gameState.lastUpdate) * this.gameState.gameSpeed;
        this.gameState.lastUpdate = now;
        
        this.updateGame(deltaTime);
      }

      this.animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }

  private updateGame(deltaTime: number): void {
    this.spawnEnemies();
    this.updateEnemies(deltaTime);
    this.updateTowers(deltaTime);
    this.updateProjectiles(deltaTime);
    this.checkCollisions();
    this.cleanupDeadObjects();
    this.notifyStateUpdate();
  }

  private spawnEnemies(): void {
    const wave = this.getCurrentWave();
    if (!wave || this.enemySpawnIndex >= wave.enemies.length) return;

    const currentEnemy = wave.enemies[this.enemySpawnIndex];
    const timeSinceWaveStart = Date.now() - this.lastWaveSpawn;

    if (timeSinceWaveStart >= currentEnemy.startTime * 1000) {
      // Spawn enemies based on spawn delay
      const spawnInterval = currentEnemy.spawnDelay * 1000;
      const enemiesSpawned = Math.floor(timeSinceWaveStart / spawnInterval);

      for (let i = 0; i < Math.min(currentEnemy.count, enemiesSpawned + 1); i++) {
        if (this.gameState.enemies.filter(e => e.type === currentEnemy.type).length < currentEnemy.count) {
          this.spawnEnemy(currentEnemy.type);
        }
      }

      // Move to next enemy type if all spawned
      if (this.gameState.enemies.filter(e => e.type === currentEnemy.type).length >= currentEnemy.count) {
        this.enemySpawnIndex++;
      }
    }

    // Update wave progress
    const totalEnemies = wave.enemies.reduce((sum, e) => sum + e.count, 0);
    const spawnedEnemies = this.gameState.enemies.length;
    this.gameState.waveProgress = Math.min(1, spawnedEnemies / totalEnemies);
  }

  private spawnEnemy(type: EnemyType): void {
    const enemy: Enemy = {
      id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: this.getEnemyName(type),
      position: { ...this.gameState.currentMap.path[0] },
      path: [...this.gameState.currentMap.path],
      pathIndex: 0,
      stats: this.getEnemyStats(type, this.gameState.currentWave),
      status: [],
      visualData: this.getEnemyVisualData(type),
      reward: this.getEnemyReward(type, this.gameState.currentWave)
    };

    this.gameState.enemies.push(enemy);
  }

  private updateEnemies(deltaTime: number): void {
    this.gameState.enemies.forEach(enemy => {
      // Update status effects
      enemy.status = enemy.status.filter(status => {
        status.duration -= deltaTime;
        return status.duration > 0;
      });

      // Calculate movement speed with status effects
      let moveSpeed = enemy.stats.speed;
      enemy.status.forEach(status => {
        if (status.type === 'slow') {
          moveSpeed *= (1 - status.value);
        } else if (status.type === 'freeze') {
          moveSpeed = 0;
        }
      });

      // Move along path
      if (moveSpeed > 0 && enemy.pathIndex < enemy.path.length - 1) {
        const current = enemy.position;
        const target = enemy.path[enemy.pathIndex + 1];
        const distance = Math.sqrt(
          Math.pow(target.x - current.x, 2) + Math.pow(target.y - current.y, 2)
        );

        const moveDistance = (moveSpeed * deltaTime) / 1000;
        
        if (distance <= moveDistance) {
          // Reached next waypoint
          enemy.pathIndex++;
          enemy.position = { ...target };
        } else {
          // Move towards next waypoint
          const ratio = moveDistance / distance;
          enemy.position.x += (target.x - current.x) * ratio;
          enemy.position.y += (target.y - current.y) * ratio;
        }
      }

      // Apply damage over time effects
      enemy.status.forEach(status => {
        if (status.type === 'burn' || status.type === 'poison') {
          enemy.stats.currentHealth -= (status.value * deltaTime) / 1000;
        }
      });

      // Check if enemy reached the end
      if (enemy.pathIndex >= enemy.path.length - 1) {
        this.gameState.health -= 1;
        enemy.stats.currentHealth = 0; // Mark for removal
      }
    });
  }

  private updateTowers(deltaTime: number): void {
    this.gameState.towers.forEach(tower => {
      // Update ability cooldowns
      tower.abilities.forEach(ability => {
        if (ability.lastUsed > 0) {
          ability.lastUsed = Math.max(0, ability.lastUsed - deltaTime);
        }
      });

      // Find targets and attack
      const target = this.findNearestEnemy(tower);
      if (target) {
        this.towerAttack(tower, target);
        
        // Use abilities
        tower.abilities.forEach(ability => {
          if (this.canUseAbility(ability, tower, target)) {
            this.useAbility(tower, ability, target);
          }
        });
      }
    });
  }

  private updateProjectiles(deltaTime: number): void {
    this.gameState.projectiles.forEach(projectile => {
      // Move projectile
      projectile.position.x += projectile.velocity.x * deltaTime / 1000;
      projectile.position.y += projectile.velocity.y * deltaTime / 1000;

      // Check if projectile reached target or max range
      if (projectile.targetId) {
        const target = this.gameState.enemies.find(e => e.id === projectile.targetId);
        if (target) {
          const distance = Math.sqrt(
            Math.pow(target.position.x - projectile.position.x, 2) +
            Math.pow(target.position.y - projectile.position.y, 2)
          );

          if (distance < 10) {
            // Hit target
            this.projectileHit(projectile, target);
            projectile.piercing = 0; // Mark for removal
          }
        }
      }
    });
  }

  private checkCollisions(): void {
    // This would handle more complex collision detection
    // Currently handled in updateProjectiles
  }

  private cleanupDeadObjects(): void {
    // Remove dead enemies
    const deadEnemies = this.gameState.enemies.filter(e => e.stats.currentHealth <= 0);
    deadEnemies.forEach(enemy => {
      this.gameState.gold += enemy.reward.gold;
      this.gameState.experience += enemy.reward.experience;
      this.gameState.score += enemy.reward.gold * 10;
      this.gameState.enemiesRemaining--;
    });

    this.gameState.enemies = this.gameState.enemies.filter(e => e.stats.currentHealth > 0);

    // Remove spent projectiles
    this.gameState.projectiles = this.gameState.projectiles.filter(p => p.piercing > 0);

    // Check if wave is complete
    if (this.gameState.enemiesRemaining <= 0 && this.gameState.enemies.length === 0) {
      const wave = this.getCurrentWave();
      if (wave) {
        this.gameState.gold += wave.reward.gold;
        this.gameState.experience += wave.reward.experience;
      }
    }

    // Check game over
    if (this.gameState.health <= 0) {
      this.stopGame();
    }
  }

  // Helper methods
  private isValidTowerPlacement(x: number, y: number): boolean {
    // Check if position is in buildable area
    return this.gameState.currentMap.buildableAreas.some(area =>
      x >= area.x && x <= area.x + area.width &&
      y >= area.y && y <= area.y + area.height
    ) && !this.gameState.towers.some(tower =>
      Math.abs(tower.position.x - x) < 30 && Math.abs(tower.position.y - y) < 30
    );
  }

  private findNearestEnemy(tower: Tower): Enemy | undefined {
    let nearest: Enemy | undefined;
    let nearestDistance = tower.stats.range;

    this.gameState.enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - tower.position.x, 2) +
        Math.pow(enemy.position.y - tower.position.y, 2)
      );

      if (distance <= nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });

    return nearest;
  }

  private towerAttack(tower: Tower, target: Enemy): void {
    // Simple attack rate limiting
    const lastAttack = (tower as Tower & { lastAttack?: number }).lastAttack || 0;
    const attackInterval = 1000 / tower.stats.fireRate;

    if (Date.now() - lastAttack >= attackInterval) {
      const projectile: Projectile = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceId: tower.id,
        targetId: target.id,
        position: { ...tower.position },
        velocity: this.calculateProjectileVelocity(tower.position, target.position, 200),
        damage: tower.stats.damage,
        piercing: tower.stats.piercing || 1,
        effects: [],
        visualData: {
          sprite: 'projectile',
          color: tower.visualData.effectColor,
          size: 3
        }
      };

      this.gameState.projectiles.push(projectile);
      (tower as Tower & { lastAttack?: number }).lastAttack = Date.now();
    }
  }

  private calculateProjectileVelocity(from: {x: number, y: number}, to: {x: number, y: number}, speed: number) {
    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    return {
      x: ((to.x - from.x) / distance) * speed,
      y: ((to.y - from.y) / distance) * speed
    };
  }

  private projectileHit(projectile: Projectile, target: Enemy): void {
    let damage = projectile.damage;

    // Apply critical hit
    const sourceTower = this.gameState.towers.find(t => t.id === projectile.sourceId);
    if (sourceTower && Math.random() < sourceTower.stats.criticalChance) {
      damage *= sourceTower.stats.criticalMultiplier;
    }

    // Apply armor reduction
    const actualDamage = Math.max(1, damage - target.stats.armor);
    target.stats.currentHealth -= actualDamage;

    // Apply projectile effects
    projectile.effects.forEach(effect => {
      target.status.push({
        type: effect.type as 'slow' | 'freeze' | 'burn' | 'poison' | 'stun',
        duration: effect.duration || 0,
        value: effect.value,
        source: projectile.sourceId
      });
    });

    projectile.piercing--;
  }

  private canUseAbility(ability: TowerAbility, tower: Tower, target?: Enemy): boolean {
    return ability.type === AbilityType.TRIGGERED &&
           ability.lastUsed <= 0 &&
           (ability.type !== AbilityType.TRIGGERED || target !== undefined);
  }

  private useAbility(tower: Tower, ability: TowerAbility, target?: Enemy): void {
    ability.lastUsed = ability.cooldown;

    // Apply ability effects based on type
    switch (ability.effect.type) {
      case 'slow':
        this.applyAreaEffect(tower, ability);
        break;
      case 'chain':
        this.applyChainEffect(tower, ability, target);
        break;
      case 'buff':
        this.applyTowerBuff(tower, ability);
        break;
    }
  }

  private applyAreaEffect(tower: Tower, ability: TowerAbility): void {
    const radius = ability.effect.radius || 50;
    this.gameState.enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - tower.position.x, 2) +
        Math.pow(enemy.position.y - tower.position.y, 2)
      );

      if (distance <= radius) {
        enemy.status.push({
          type: ability.effect.type as 'slow' | 'freeze' | 'burn' | 'poison' | 'stun',
          duration: ability.effect.duration || 3000,
          value: ability.effect.value,
          source: tower.id
        });
      }
    });
  }

  private applyChainEffect(tower: Tower, ability: TowerAbility, initialTarget?: Enemy): void {
    if (!initialTarget) return;

    const chainTargets = [initialTarget];
    let currentTarget = initialTarget;

    // Find up to 5 chain targets
    for (let i = 0; i < 4; i++) {
      const nextTarget = this.gameState.enemies.find(enemy =>
        !chainTargets.includes(enemy) &&
        Math.sqrt(
          Math.pow(enemy.position.x - currentTarget.position.x, 2) +
          Math.pow(enemy.position.y - currentTarget.position.y, 2)
        ) <= 50
      );

      if (nextTarget) {
        chainTargets.push(nextTarget);
        currentTarget = nextTarget;
      } else {
        break;
      }
    }

    // Apply damage to all chain targets
    chainTargets.forEach((target, index) => {
      const damage = ability.effect.value * Math.pow(0.8, index); // Diminishing damage
      target.stats.currentHealth -= damage;
    });
  }

  private applyTowerBuff(tower: Tower, ability: TowerAbility): void {
    const radius = ability.effect.radius || 100;
    this.gameState.towers.forEach(nearbyTower => {
      if (nearbyTower.id === tower.id) return;

      const distance = Math.sqrt(
        Math.pow(nearbyTower.position.x - tower.position.x, 2) +
        Math.pow(nearbyTower.position.y - tower.position.y, 2)
      );

      if (distance <= radius) {
        // Apply temporary damage buff
        (nearbyTower as Tower & { tempDamageBonus?: number }).tempDamageBonus = ability.effect.value;
      }
    });
  }

  // Enemy data methods
  private getEnemyName(type: EnemyType): string {
    const names = {
      [EnemyType.BASIC]: 'Grunt',
      [EnemyType.FAST]: 'Scout',
      [EnemyType.HEAVY]: 'Brute',
      [EnemyType.FLYING]: 'Drone',
      [EnemyType.MAGICAL]: 'Mage',
      [EnemyType.BOSS]: 'Commander',
      [EnemyType.DIMENSIONAL]: 'Voidwalker'
    };
    return names[type];
  }

  private getEnemyStats(type: EnemyType, wave: number): EnemyStats {
    const baseStats = {
      [EnemyType.BASIC]: { health: 100, speed: 50, armor: 0, magicResistance: 0 },
      [EnemyType.FAST]: { health: 60, speed: 100, armor: 0, magicResistance: 0 },
      [EnemyType.HEAVY]: { health: 300, speed: 25, armor: 5, magicResistance: 2 },
      [EnemyType.FLYING]: { health: 80, speed: 75, armor: 0, magicResistance: 3 },
      [EnemyType.MAGICAL]: { health: 120, speed: 60, armor: 2, magicResistance: 8 },
      [EnemyType.BOSS]: { health: 1000, speed: 30, armor: 10, magicResistance: 5 },
      [EnemyType.DIMENSIONAL]: { health: 200, speed: 40, armor: 3, magicResistance: 10 }
    };

    const base = baseStats[type];
    const waveMultiplier = 1 + (wave - 1) * 0.2;

    return {
      maxHealth: Math.floor(base.health * waveMultiplier),
      currentHealth: Math.floor(base.health * waveMultiplier),
      speed: base.speed,
      armor: base.armor,
      magicResistance: base.magicResistance,
      flying: type === EnemyType.FLYING || type === EnemyType.DIMENSIONAL,
      invisible: false,
      boss: type === EnemyType.BOSS,
      shielded: type === EnemyType.DIMENSIONAL
    };
  }

  private getEnemyVisualData(type: EnemyType): EnemyVisualData {
    const defaultAnimation: AnimationData = {
      duration: 1000,
      keyframes: []
    };
    
    return {
      sprite: type,
      size: { width: 20, height: 20 },
      color: '#ff0000',
      animations: {
        walking: defaultAnimation,
        hurt: { duration: 300, keyframes: [] },
        death: defaultAnimation
      },
      statusEffects: {}
    };
  }

  private getEnemyReward(type: EnemyType, wave: number): { gold: number; experience: number } {
    const baseRewards = {
      [EnemyType.BASIC]: { gold: 10, experience: 5 },
      [EnemyType.FAST]: { gold: 8, experience: 4 },
      [EnemyType.HEAVY]: { gold: 25, experience: 12 },
      [EnemyType.FLYING]: { gold: 15, experience: 8 },
      [EnemyType.MAGICAL]: { gold: 20, experience: 10 },
      [EnemyType.BOSS]: { gold: 100, experience: 50 },
      [EnemyType.DIMENSIONAL]: { gold: 40, experience: 20 }
    };

    const base = baseRewards[type];
    const waveMultiplier = 1 + (wave - 1) * 0.1;

    return {
      gold: Math.floor(base.gold * waveMultiplier),
      experience: Math.floor(base.experience * waveMultiplier)
    };
  }

  // State management
  getGameState(): GameState {
    return { ...this.gameState };
  }

  private notifyStateUpdate(): void {
    if (this.onGameStateUpdate) {
      this.onGameStateUpdate({ ...this.gameState });
    }
  }

  // Cleanup
  destroy(): void {
    this.stopGame();
    this.onGameStateUpdate = undefined;
  }
}