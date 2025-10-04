/**
 * Projectile System for Tower Defense
 * Handles projectiles that travel, hit targets, deal damage, and explode on impact
 */

import { SpriteRenderer, getSpriteById } from './sprite-renderer';

export interface Vector2D {
  x: number;
  y: number;
}

export interface ProjectileType {
  id: string;
  name: string;
  spriteId: string;
  speed: number;
  damage: number;
  explosionRadius?: number;
  explosionDamage?: number;
  explosionSpriteId?: string;
  piercing?: boolean;
  homing?: boolean;
  bounces?: number;
  statusEffects?: StatusEffect[];
}

export interface StatusEffect {
  type: 'slow' | 'poison' | 'freeze' | 'burn' | 'stun';
  duration: number; // in milliseconds
  intensity: number; // effect strength
}

export interface Projectile {
  id: string;
  type: ProjectileType;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  targetId?: string;
  sourceId: string; // Tower that fired this
  createdAt: number;
  lifetime: number; // Max time to live in milliseconds
  bounceCount: number;
  hasHit: Set<string>; // Track which enemies have been hit (for piercing)
}

export interface Enemy {
  id: string;
  position: Vector2D;
  health: number;
  maxHealth: number;
  radius: number;
  statusEffects: Array<{
    effect: StatusEffect;
    endTime: number;
  }>;
}

export interface ExplosionEffect {
  id: string;
  position: Vector2D;
  spriteId: string;
  startTime: number;
  duration: number;
  scale: number;
  maxScale: number;
  rotation: number;
  alpha: number;
}

export interface DamageNumber {
  id: string;
  position: Vector2D;
  damage: number;
  velocity: Vector2D;
  startTime: number;
  duration: number;
  color: string;
  isCritical: boolean;
}

/**
 * Predefined projectile types based on available sprites
 */
export const PROJECTILE_TYPES: ProjectileType[] = [
  {
    id: 'arrow',
    name: 'Arrow',
    spriteId: 'projectile_arrow',
    speed: 300,
    damage: 15,
    piercing: true
  },
  {
    id: 'bullet',
    name: 'Bullet',
    spriteId: 'projectile_bullet',
    speed: 500,
    damage: 10
  },
  {
    id: 'fireball',
    name: 'Fireball',
    spriteId: 'projectile_fireball',
    speed: 200,
    damage: 25,
    explosionRadius: 50,
    explosionDamage: 15,
    explosionSpriteId: 'effect_sparkle',
    statusEffects: [{ type: 'burn', duration: 3000, intensity: 5 }]
  },
  {
    id: 'iceball',
    name: 'Ice Ball',
    spriteId: 'projectile_iceball',
    speed: 180,
    damage: 20,
    explosionRadius: 40,
    explosionDamage: 10,
    statusEffects: [{ type: 'slow', duration: 4000, intensity: 0.5 }]
  },
  {
    id: 'lightning',
    name: 'Lightning Jolt',
    spriteId: 'projectile_jolt',
    speed: 800,
    damage: 30,
    bounces: 3,
    statusEffects: [{ type: 'stun', duration: 1000, intensity: 1 }]
  },
  {
    id: 'poison',
    name: 'Poison Strike',
    spriteId: 'projectile_poison',
    speed: 150,
    damage: 12,
    statusEffects: [{ type: 'poison', duration: 5000, intensity: 3 }]
  }
];

/**
 * Main projectile system manager
 */
export class ProjectileSystem {
  private projectiles: Map<string, Projectile> = new Map();
  private explosions: Map<string, ExplosionEffect> = new Map();
  private damageNumbers: Map<string, DamageNumber> = new Map();
  private nextProjectileId = 1;
  private nextExplosionId = 1;
  private nextDamageId = 1;

  /**
   * Fire a projectile from source position towards target
   */
  fireProjectile(
    projectileTypeId: string,
    sourcePosition: Vector2D,
    targetPosition: Vector2D,
    sourceId: string,
    targetId?: string
  ): string | null {
    const projectileType = PROJECTILE_TYPES.find(p => p.id === projectileTypeId);
    if (!projectileType) {
      console.warn(`Unknown projectile type: ${projectileTypeId}`);
      return null;
    }

    // Calculate direction and velocity
    const direction = this.normalize({
      x: targetPosition.x - sourcePosition.x,
      y: targetPosition.y - sourcePosition.y
    });

    const velocity = {
      x: direction.x * projectileType.speed,
      y: direction.y * projectileType.speed
    };

    // Calculate rotation to face target
    const rotation = Math.atan2(direction.y, direction.x);

    const projectileId = `proj_${this.nextProjectileId++}`;
    const projectile: Projectile = {
      id: projectileId,
      type: projectileType,
      position: { ...sourcePosition },
      velocity,
      rotation,
      targetId,
      sourceId,
      createdAt: Date.now(),
      lifetime: 5000, // 5 seconds max lifetime
      bounceCount: 0,
      hasHit: new Set()
    };

    this.projectiles.set(projectileId, projectile);
    return projectileId;
  }

  /**
   * Update all projectiles
   */
  update(deltaTime: number, enemies: Enemy[]): void {
    const currentTime = Date.now();

    // Update projectiles
    for (const [id, projectile] of this.projectiles) {
      // Check lifetime
      if (currentTime - projectile.createdAt > projectile.lifetime) {
        this.projectiles.delete(id);
        continue;
      }

      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;

      // Check for collisions with enemies
      this.checkCollisions(projectile, enemies);

      // Homing behavior
      if (projectile.type.homing && projectile.targetId) {
        const target = enemies.find(e => e.id === projectile.targetId);
        if (target) {
          this.updateHomingProjectile(projectile, target, deltaTime);
        }
      }
    }

    // Update explosions
    for (const [id, explosion] of this.explosions) {
      const elapsed = currentTime - explosion.startTime;
      if (elapsed > explosion.duration) {
        this.explosions.delete(id);
        continue;
      }

      // Update explosion animation
      const progress = elapsed / explosion.duration;
      explosion.scale = explosion.maxScale * this.easeOutQuad(progress);
      explosion.alpha = 1 - progress;
      explosion.rotation += deltaTime * 0.005; // Slow rotation
    }

    // Update damage numbers
    for (const [id, damageNumber] of this.damageNumbers) {
      const elapsed = currentTime - damageNumber.startTime;
      if (elapsed > damageNumber.duration) {
        this.damageNumbers.delete(id);
        continue;
      }

      // Update damage number position (float upward)
      damageNumber.position.x += damageNumber.velocity.x * deltaTime;
      damageNumber.position.y += damageNumber.velocity.y * deltaTime;
    }
  }

  /**
   * Check collisions between projectile and enemies
   */
  private checkCollisions(projectile: Projectile, enemies: Enemy[]): void {
    for (const enemy of enemies) {
      // Skip if already hit (for piercing projectiles)
      if (projectile.hasHit.has(enemy.id)) continue;

      const distance = this.distance(projectile.position, enemy.position);
      if (distance <= enemy.radius + 5) { // 5px collision tolerance
        this.hitEnemy(projectile, enemy);
        
        // Mark as hit for piercing projectiles
        projectile.hasHit.add(enemy.id);

        // Remove projectile if not piercing
        if (!projectile.type.piercing) {
          this.createExplosion(projectile);
          this.projectiles.delete(projectile.id);
          return;
        }
      }
    }
  }

  /**
   * Handle projectile hitting enemy
   */
  private hitEnemy(projectile: Projectile, enemy: Enemy): void {
    // Calculate damage (with potential critical hit)
    let finalDamage = projectile.type.damage;
    let isCritical = false;
    
    if (Math.random() < 0.1) { // 10% crit chance
      finalDamage *= 2;
      isCritical = true;
    }

    // Apply damage
    enemy.health -= finalDamage;
    enemy.health = Math.max(0, enemy.health);

    // Apply status effects
    if (projectile.type.statusEffects) {
      const currentTime = Date.now();
      for (const statusEffect of projectile.type.statusEffects) {
        enemy.statusEffects.push({
          effect: statusEffect,
          endTime: currentTime + statusEffect.duration
        });
      }
    }

    // Create damage number
    this.createDamageNumber(enemy.position, finalDamage, isCritical);

    // Create explosion if projectile has explosion properties
    if (projectile.type.explosionRadius && projectile.type.explosionDamage) {
      this.createAreaDamage(projectile.position, projectile.type.explosionRadius, projectile.type.explosionDamage, [enemy.id]);
    }
  }

  /**
   * Create explosion effect at position
   */
  private createExplosion(projectile: Projectile): void {
    const explosionId = `explosion_${this.nextExplosionId++}`;
    const explosion: ExplosionEffect = {
      id: explosionId,
      position: { ...projectile.position },
      spriteId: projectile.type.explosionSpriteId || 'effect_sparkle',
      startTime: Date.now(),
      duration: 500, // 500ms explosion animation
      scale: 0,
      maxScale: 2,
      rotation: 0,
      alpha: 1
    };

    this.explosions.set(explosionId, explosion);
  }

  /**
   * Create area damage effect
   */
  private createAreaDamage(center: Vector2D, radius: number, damage: number, excludeIds: string[]): void {
    // This would interact with the game's enemy system
    // For now, we just create the visual effect
    console.log(`Area damage: ${damage} in radius ${radius} at`, center);
  }

  /**
   * Create floating damage number
   */
  private createDamageNumber(position: Vector2D, damage: number, isCritical: boolean): void {
    const damageId = `damage_${this.nextDamageId++}`;
    const damageNumber: DamageNumber = {
      id: damageId,
      position: { ...position },
      damage,
      velocity: {
        x: (Math.random() - 0.5) * 50, // Random horizontal drift
        y: -100 // Float upward
      },
      startTime: Date.now(),
      duration: 1500, // 1.5 seconds
      color: isCritical ? '#ffff00' : '#ffffff',
      isCritical
    };

    this.damageNumbers.set(damageId, damageNumber);
  }

  /**
   * Update homing projectile trajectory
   */
  private updateHomingProjectile(projectile: Projectile, target: Enemy, deltaTime: number): void {
    const direction = this.normalize({
      x: target.position.x - projectile.position.x,
      y: target.position.y - projectile.position.y
    });

    // Gradually adjust velocity towards target
    const homingStrength = 0.1; // How quickly it homes in
    projectile.velocity.x += direction.x * projectile.type.speed * homingStrength;
    projectile.velocity.y += direction.y * projectile.type.speed * homingStrength;

    // Maintain consistent speed
    const currentSpeed = Math.sqrt(projectile.velocity.x ** 2 + projectile.velocity.y ** 2);
    if (currentSpeed > 0) {
      projectile.velocity.x = (projectile.velocity.x / currentSpeed) * projectile.type.speed;
      projectile.velocity.y = (projectile.velocity.y / currentSpeed) * projectile.type.speed;
    }

    // Update rotation
    projectile.rotation = Math.atan2(projectile.velocity.y, projectile.velocity.x);
  }

  /**
   * Render all projectiles, explosions, and effects
   */
  async renderEffects(spriteRenderer: SpriteRenderer): Promise<void> {
    // Render projectiles
    for (const projectile of this.projectiles.values()) {
      const sprite = getSpriteById(projectile.type.spriteId);
      if (sprite) {
        await spriteRenderer.renderSprite(
          sprite,
          projectile.position.x,
          projectile.position.y,
          {
            rotation: projectile.rotation,
            scale: { x: 1, y: 1 }
          }
        );
      }
    }

    // Render explosions
    for (const explosion of this.explosions.values()) {
      const sprite = getSpriteById(explosion.spriteId);
      if (sprite) {
        await spriteRenderer.renderSprite(
          sprite,
          explosion.position.x,
          explosion.position.y,
          {
            rotation: explosion.rotation,
            scale: { x: explosion.scale, y: explosion.scale },
            alpha: explosion.alpha
          }
        );
      }
    }
  }

  /**
   * Render damage numbers (should be called separately with different context)
   */
  renderDamageNumbers(ctx: CanvasRenderingContext2D): void {
    const currentTime = Date.now();
    
    for (const damageNumber of this.damageNumbers.values()) {
      const elapsed = currentTime - damageNumber.startTime;
      const progress = elapsed / damageNumber.duration;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = damageNumber.color;
      ctx.font = damageNumber.isCritical ? 'bold 24px Arial' : '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 2;
      
      ctx.fillText(
        damageNumber.damage.toString(),
        damageNumber.position.x,
        damageNumber.position.y
      );
      ctx.restore();
    }
  }

  // Utility functions
  private normalize(vector: Vector2D): Vector2D {
    const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    return length > 0 ? { x: vector.x / length, y: vector.y / length } : { x: 0, y: 0 };
  }

  private distance(a: Vector2D, b: Vector2D): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  // Getters for external systems
  getProjectiles(): Projectile[] {
    return Array.from(this.projectiles.values());
  }

  getExplosions(): ExplosionEffect[] {
    return Array.from(this.explosions.values());
  }

  getDamageNumbers(): DamageNumber[] {
    return Array.from(this.damageNumbers.values());
  }

  // Cleanup
  clear(): void {
    this.projectiles.clear();
    this.explosions.clear();
    this.damageNumbers.clear();
  }
}