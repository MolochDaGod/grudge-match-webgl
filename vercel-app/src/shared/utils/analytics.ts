import { track } from '@vercel/analytics';

// Custom event tracking for Grudge Tower 4D
export class AnalyticsService {
  // Character Builder Events
  static trackCharacterCreated(characterData: {
    rarity: string;
    totalAttributes: number;
    mintCost: number;
  }) {
    track('character_created', {
      rarity: characterData.rarity,
      total_attributes: characterData.totalAttributes,
      mint_cost: characterData.mintCost,
    });
  }

  static trackCharacterSaved(characterId: string, characterName: string) {
    track('character_saved', {
      character_id: characterId,
      character_name: characterName,
    });
  }

  static trackCharacterExported(format: 'json' | 'tower') {
    track('character_exported', {
      export_format: format,
    });
  }

  // Tower Defense Events
  static trackTowerPlaced(towerData: {
    type: string;
    characterBased: boolean;
    cost?: number;
  }) {
    track('tower_placed', {
      tower_type: towerData.type,
      character_based: towerData.characterBased,
      cost: towerData.cost || 0,
    });
  }

  static trackWaveStarted(waveNumber: number) {
    track('wave_started', {
      wave_number: waveNumber,
    });
  }

  static trackGameCompleted(result: 'victory' | 'defeat', finalScore: number) {
    track('game_completed', {
      result,
      final_score: finalScore,
    });
  }

  // Wallet & Token Events
  static trackWalletConnected(walletType?: string) {
    track('wallet_connected', {
      wallet_type: walletType || 'unknown',
    });
  }

  static trackGbuxClaimed(amount: string) {
    track('gbux_claimed', {
      amount: parseFloat(amount),
    });
  }

  static trackNftMintAttempt(itemType: 'character' | 'equipment') {
    track('nft_mint_attempt', {
      item_type: itemType,
    });
  }

  // Navigation Events
  static trackViewChange(newView: string) {
    track('view_changed', {
      new_view: newView,
    });
  }

  // Feature Usage
  static trackFeatureUsed(feature: string, details?: Record<string, unknown>) {
    track('feature_used', {
      feature,
      ...details,
    });
  }

  // Error Tracking
  static trackError(errorType: string, errorMessage: string) {
    track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
    });
  }

  // Performance Tracking
  static trackPerformance(metric: string, value: number) {
    track('performance_metric', {
      metric,
      value,
    });
  }
}