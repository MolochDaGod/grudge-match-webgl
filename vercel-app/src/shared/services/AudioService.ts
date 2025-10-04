export interface AudioConfig {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
}

export enum SoundType {
  // Attack sounds
  MAGIC_ATTACK = 'attack/Magic1.mp3',
  MELEE_ATTACK_1 = 'attack/Melee1.mp3',
  MELEE_ATTACK_2 = 'attack/Melee2.mp3', 
  MELEE_ATTACK_3 = 'attack/Melee3.mp3',
  RANGED_ATTACK_1 = 'attack/Ranged1.mp3',
  RANGED_ATTACK_2 = 'attack/Ranged2.mp3',
  ROAR = 'attack/Roar1.mp3',
  SHOT_1 = 'attack/Shot1.mp3',
  SHOT_2 = 'attack/Shot2.mp3',
  THROW = 'attack/Throw1.mp3',

  // Common UI sounds
  CLICK_1 = 'common/Click1.mp3',
  CLICK_2 = 'common/Click2.mp3',
  CLICK_3 = 'common/Click3.mp3',
  CONSTRUCT = 'common/Construct1.mp3',
  SELL = 'common/Sell1.mp3',
  WAVE_START = 'common/WaveStart1.mp3',
  VICTORY = 'common/Victory1.mp3',
  DEFEAT = 'common/Defeat1.mp3',
  CAPTURED = 'common/Captured1.mp3',

  // Death sounds
  DIE = 'die/Die1.mp3',

  // Explosion sounds
  EXPLOSION = 'explosions/Explosion1.mp3',

  // Background music
  BACKGROUND_MUSIC = 'tracks/Track1.mp3'
}

export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private loadedSources: Map<SoundType, HTMLAudioElement> = new Map();
  private config: AudioConfig = {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    muted: false
  };
  private backgroundMusic: HTMLAudioElement | null = null;
  private isInitialized = false;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load audio configuration from localStorage
      const savedConfig = localStorage.getItem('audioConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Preload critical sounds
      await this.preloadSounds([
        SoundType.CLICK_1,
        SoundType.CONSTRUCT,
        SoundType.SHOT_1,
        SoundType.EXPLOSION,
        SoundType.DIE
      ]);

      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  private async preloadSounds(soundTypes: SoundType[]): Promise<void> {
    const loadPromises = soundTypes.map(soundType => this.loadSound(soundType));
    await Promise.allSettled(loadPromises);
  }

  private async loadSound(soundType: SoundType): Promise<void> {
    try {
      const audio = new Audio(`/audio/${soundType}`);
      audio.preload = 'auto';
      audio.volume = this.calculateVolume('sfx');
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.loadedSources.set(soundType, audio);
          resolve();
        });
        
        audio.addEventListener('error', () => {
          console.warn(`Failed to load sound: ${soundType}`);
          resolve(); // Don't fail the entire loading process
        });
        
        audio.load();
      });
    } catch (error) {
      console.warn(`Error loading sound ${soundType}:`, error);
    }
  }

  private calculateVolume(type: 'sfx' | 'music'): number {
    if (this.config.muted) return 0;
    return this.config.masterVolume * (type === 'sfx' ? this.config.sfxVolume : this.config.musicVolume);
  }

  async playSound(soundType: SoundType, volume?: number): Promise<void> {
    if (!this.isInitialized || this.config.muted) return;

    try {
      // Resume audio context if suspended (required for browser autoplay policies)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      let audio = this.loadedSources.get(soundType);
      
      // Load sound if not already loaded
      if (!audio) {
        await this.loadSound(soundType);
        audio = this.loadedSources.get(soundType);
      }

      if (audio) {
        // Clone the audio for overlapping sounds
        const audioClone = audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = volume ?? this.calculateVolume('sfx');
        
        // Clean up after playing
        audioClone.addEventListener('ended', () => {
          audioClone.remove();
        });

        await audioClone.play();
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }

  async playBackgroundMusic(): Promise<void> {
    if (!this.isInitialized || this.config.muted) return;

    try {
      if (!this.backgroundMusic) {
        this.backgroundMusic = new Audio(`/audio/${SoundType.BACKGROUND_MUSIC}`);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.calculateVolume('music');
      }

      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.backgroundMusic.play();
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  // Sound mapping for different tower types and events
  getTowerAttackSound(towerType: string): SoundType {
    const soundMap: Record<string, SoundType> = {
      'temporal': SoundType.MAGIC_ATTACK,
      'spatial': SoundType.RANGED_ATTACK_1,
      'consciousness': SoundType.MAGIC_ATTACK,
      'harmony': SoundType.RANGED_ATTACK_2,
      'archer': SoundType.SHOT_1,
      'mage': SoundType.MAGIC_ATTACK,
      'warrior': SoundType.MELEE_ATTACK_1,
      'support': SoundType.MAGIC_ATTACK
    };

    return soundMap[towerType] || SoundType.SHOT_1;
  }

  getEnemyDeathSound(enemyType: string): SoundType {
    // All enemies use the same death sound for now
    return SoundType.DIE;
  }

  getUISound(action: string): SoundType {
    const soundMap: Record<string, SoundType> = {
      'click': SoundType.CLICK_1,
      'build': SoundType.CONSTRUCT,
      'sell': SoundType.SELL,
      'wave_start': SoundType.WAVE_START,
      'victory': SoundType.VICTORY,
      'defeat': SoundType.DEFEAT,
      'purchase': SoundType.CLICK_2
    };

    return soundMap[action] || SoundType.CLICK_1;
  }

  // Configuration methods
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveConfig();
  }

  setSfxVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveConfig();
  }

  setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.calculateVolume('music');
    }
    this.saveConfig();
  }

  toggleMute(): void {
    this.config.muted = !this.config.muted;
    this.updateAllVolumes();
    
    if (this.config.muted) {
      this.stopBackgroundMusic();
    } else if (this.backgroundMusic) {
      this.playBackgroundMusic();
    }
    
    this.saveConfig();
  }

  private updateAllVolumes(): void {
    // Update all loaded sound volumes
    for (const audio of this.loadedSources.values()) {
      audio.volume = this.calculateVolume('sfx');
    }
    
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.calculateVolume('music');
    }
  }

  private saveConfig(): void {
    localStorage.setItem('audioConfig', JSON.stringify(this.config));
  }

  getConfig(): AudioConfig {
    return { ...this.config };
  }

  // Utility methods for common game events
  async playTowerPlaced(towerType: string): Promise<void> {
    await this.playSound(SoundType.CONSTRUCT);
  }

  async playTowerAttack(towerType: string): Promise<void> {
    const sound = this.getTowerAttackSound(towerType);
    await this.playSound(sound);
  }

  async playEnemyKilled(enemyType: string): Promise<void> {
    await this.playSound(SoundType.DIE);
    // Small delay then explosion sound
    setTimeout(() => {
      this.playSound(SoundType.EXPLOSION);
    }, 100);
  }

  async playWaveStart(): Promise<void> {
    await this.playSound(SoundType.WAVE_START);
  }

  async playVictory(): Promise<void> {
    this.stopBackgroundMusic();
    await this.playSound(SoundType.VICTORY);
  }

  async playDefeat(): Promise<void> {
    this.stopBackgroundMusic();
    await this.playSound(SoundType.DEFEAT);
  }

  async playUIClick(): Promise<void> {
    await this.playSound(SoundType.CLICK_1);
  }

  async playTowerSold(): Promise<void> {
    await this.playSound(SoundType.SELL);
  }

  async playCharacterMinted(): Promise<void> {
    await this.playSound(SoundType.VICTORY);
  }

  async playTokenPurchased(): Promise<void> {
    await this.playSound(SoundType.CLICK_2);
  }

  // Character-specific sounds based on 4D attributes
  getCharacterSound(character: { attributes: any }): SoundType {
    const { temporal, spatial, consciousness, harmony } = character.attributes;
    
    // Determine dominant attribute
    const maxAttribute = Math.max(temporal, spatial, consciousness, harmony);
    
    if (temporal === maxAttribute) return SoundType.MAGIC_ATTACK;
    if (spatial === maxAttribute) return SoundType.RANGED_ATTACK_1;
    if (consciousness === maxAttribute) return SoundType.MAGIC_ATTACK;
    if (harmony === maxAttribute) return SoundType.RANGED_ATTACK_2;
    
    return SoundType.SHOT_1;
  }
}