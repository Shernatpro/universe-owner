import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameState {
  credits: number;
  creditsPerClick: number;
  creditsPerSecond: number;
  totalClicks: number;
  totalLandOwned: number;
  nextLandCost: number;
  landPurchaseAmount: number;
  upgrades: any[];
  regions: Region[];
  currentRegion: any;
  abilities: {
    tapMultiplier: {
      unlocked: boolean;
      active: boolean;
      multiplier: number;
      duration: number;
      lastActivated: number;
    };
    continuousTapping: {
      unlocked: boolean;
      active: boolean;
      duration: number;
      lastActivated: number;
    };
    stealingLand: {
      unlocked: boolean;
      active: boolean;
      duration: number;
      lastActivated: number;
    };
  };
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  regionId: number;
}

export interface Region {
  id: number;
  name: string;
  type: 'island' | 'forest' | 'arctic' | 'desert';
  maxSlots: number;
  buildings: Building[];
  unlocked: boolean;
}

export type BuildingType = 
  | 'solar_panel' | 'wind_turbine' | 'mining_station'
  | 'research_lab' | 'factory' | 'space_elevator'
  | 'fusion_reactor' | 'quantum_computer' | 'megacity'
  | 'dyson_sphere' | 'galactic_portal' | 'universe_engine';

export interface BuildingConfig {
  name: string;
  emoji: string;
  tier: number;
  slotCost: number;
  baseCost: number[];
  baseIncome: number[];
  clickBonus?: number[];
  unlockRegion: number;
}

export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  // Tier 1 - Basic Buildings
  solar_panel: {
    name: 'Solar Panel',
    emoji: '🌞',
    tier: 1,
    slotCost: 1,
    baseCost: [100, 500, 2500],
    baseIncome: [0.5, 1.2, 3.0],
    unlockRegion: 1
  },
  wind_turbine: {
    name: 'Wind Turbine',
    emoji: '💨',
    tier: 1,
    slotCost: 1,
    baseCost: [500, 2000, 10000],
    baseIncome: [1.2, 3.0, 7.5],
    unlockRegion: 1
  },
  mining_station: {
    name: 'Mining Station',
    emoji: '⛏️',
    tier: 1,
    slotCost: 1,
    baseCost: [2000, 8000, 40000],
    baseIncome: [2.5, 6.0, 15.0],
    unlockRegion: 1
  },
  // Tier 2 - Advanced Buildings
  research_lab: {
    name: 'Research Lab',
    emoji: '🔬',
    tier: 2,
    slotCost: 2,
    baseCost: [15000, 60000, 300000],
    baseIncome: [8, 20, 50],
    clickBonus: [50, 100, 200],
    unlockRegion: 10
  },
  factory: {
    name: 'Factory',
    emoji: '🏭',
    tier: 2,
    slotCost: 2,
    baseCost: [25000, 100000, 500000],
    baseIncome: [12, 30, 75],
    unlockRegion: 10
  },
  space_elevator: {
    name: 'Space Elevator',
    emoji: '🚀',
    tier: 2,
    slotCost: 3,
    baseCost: [100000, 400000, 2000000],
    baseIncome: [25, 60, 150],
    unlockRegion: 15
  },
  // Tier 3 - Mega Buildings
  fusion_reactor: {
    name: 'Fusion Reactor',
    emoji: '⚛️',
    tier: 3,
    slotCost: 4,
    baseCost: [1000000, 4000000, 20000000],
    baseIncome: [100, 250, 625],
    unlockRegion: 51
  },
  quantum_computer: {
    name: 'Quantum Computer',
    emoji: '🌌',
    tier: 3,
    slotCost: 3,
    baseCost: [2000000, 8000000, 40000000],
    baseIncome: [80, 200, 500],
    clickBonus: [500, 1000, 2000],
    unlockRegion: 51
  },
  megacity: {
    name: 'Megacity',
    emoji: '🏙️',
    tier: 3,
    slotCost: 5,
    baseCost: [5000000, 20000000, 100000000],
    baseIncome: [200, 500, 1250],
    unlockRegion: 60
  },
  // Tier 4 - Cosmic Buildings
  dyson_sphere: {
    name: 'Dyson Sphere',
    emoji: '☀️',
    tier: 4,
    slotCost: 8,
    baseCost: [100000000, 500000000, 2500000000],
    baseIncome: [1000, 2500, 6250],
    unlockRegion: 101
  },
  galactic_portal: {
    name: 'Galactic Portal',
    emoji: '🌀',
    tier: 4,
    slotCost: 10,
    baseCost: [1000000000, 5000000000, 25000000000],
    baseIncome: [2000, 5000, 12500],
    clickBonus: [5000, 10000, 20000],
    unlockRegion: 120
  },
  universe_engine: {
    name: 'Universe Engine',
    emoji: '🌌',
    tier: 4,
    slotCost: 15,
    baseCost: [10000000000, 50000000000, 250000000000],
    baseIncome: [5000, 12500, 31250],
    unlockRegion: 130
  }
};

const REGION_DATA = [
  // Islands (1-50)
  { id: 1, name: "Coconut Island", type: 'island' as const, maxSlots: 1 },
  { id: 2, name: "Low Isles", type: 'island' as const, maxSlots: 1 },
  { id: 3, name: "Mud Island", type: 'island' as const, maxSlots: 2 },
  { id: 4, name: "Peel Island", type: 'island' as const, maxSlots: 2 },
  { id: 5, name: "St Helena Island", type: 'island' as const, maxSlots: 3 },
  { id: 6, name: "Coochiemudlo Island", type: 'island' as const, maxSlots: 3 },
  { id: 7, name: "Karragarra Island", type: 'island' as const, maxSlots: 3 },
  { id: 8, name: "Lamb Island", type: 'island' as const, maxSlots: 3 },
  { id: 9, name: "Macleay Island", type: 'island' as const, maxSlots: 4 },
  { id: 10, name: "Russell Island", type: 'island' as const, maxSlots: 4 },
  { id: 11, name: "Lady Elliot Island", type: 'island' as const, maxSlots: 4 },
  { id: 12, name: "Heron Island", type: 'island' as const, maxSlots: 4 },
  { id: 13, name: "Lizard Island", type: 'island' as const, maxSlots: 4 },
  { id: 14, name: "Green Island", type: 'island' as const, maxSlots: 5 },
  { id: 15, name: "Fitzroy Island", type: 'island' as const, maxSlots: 5 },
  { id: 16, name: "Bedarra Island", type: 'island' as const, maxSlots: 5 },
  { id: 17, name: "Dunk Island", type: 'island' as const, maxSlots: 5 },
  { id: 18, name: "Palm Island", type: 'island' as const, maxSlots: 6 },
  { id: 19, name: "Hamilton Island", type: 'island' as const, maxSlots: 6 },
  { id: 20, name: "Possession Island", type: 'island' as const, maxSlots: 6 },
  { id: 21, name: "Horn Island", type: 'island' as const, maxSlots: 6 },
  { id: 22, name: "Prince of Wales Island AU", type: 'island' as const, maxSlots: 7 },
  { id: 23, name: "Thursday Island", type: 'island' as const, maxSlots: 7 },
  { id: 24, name: "Barrow Island", type: 'island' as const, maxSlots: 7 },
  { id: 25, name: "Barrow Island", type: 'island' as const, maxSlots: 8 },
  { id: 26, name: "Dirk Hartog Island", type: 'island' as const, maxSlots: 8 },
  { id: 27, name: "Garden Island", type: 'island' as const, maxSlots: 8 },
  { id: 28, name: "Rottnest Island", type: 'island' as const, maxSlots: 8 },
  { id: 29, name: "Chagos Archipelago", type: 'island' as const, maxSlots: 9 },
  { id: 30, name: "Christmas Island", type: 'island' as const, maxSlots: 10 },
  { id: 31, name: "Lakshadweep", type: 'island' as const, maxSlots: 10 },
  { id: 32, name: "Maldives", type: 'island' as const, maxSlots: 10 },
  { id: 33, name: "Seychelles", type: 'island' as const, maxSlots: 11 },
  { id: 34, name: "Malta", type: 'island' as const, maxSlots: 11 },
  { id: 35, name: "Socotra", type: 'island' as const, maxSlots: 12 },
  { id: 36, name: "Reunion", type: 'island' as const, maxSlots: 12 },
  { id: 37, name: "Mauritius", type: 'island' as const, maxSlots: 12 },
  { id: 38, name: "Comoros", type: 'island' as const, maxSlots: 13 },
  { id: 39, name: "Cape Verde", type: 'island' as const, maxSlots: 13 },
  { id: 40, name: "Madeira", type: 'island' as const, maxSlots: 14 },
  { id: 41, name: "Frankland Islands", type: 'island' as const, maxSlots: 14 },
  { id: 42, name: "Wellesley Islands", type: 'island' as const, maxSlots: 15 },
  { id: 43, name: "Torres Strait Islands", type: 'island' as const, maxSlots: 15 },
  { id: 44, name: "Nicobar Islands", type: 'island' as const, maxSlots: 15 },
  { id: 45, name: "Andaman Islands", type: 'island' as const, maxSlots: 16 },
  { id: 46, name: "Azores", type: 'island' as const, maxSlots: 16 },
  { id: 47, name: "Canary Islands", type: 'island' as const, maxSlots: 17 },
  { id: 48, name: "Balearic Islands", type: 'island' as const, maxSlots: 17 },
  { id: 49, name: "Chatham Islands", type: 'island' as const, maxSlots: 17 },
  { id: 50, name: "Lord Howe Island", type: 'island' as const, maxSlots: 18 },
  
  // Forests (51-100)
  { id: 51, name: "Magnetic Island", type: 'forest' as const, maxSlots: 20 },
  { id: 52, name: "Norfolk Island", type: 'forest' as const, maxSlots: 20 },
  { id: 53, name: "Phillip Island", type: 'forest' as const, maxSlots: 21 },
  { id: 54, name: "French Island", type: 'forest' as const, maxSlots: 21 },
  { id: 55, name: "Hinchinbrook Island", type: 'forest' as const, maxSlots: 22 },
  { id: 56, name: "Whitsunday Island", type: 'forest' as const, maxSlots: 22 },
  { id: 57, name: "Moreton Island", type: 'forest' as const, maxSlots: 23 },
  { id: 58, name: "North Stradbroke Island", type: 'forest' as const, maxSlots: 23 },
  { id: 59, name: "South Stradbroke Island", type: 'forest' as const, maxSlots: 23 },
  { id: 60, name: "Bribie Island", type: 'forest' as const, maxSlots: 24 },
  { id: 61, name: "Mornington Island", type: 'forest' as const, maxSlots: 24 },
  { id: 62, name: "Groote Eylandt", type: 'forest' as const, maxSlots: 25 },
  { id: 63, name: "Bathurst Island AU", type: 'forest' as const, maxSlots: 25 },
  { id: 64, name: "Melville Island AU", type: 'forest' as const, maxSlots: 25 },
  { id: 65, name: "Flinders Island", type: 'forest' as const, maxSlots: 26 },
  { id: 66, name: "King Island", type: 'forest' as const, maxSlots: 26 },
  { id: 67, name: "Stewart Island", type: 'forest' as const, maxSlots: 27 },
  { id: 68, name: "Fraser Island", type: 'forest' as const, maxSlots: 27 },
  { id: 69, name: "Kangaroo Island", type: 'forest' as const, maxSlots: 27 },
  { id: 70, name: "Cyprus", type: 'forest' as const, maxSlots: 28 },
  { id: 71, name: "Crete", type: 'forest' as const, maxSlots: 28 },
  { id: 72, name: "Corsica", type: 'forest' as const, maxSlots: 29 },
  { id: 73, name: "Taiwan", type: 'forest' as const, maxSlots: 29 },
  { id: 74, name: "Kyushu", type: 'forest' as const, maxSlots: 29 },
  { id: 75, name: "Kyushu", type: 'forest' as const, maxSlots: 30 },
  { id: 76, name: "Sicily", type: 'forest' as const, maxSlots: 30 },
  { id: 77, name: "Hainan", type: 'forest' as const, maxSlots: 31 },
  { id: 78, name: "Shikoku", type: 'forest' as const, maxSlots: 31 },
  { id: 79, name: "Sardinia", type: 'forest' as const, maxSlots: 31 },
  { id: 80, name: "Manitoulin Island", type: 'forest' as const, maxSlots: 32 },
  { id: 81, name: "Long Island", type: 'forest' as const, maxSlots: 32 },
  { id: 82, name: "Cape Breton Island", type: 'forest' as const, maxSlots: 33 },
  { id: 83, name: "Anticosti Island", type: 'forest' as const, maxSlots: 33 },
  { id: 84, name: "Prince Edward Island", type: 'forest' as const, maxSlots: 33 },
  { id: 85, name: "Cornwallis Island", type: 'forest' as const, maxSlots: 34 },
  { id: 86, name: "Graham Island", type: 'forest' as const, maxSlots: 34 },
  { id: 87, name: "Borden Island", type: 'forest' as const, maxSlots: 35 },
  { id: 88, name: "Eglinton Island", type: 'forest' as const, maxSlots: 35 },
  { id: 89, name: "Mackenzie King Island", type: 'forest' as const, maxSlots: 35 },
  { id: 90, name: "Prince Charles Island", type: 'forest' as const, maxSlots: 36 },
  { id: 91, name: "Amund Ringnes Island", type: 'forest' as const, maxSlots: 36 },
  { id: 92, name: "October Revolution Island", type: 'forest' as const, maxSlots: 37 },
  { id: 93, name: "Bylot Island", type: 'forest' as const, maxSlots: 37 },
  { id: 94, name: "Ellef Ringnes Island", type: 'forest' as const, maxSlots: 37 },
  { id: 95, name: "Prince Patrick Island", type: 'forest' as const, maxSlots: 38 },
  { id: 96, name: "King William Island", type: 'forest' as const, maxSlots: 38 },
  { id: 97, name: "Bathurst Island", type: 'forest' as const, maxSlots: 39 },
  { id: 98, name: "Kotelny Island", type: 'forest' as const, maxSlots: 39 },
  { id: 99, name: "Somerset Island", type: 'forest' as const, maxSlots: 39 },
  { id: 100, name: "Prince of Wales Island", type: 'forest' as const, maxSlots: 40 },
  
  // Arctic (101-130)
  { id: 101, name: "Southampton Island", type: 'arctic' as const, maxSlots: 42 },
  { id: 102, name: "Vancouver Island", type: 'arctic' as const, maxSlots: 42 },
  { id: 103, name: "Melville Island", type: 'arctic' as const, maxSlots: 43 },
  { id: 104, name: "Axel Heiberg Island", type: 'arctic' as const, maxSlots: 43 },
  { id: 105, name: "Alexander Island", type: 'arctic' as const, maxSlots: 44 },
  { id: 106, name: "Berkner Island", type: 'arctic' as const, maxSlots: 44 },
  { id: 107, name: "Devon Island", type: 'arctic' as const, maxSlots: 45 },
  { id: 108, name: "Tasmania", type: 'arctic' as const, maxSlots: 45 },
  { id: 109, name: "Sri Lanka", type: 'arctic' as const, maxSlots: 45 },
  { id: 110, name: "Hispaniola", type: 'arctic' as const, maxSlots: 46 },
  { id: 111, name: "Banks Island", type: 'arctic' as const, maxSlots: 46 },
  { id: 112, name: "Hokkaido", type: 'arctic' as const, maxSlots: 47 },
  { id: 113, name: "Ireland", type: 'arctic' as const, maxSlots: 47 },
  { id: 114, name: "Mindanao", type: 'arctic' as const, maxSlots: 47 },
  { id: 115, name: "Luzon", type: 'arctic' as const, maxSlots: 48 },
  { id: 116, name: "Iceland", type: 'arctic' as const, maxSlots: 48 },
  { id: 117, name: "New Zealand North", type: 'arctic' as const, maxSlots: 49 },
  { id: 118, name: "Java", type: 'arctic' as const, maxSlots: 49 },
  { id: 119, name: "New Zealand South", type: 'arctic' as const, maxSlots: 49 },
  { id: 120, name: "Ellesmere Island", type: 'arctic' as const, maxSlots: 50 },
  { id: 121, name: "Sulawesi", type: 'arctic' as const, maxSlots: 50 },
  { id: 122, name: "Great Britain", type: 'arctic' as const, maxSlots: 51 },
  { id: 123, name: "Victoria Island", type: 'arctic' as const, maxSlots: 51 },
  { id: 124, name: "Honshu", type: 'arctic' as const, maxSlots: 51 },
  { id: 125, name: "Baffin Island", type: 'arctic' as const, maxSlots: 52 },
  { id: 126, name: "Sumatra", type: 'arctic' as const, maxSlots: 52 },
  { id: 127, name: "Madagascar", type: 'arctic' as const, maxSlots: 53 },
  { id: 128, name: "Borneo", type: 'arctic' as const, maxSlots: 53 },
  { id: 129, name: "New Guinea", type: 'arctic' as const, maxSlots: 53 },
  { id: 130, name: "Greenland", type: 'arctic' as const, maxSlots: 54 },
  
  // Deserts (131-150)
  { id: 131, name: "Mojave Desert", type: 'desert' as const, maxSlots: 56 },
  { id: 132, name: "Atacama Desert", type: 'desert' as const, maxSlots: 57 },
  { id: 133, name: "Strzelecki Desert", type: 'desert' as const, maxSlots: 57 },
  { id: 134, name: "Gibson Desert", type: 'desert' as const, maxSlots: 57 },
  { id: 135, name: "Sonoran Desert", type: 'desert' as const, maxSlots: 58 },
  { id: 136, name: "Great Basin Desert", type: 'desert' as const, maxSlots: 58 },
  { id: 137, name: "Chihuahuan Desert", type: 'desert' as const, maxSlots: 58 },
  { id: 138, name: "Thar Desert", type: 'desert' as const, maxSlots: 59 },
  { id: 139, name: "Taklamakan Desert", type: 'desert' as const, maxSlots: 59 },
  { id: 140, name: "Congo Basin", type: 'desert' as const, maxSlots: 60 },
  { id: 141, name: "Karakum Desert", type: 'desert' as const, maxSlots: 60 },
  { id: 142, name: "Scandinavian Peninsula", type: 'desert' as const, maxSlots: 60 },
  { id: 143, name: "Siberian Tundra", type: 'desert' as const, maxSlots: 61 },
  { id: 144, name: "Patagonia", type: 'desert' as const, maxSlots: 61 },
  { id: 145, name: "Gobi Desert", type: 'desert' as const, maxSlots: 62 },
  { id: 146, name: "Great Victoria Desert", type: 'desert' as const, maxSlots: 62 },
  { id: 147, name: "Kalahari Desert", type: 'desert' as const, maxSlots: 62 },
  { id: 148, name: "Antarctic Peninsula", type: 'desert' as const, maxSlots: 63 },
  { id: 149, name: "Amazon Rainforest", type: 'desert' as const, maxSlots: 63 },
  { id: 150, name: "Sahara Desert", type: 'desert' as const, maxSlots: 64 }
];

const INITIAL_STATE: GameState = {
  credits: 0,
  creditsPerClick: 100,
  creditsPerSecond: 0,
  totalClicks: 0,
  totalLandOwned: 0,
  nextLandCost: 1,
  landPurchaseAmount: 1,
  upgrades: [],
  regions: REGION_DATA.map(r => ({
    ...r,
    buildings: [],
    unlocked: r.id === 1
  })),
  currentRegion: null,
  abilities: {
    tapMultiplier: {
      unlocked: false,
      active: false,
      multiplier: 1.5,
      duration: 30,
      lastActivated: 0
    },
    continuousTapping: {
      unlocked: false,
      active: false,
      duration: 60,
      lastActivated: 0
    },
    stealingLand: {
      unlocked: false,
      active: false,
      duration: 45,
      lastActivated: 0
    }
  }
};

// Global singleton store
class GameStore {
  private state: GameState = INITIAL_STATE;
  private listeners: Set<() => void> = new Set();
  private loading = true;

  constructor() {
    this.loadGame();
  }

  private async loadGame() {
    try {
      const saved = await AsyncStorage.getItem('earthGameState');
      if (saved) {
        const parsedState = JSON.parse(saved);
        
        // Ensure all numeric values are properly converted
        const safeCredits = parseFloat(parsedState.credits) || 0;
        const safeCreditsPerClick = parseFloat(parsedState.creditsPerClick) || 100;
        const safeCreditsPerSecond = parseFloat(parsedState.creditsPerSecond) || 0;
        
        console.log('🎮 Loading saved game state:', {
          rawCredits: parsedState.credits,
          safeCredits,
          type: typeof safeCredits
        });
        
        this.state = {
          ...INITIAL_STATE,
          ...parsedState,
          credits: safeCredits,
          creditsPerClick: safeCreditsPerClick,
          creditsPerSecond: safeCreditsPerSecond,
          regions: REGION_DATA.map(r => {
            const savedRegion = parsedState.regions?.find((sr: any) => sr.id === r.id);
            return {
              ...r,
              buildings: savedRegion?.buildings || [],
              unlocked: savedRegion?.unlocked || r.id === 1
            };
          }),
          abilities: {
            ...INITIAL_STATE.abilities,
            ...parsedState.abilities
          }
        };
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  isLoading() {
    return this.loading;
  }

  setState(newState: GameState) {
    this.state = newState;
    this.notifyListeners();
    this.saveGame();
  }

  updateState(updater: (state: GameState) => GameState) {
    this.state = updater(this.state);
    this.notifyListeners();
    this.saveGame();
  }

  private async saveGame() {
    try {
      await AsyncStorage.setItem('earthGameState', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  async resetGame() {
    try {
      await AsyncStorage.removeItem('earthGameState');
      this.state = {
        ...INITIAL_STATE,
        credits: 0,
        creditsPerClick: 100,
        creditsPerSecond: 0,
        totalClicks: 0,
        totalLandOwned: 0
      };
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  }
}

// Global singleton instance
const gameStore = new GameStore();

export function useGameStore() {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const unsubscribe = gameStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const gameState = gameStore.getState();
  const loading = gameStore.isLoading();

  console.log('🎮 useGameStore hook - Current state:', {
    credits: gameState.credits,
    creditsType: typeof gameState.credits,
    loading
  });

  const getCurrentRegion = useCallback(() => {
    const currentRegionId = Math.min(Math.floor(gameState.totalLandOwned / 1000000000000) + 1, 150);
    return gameState.regions.find(r => r.id === currentRegionId) || gameState.regions[0];
  }, [gameState.totalLandOwned, gameState.regions]);

  const getRegionalBonus = useCallback((buildingType: BuildingType, regionType: Region['type']) => {
    const bonuses = {
      island: {
        solar_panel: 1.25,
        wind_turbine: 1.50,
        mining_station: 1.30
      },
      forest: {
        research_lab: 1.50,
        factory: 1.25,
        megacity: 1.40
      },
      arctic: {
        quantum_computer: 1.75,
        space_elevator: 1.60
      },
      desert: {
        solar_panel: 2.00,
        wind_turbine: 1.25,
        mining_station: 1.50,
        research_lab: 1.25,
        factory: 1.75,
        fusion_reactor: 1.25,
        quantum_computer: 1.50,
        space_elevator: 1.25,
        megacity: 1.25,
        dyson_sphere: 1.50,
        galactic_portal: 1.75,
        universe_engine: 2.00
      }
    };
    
    return bonuses[regionType]?.[buildingType] || 1.0;
  }, []);

  const calculateBuildingIncome = useCallback((building: Building) => {
    const config = BUILDING_CONFIGS[building.type];
    const region = gameState.regions.find(r => r.id === building.regionId);
    if (!region || !config) return 0;
    
    const baseIncome = config.baseIncome[building.level - 1] || 0;
    const regionalBonus = getRegionalBonus(building.type, region.type);
    
    return baseIncome * regionalBonus;
  }, [gameState.regions, getRegionalBonus]);

  const calculateTotalBuildingIncome = useCallback(() => {
    return gameState.regions.reduce((total, region) => {
      return total + region.buildings.reduce((regionTotal, building) => {
        return regionTotal + calculateBuildingIncome(building);
      }, 0);
    }, 0);
  }, [gameState.regions, calculateBuildingIncome]);

  const calculateTotalClickBonus = useCallback(() => {
    return gameState.regions.reduce((total, region) => {
      return total + region.buildings.reduce((regionTotal, building) => {
        const config = BUILDING_CONFIGS[building.type];
        const clickBonus = config.clickBonus?.[building.level - 1] || 0;
        const regionalBonus = getRegionalBonus(building.type, region.type);
        return regionTotal + (clickBonus * regionalBonus);
      }, 0);
    }, 0);
  }, [gameState.regions, getRegionalBonus]);

  const click = useCallback(() => {
    const totalClickBonus = calculateTotalClickBonus();
    let clickValue = gameState.creditsPerClick;
    
    if (totalClickBonus > 0) {
      clickValue += (gameState.creditsPerClick * totalClickBonus / 100);
    }
    
    if (gameState.abilities.tapMultiplier.active) {
      clickValue *= gameState.abilities.tapMultiplier.multiplier;
    }
    
    if (gameState.abilities.stealingLand.active) {
      gameStore.updateState(prev => ({
        ...prev,
        totalLandOwned: prev.totalLandOwned + 0.0001,
        creditsPerSecond: prev.creditsPerSecond + (0.0001 * 0.01),
        creditsPerClick: 1 + ((prev.creditsPerSecond + (0.0001 * 0.01)) * 0.01)
      }));
    }
    
    gameStore.updateState(prev => ({
      ...prev,
      credits: parseFloat((prev.credits + clickValue).toFixed(2)),
      totalClicks: prev.totalClicks + 1
    }));
  }, [gameState, calculateTotalClickBonus]);

  const buyLand = useCallback(() => {
    const cost = Math.max(1, Math.pow(1.0001, gameState.totalLandOwned)) * gameState.landPurchaseAmount;
    
    if (gameState.credits < cost) {
      return false;
    }

    gameStore.updateState(prev => {
      const newTotalLandOwned = prev.totalLandOwned + prev.landPurchaseAmount;
      const newCreditsPerSecond = prev.creditsPerSecond + (prev.landPurchaseAmount * 0.01);
      const newCreditsPerClick = 100 + (newCreditsPerSecond * 0.01);
      const newCredits = parseFloat((prev.credits - cost).toFixed(2));
      
      return {
        ...prev,
        credits: newCredits,
        totalLandOwned: newTotalLandOwned,
        creditsPerSecond: newCreditsPerSecond,
        creditsPerClick: newCreditsPerClick,
        nextLandCost: Math.max(1, Math.pow(1.0001, newTotalLandOwned)),
        landPurchaseAmount: 1
      };
    });
    
    return true;
  }, [gameState]);

  const buyLandAmount = useCallback((amount: number) => {
    const baseCost = Math.max(1, Math.pow(1.0001, gameState.totalLandOwned));
    const totalCost = baseCost * amount;
    
    if (gameState.credits < totalCost) {
      return false;
    }

    gameStore.updateState(prev => {
      const newTotalLandOwned = prev.totalLandOwned + amount;
      const newCreditsPerSecond = prev.creditsPerSecond + (amount * 0.01);
      const newCreditsPerClick = 100 + (newCreditsPerSecond * 0.01);
      const newCredits = parseFloat((prev.credits - totalCost).toFixed(2));
      
      return {
        ...prev,
        credits: newCredits,
        totalLandOwned: newTotalLandOwned,
        creditsPerSecond: newCreditsPerSecond,
        creditsPerClick: newCreditsPerClick,
        nextLandCost: Math.max(1, Math.pow(1.0001, newTotalLandOwned))
      };
    });
    
    return true;
  }, [gameState]);

  const setLandPurchaseAmount = useCallback((amount: number) => {
    gameStore.updateState(prev => ({
      ...prev,
      landPurchaseAmount: Math.max(1, amount)
    }));
  }, []);

  const getBulkLandCost = useCallback(() => {
    return Math.max(1, Math.pow(1.0001, gameState.totalLandOwned)) * gameState.landPurchaseAmount;
  }, [gameState.totalLandOwned, gameState.landPurchaseAmount]);

  const getMaxAffordableLand = useCallback(() => {
    if (gameState.credits <= 0) return 1;
    const costPerUnit = Math.max(1, Math.pow(1.0001, gameState.totalLandOwned));
    return Math.max(1, Math.floor(gameState.credits / costPerUnit));
  }, [gameState.credits, gameState.totalLandOwned]);

  const buildBuilding = useCallback((regionId: number, buildingType: BuildingType) => {
    const config = BUILDING_CONFIGS[buildingType];
    const region = gameState.regions.find(r => r.id === regionId);
    
    if (!region || !config) {
      return { success: false, reason: 'invalid' };
    }
    
    const landRequirement = (config.unlockRegion - 1) * 1000000000000;
    if (gameState.totalLandOwned < landRequirement) {
      return { 
        success: false, 
        reason: 'land_requirement',
        required: landRequirement,
        owned: gameState.totalLandOwned
      };
    }
    
    let adjustedCost = config.baseCost[0];
    if (region.type === 'arctic') {
      adjustedCost = Math.floor(adjustedCost * 0.75);
    }
    
    const usedSlots = region.buildings.reduce((total, b) => total + BUILDING_CONFIGS[b.type].slotCost, 0);
    
    console.log(`🏗️ Building ${buildingType} check:`, {
      currentCredits: gameState.credits,
      adjustedCost,
      canAfford: gameState.credits >= adjustedCost,
      hasSlots: usedSlots + config.slotCost <= region.maxSlots
    });
    
    if (gameState.credits < adjustedCost) {
      return { 
        success: false, 
        reason: 'credits',
        required: adjustedCost,
        owned: gameState.credits
      };
    }
    
    if (usedSlots + config.slotCost > region.maxSlots) {
      return { 
        success: false, 
        reason: 'slots',
        required: config.slotCost,
        available: region.maxSlots - usedSlots
      };
    }
    
    const newBuilding: Building = {
      id: `${regionId}-${buildingType}-${Date.now()}`,
      type: buildingType,
      level: 1,
      regionId
    };
    
    gameStore.updateState(prev => ({
      ...prev,
      credits: parseFloat((prev.credits - adjustedCost).toFixed(2)),
      regions: prev.regions.map(r => 
        r.id === regionId 
          ? { ...r, buildings: [...r.buildings, newBuilding] }
          : r
      )
    }));
    
    return { success: true };
  }, [gameState]);

  const upgradeBuilding = useCallback((buildingId: string) => {
    const building = gameState.regions
      .flatMap(r => r.buildings)
      .find(b => b.id === buildingId);
    
    if (!building || building.level >= 3) return false;
    
    const config = BUILDING_CONFIGS[building.type];
    const cost = config.baseCost[building.level];
    
    if (gameState.credits < cost) return false;
    
    gameStore.updateState(prev => ({
      ...prev,
      credits: parseFloat((prev.credits - cost).toFixed(2)),
      regions: prev.regions.map(region => ({
        ...region,
        buildings: region.buildings.map(b => 
          b.id === buildingId 
            ? { ...b, level: b.level + 1 }
            : b
        )
      }))
    }));
    
    return true;
  }, [gameState]);

  const demolishBuilding = useCallback((buildingId: string) => {
    const building = gameState.regions
      .flatMap(r => r.buildings)
      .find(b => b.id === buildingId);
    
    if (!building) return false;
    
    const config = BUILDING_CONFIGS[building.type];
    const totalCost = config.baseCost.slice(0, building.level).reduce((sum, cost) => sum + cost, 0);
    const refund = Math.floor(totalCost * 0.5);
    
    gameStore.updateState(prev => ({
      ...prev,
      credits: parseFloat((prev.credits + refund).toFixed(2)),
      regions: prev.regions.map(region => ({
        ...region,
        buildings: region.buildings.filter(b => b.id !== buildingId)
      }))
    }));
    
    return true;
  }, [gameState]);

  const activateAbility = useCallback((abilityType: 'tapMultiplier' | 'continuousTapping' | 'stealingLand') => {
    const now = Date.now();
    const ability = gameState.abilities[abilityType];
    
    if (!ability.unlocked || ability.active) return false;
    
    const cooldownEnd = ability.lastActivated + (ability.duration * 1000) + (120 * 1000);
    if (now < cooldownEnd) return false;
    
    gameStore.updateState(prev => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [abilityType]: {
          ...prev.abilities[abilityType],
          active: true,
          lastActivated: now
        }
      }
    }));
    
    setTimeout(() => {
      gameStore.updateState(prev => ({
        ...prev,
        abilities: {
          ...prev.abilities,
          [abilityType]: {
            ...prev.abilities[abilityType],
            active: false
          }
        }
      }));
    }, ability.duration * 1000);
    
    return true;
  }, [gameState]);
  
  const getAbilityCooldownInfo = useCallback((abilityType: 'tapMultiplier' | 'continuousTapping' | 'stealingLand') => {
    const now = Date.now();
    const ability = gameState.abilities[abilityType];
    
    if (ability.active) {
      const remaining = Math.max(0, Math.ceil((ability.lastActivated + (ability.duration * 1000) - now) / 1000));
      return { status: 'active' as const, remaining };
    }
    
    const cooldownEnd = ability.lastActivated + (ability.duration * 1000) + (120 * 1000);
    if (now < cooldownEnd) {
      const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
      return { status: 'cooldown' as const, remaining };
    }
    
    return { status: 'ready' as const, remaining: 0 };
  }, [gameState]);

  const resetGame = useCallback(async () => {
    await gameStore.resetGame();
  }, []);

  const saveGameState = useCallback(async () => {
    await gameStore.saveGame();
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        gameStore['saveGame']();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Passive income
  useEffect(() => {
    if (gameState.creditsPerSecond > 0 || gameState.regions.some(r => r.buildings.length > 0)) {
      console.log('🔄 Starting single passive income interval');
      const interval = setInterval(() => {
        // Calculate income fresh each time to get current values
        const landIncome = gameStore.getState().creditsPerSecond;
        const buildingIncome = gameStore.getState().regions.reduce((total, region) => {
          return total + region.buildings.reduce((regionTotal, building) => {
            const config = BUILDING_CONFIGS[building.type];
            const baseIncome = config.baseIncome[building.level - 1] || 0;
            const regionalBonus = getRegionalBonus(building.type, region.type);
            return regionTotal + (baseIncome * regionalBonus);
          }, 0);
        }, 0);
        
        const totalIncome = landIncome + buildingIncome;
        console.log('💰 Adding passive income:', { landIncome, buildingIncome, totalIncome });
        
        gameStore.updateState(prev => ({
          ...prev,
          credits: parseFloat((prev.credits + totalIncome).toFixed(2))
        }));
      }, 1000);
      
      return () => {
        console.log('🛑 Clearing passive income interval');
        clearInterval(interval);
      };
    }
  }, [gameState.creditsPerSecond, gameState.regions, getRegionalBonus]);

  // Update regions when land is purchased
  useEffect(() => {
    const currentRegionId = Math.min(Math.floor(gameState.totalLandOwned / 1000000000000) + 1, 150);
    gameStore.updateState(prev => ({
      ...prev,
      regions: prev.regions.map(region => ({
        ...region,
        unlocked: region.unlocked || region.id <= currentRegionId
      }))
    }));
  }, [gameState.totalLandOwned]);

  // Update abilities unlock conditions
  useEffect(() => {
    gameStore.updateState(prev => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        tapMultiplier: {
          ...prev.abilities.tapMultiplier,
          unlocked: prev.abilities.tapMultiplier.unlocked || prev.totalLandOwned >= 100
        },
        continuousTapping: {
          ...prev.abilities.continuousTapping,
          unlocked: prev.abilities.continuousTapping.unlocked || prev.totalLandOwned >= 500
        },
        stealingLand: {
          ...prev.abilities.stealingLand,
          unlocked: prev.abilities.stealingLand.unlocked || prev.totalLandOwned >= 2000000
        }
      }
    }));
  }, [gameState.totalLandOwned]);
  
  // Continuous tapping ability
  useEffect(() => {
    if (gameState.abilities.continuousTapping.active) {
      const interval = setInterval(() => {
        click();
      }, 333);
      return () => clearInterval(interval);
    }
  }, [gameState.abilities.continuousTapping.active, click]);

  return {
    gameState,
    loading,
    click,
    buyLand,
    buyLandAmount,
    setLandPurchaseAmount,
    getMaxAffordableLand,
    getBulkLandCost,
    resetGame,
    saveGameState,
    activateAbility,
    getAbilityCooldownInfo,
    buildBuilding,
    upgradeBuilding,
    demolishBuilding,
    getCurrentRegion,
    calculateBuildingIncome,
    calculateTotalBuildingIncome,
    calculateTotalClickBonus,
    getRegionalBonus
  };
}