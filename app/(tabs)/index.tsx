import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Earth, Zap } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';
import { useState, useEffect, useCallback } from 'react';
import { useMemo } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  withRepeat
} from 'react-native-reanimated';
import LandPurchaseCard from '@/components/LandPurchaseCard';
import EaronSymbol from '@/components/EaronSymbol';

export default function GameScreen() {
  const { 
    gameState, 
    loading, 
    click, 
    activateAbility,
    getAbilityCooldownInfo,
    buyLandAmount, 
    setLandPurchaseAmount, 
    getMaxAffordableLand, 
    getBulkLandCost,
    calculateTotalBuildingIncome,
  } = useGameStore();
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  
  // Generate static stars that don't change on re-renders
  const staticStars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.8 + 0.2,
    }));
  }, []);
  
  const planetScale = useSharedValue(1);
  const planetRotation = useSharedValue(0);
  const planetRotationSpeed = useSharedValue(1);

  // Animate planet rotation (uncontrollable)
  useEffect(() => {
    const startRotation = () => {
      planetRotation.value = withRepeat(
        withTiming(360, { duration: 30000 }), // 30 second rotation
        -1,
        false
      );
    };
    
    startRotation();
  }, [planetRotation]);

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  }, []);

  const formatEaronCredits = useCallback((num: number) => {
    if (num >= 1000000) {
      return num.toExponential(2); // Shows as 1.23e+6 for large numbers
    }
    // For whole numbers, don't show decimals
    if (num % 1 === 0) {
      return num.toString();
    }
    return num.toFixed(2);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }, []);

  const formatArea = useCallback((squareMeters: number) => {
    if (squareMeters >= 1000000) return (squareMeters / 1000000).toFixed(1) + ' km²';
    return formatNumber(squareMeters) + ' m²';
  }, [formatNumber]);

  const getCurrentRegionInfo = useCallback(() => {
    const regions = [
      { id: 1, name: "Coconut Island" },
      { id: 2, name: "Low Isles" },
      { id: 3, name: "Mud Island" },
      { id: 4, name: "Peel Island" },
      { id: 5, name: "St Helena Island" },
      { id: 6, name: "Coochiemudlo Island" },
      { id: 7, name: "Karragarra Island" },
      { id: 8, name: "Lamb Island" },
      { id: 9, name: "Macleay Island" },
      { id: 10, name: "Russell Island" },
      { id: 11, name: "Lady Elliot Island" },
      { id: 12, name: "Heron Island" },
      { id: 13, name: "Lizard Island" },
      { id: 14, name: "Green Island" },
      { id: 15, name: "Fitzroy Island" },
      { id: 16, name: "Bedarra Island" },
      { id: 17, name: "Dunk Island" },
      { id: 18, name: "Palm Island" },
      { id: 19, name: "Hamilton Island" },
      { id: 20, name: "Possession Island" },
      { id: 21, name: "Horn Island" },
      { id: 22, name: "Prince of Wales Island AU" },
      { id: 23, name: "Thursday Island" },
      { id: 24, name: "Barrow Island" },
      { id: 25, name: "Dirk Hartog Island" },
      { id: 26, name: "Garden Island" },
      { id: 27, name: "Rottnest Island" },
      { id: 28, name: "Chagos Archipelago" },
      { id: 29, name: "Cocos Islands" },
      { id: 30, name: "Christmas Island" },
      { id: 31, name: "Lakshadweep" },
      { id: 32, name: "Maldives" },
      { id: 33, name: "Seychelles" },
      { id: 34, name: "Malta" },
      { id: 35, name: "Socotra" },
      { id: 36, name: "Reunion" },
      { id: 37, name: "Mauritius" },
      { id: 38, name: "Comoros" },
      { id: 39, name: "Cape Verde" },
      { id: 40, name: "Madeira" },
      { id: 41, name: "Frankland Islands" },
      { id: 42, name: "Wellesley Islands" },
      { id: 43, name: "Torres Strait Islands" },
      { id: 44, name: "Nicobar Islands" },
      { id: 45, name: "Andaman Islands" },
      { id: 46, name: "Azores" },
      { id: 47, name: "Canary Islands" },
      { id: 48, name: "Balearic Islands" },
      { id: 49, name: "Chatham Islands" },
      { id: 50, name: "Lord Howe Island" },
      { id: 51, name: "Norfolk Island" },
      { id: 52, name: "Phillip Island" },
      { id: 53, name: "French Island" },
      { id: 54, name: "Magnetic Island" },
      { id: 55, name: "Hinchinbrook Island" },
      { id: 56, name: "Whitsunday Island" },
      { id: 57, name: "Moreton Island" },
      { id: 58, name: "North Stradbroke Island" },
      { id: 59, name: "South Stradbroke Island" },
      { id: 60, name: "Bribie Island" },
      { id: 61, name: "Mornington Island" },
      { id: 62, name: "Groote Eylandt" },
      { id: 63, name: "Bathurst Island AU" },
      { id: 64, name: "Melville Island AU" },
      { id: 65, name: "Flinders Island" },
      { id: 66, name: "King Island" },
      { id: 67, name: "Stewart Island" },
      { id: 68, name: "Fraser Island" },
      { id: 69, name: "Kangaroo Island" },
      { id: 70, name: "Cyprus" },
      { id: 71, name: "Crete" },
      { id: 72, name: "Corsica" },
      { id: 73, name: "Taiwan" },
      { id: 74, name: "Kyushu" },
      { id: 75, name: "Sicily" },
      { id: 76, name: "Hainan" },
      { id: 77, name: "Shikoku" },
      { id: 78, name: "Sardinia" },
      { id: 79, name: "Long Island" },
      { id: 80, name: "Manitoulin Island" },
      { id: 81, name: "Cape Breton Island" },
      { id: 82, name: "Anticosti Island" },
      { id: 83, name: "Prince Edward Island" },
      { id: 84, name: "Graham Island" },
      { id: 85, name: "Cornwallis Island" },
      { id: 86, name: "Borden Island" },
      { id: 87, name: "Eglinton Island" },
      { id: 88, name: "Mackenzie King Island" },
      { id: 89, name: "Prince Charles Island" },
      { id: 90, name: "Amund Ringnes Island" },
      { id: 91, name: "October Revolution Island" },
      { id: 92, name: "Bylot Island" },
      { id: 93, name: "Ellef Ringnes Island" },
      { id: 94, name: "King William Island" },
      { id: 95, name: "Prince Patrick Island" },
      { id: 96, name: "Bathurst Island" },
      { id: 97, name: "Kotelny Island" },
      { id: 98, name: "Somerset Island" },
      { id: 99, name: "Vancouver Island" },
      { id: 100, name: "Prince of Wales Island" },
      { id: 101, name: "Southampton Island" },
      { id: 102, name: "Melville Island" },
      { id: 103, name: "Axel Heiberg Island" },
      { id: 104, name: "Berkner Island" },
      { id: 105, name: "Alexander Island" },
      { id: 106, name: "Devon Island" },
      { id: 107, name: "Tasmania" },
      { id: 108, name: "Sri Lanka" },
      { id: 109, name: "Banks Island" },
      { id: 110, name: "Hispaniola" },
      { id: 111, name: "Hokkaido" },
      { id: 112, name: "Ireland" },
      { id: 113, name: "Mindanao" },
      { id: 114, name: "Iceland" },
      { id: 115, name: "Luzon" },
      { id: 116, name: "New Zealand North" },
      { id: 117, name: "Java" },
      { id: 118, name: "New Zealand South" },
      { id: 119, name: "Sulawesi" },
      { id: 120, name: "Ellesmere Island" },
      { id: 121, name: "Great Britain" },
      { id: 122, name: "Victoria Island" },
      { id: 123, name: "Honshu" },
      { id: 124, name: "Sumatra" },
      { id: 125, name: "Baffin Island" },
      { id: 126, name: "Madagascar" },
      { id: 127, name: "Borneo" },
      { id: 128, name: "New Guinea" },
      { id: 129, name: "Mojave Desert" },
      { id: 130, name: "Atacama Desert" },
      { id: 131, name: "Strzelecki Desert" },
      { id: 132, name: "Gibson Desert" },
      { id: 133, name: "Great Basin Desert" },
      { id: 134, name: "Chihuahuan Desert" },
      { id: 135, name: "Sonoran Desert" },
      { id: 136, name: "Thar Desert" },
      { id: 137, name: "Taklamakan Desert" },
      { id: 138, name: "Karakum Desert" },
      { id: 139, name: "Scandinavian Peninsula" },
      { id: 140, name: "Congo Basin" },
      { id: 141, name: "Siberian Tundra" },
      { id: 142, name: "Patagonia" },
      { id: 143, name: "Great Victoria Desert" },
      { id: 144, name: "Kalahari Desert" },
      { id: 145, name: "Gobi Desert" },
      { id: 146, name: "Antarctic Peninsula" },
      { id: 147, name: "Greenland" },
      { id: 148, name: "Amazon Rainforest" },
      { id: 149, name: "Arabian Peninsula" },
      { id: 150, name: "Sahara Desert" }
    ];
    
    // Each zone = 1 billion m²
    // Each area = 10 zones = 10 billion m²
    // Each region = 100 areas = 1 trillion m²
    const currentRegionId = Math.min(Math.floor(gameState.totalLandOwned / 1000000000000) + 1, 150);
    const currentRegion = regions[currentRegionId - 1];
    const landInCurrentRegion = gameState.totalLandOwned % 1000000000000;
    const currentAreaNumber = Math.min(Math.floor(landInCurrentRegion / 10000000000) + 1, 100);
    const landInCurrentArea = landInCurrentRegion % 10000000000;
    const currentZoneNumber = Math.min(Math.floor(landInCurrentArea / 1000000000) + 1, 10);
    
    return {
      regionNumber: currentRegionId,
      regionName: currentRegion.name,
      areaNumber: currentAreaNumber,
      zoneNumber: currentZoneNumber
    };
  }, [gameState.totalLandOwned]);

  const handlePlanetPress = useCallback((event: any) => {
    // Only animate planet scale, not rotation
    console.log('🌍 Planet pressed! Current gameState:', gameState);
    planetScale.value = withSequence(
      withSpring(0.95, { damping: 15, stiffness: 300 }),
      withSpring(1.02, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    // Add click effect
    const { locationX, locationY } = event.nativeEvent || {};
    
    // Calculate actual tap value (including multipliers)
    let actualTapValue = gameState.creditsPerClick;
    if (gameState.abilities.tapMultiplier.active) {
      actualTapValue *= gameState.abilities.tapMultiplier.multiplier;
    }
    
    const newEffect = {
      id: Date.now() + Math.random(),
      x: locationX || 140,
      y: locationY || 140
    };
    setClickEffects(prev => [...prev, newEffect]);

    // Remove effect after animation
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1500);

    console.log('🖱️ About to call click function...');
    click();
    console.log('✅ Click function called');
  }, [click, planetScale, gameState]);

  const handleBuyLand = useCallback(() => {
    console.log('🏞️ Buy land button pressed! Current gameState:', gameState);
    const result = buyLandAmount(1);
    console.log('🏞️ BuyLand result:', result);
  }, [buyLandAmount, gameState]);

  const handleBuyLandAmount = useCallback((amount: number) => {
    console.log('🏞️ Buy land amount pressed!', amount, 'Current gameState:', gameState);
    const result = buyLandAmount(amount);
    console.log('🏞️ BuyLandAmount result:', result);
  }, [buyLandAmount, gameState]);

  const handleCloseWelcome = () => {
    setShowWelcomePopup(false);
  };

  const handleActivateAbility = (abilityType: 'tapMultiplier' | 'continuousTapping' | 'stealingLand') => {
    activateAbility(abilityType);
  };

  const planetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: planetScale.value },
      { rotate: `${planetRotation.value}deg` }
    ]
  }), []);

  if (loading) {
    return (
      <LinearGradient colors={['#0B0D1A', '#1A1B3A', '#2D1B69']} style={styles.container}>
        <View style={styles.centerContent}>
          <Animated.View style={[styles.loadingPlanet, planetAnimatedStyle]}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
              style={styles.loadingPlanetInner}
            >
              <Earth size={40} color="white" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.loadingText}>Initializing Earth Land Buyer...</Text>
          <Text style={styles.loadingText}>Initializing Universe Owner...</Text>
          <Text style={styles.loadingSubtext}>Preparing your cosmic real estate empire</Text>
        </View>
      </LinearGradient>
    );
  }

  const earthOwnershipPercentage = (gameState.totalLandOwned / 148940000000000) * 100; // 148.94 million km² in m²
  const currentRegionInfo = getCurrentRegionInfo();
  const totalBuildingIncome = calculateTotalBuildingIncome();
  const totalPassiveIncome = gameState.creditsPerSecond + totalBuildingIncome;

  console.log('🎮 Game Screen Income Debug:', {
    landIncome: gameState.creditsPerSecond,
    buildingIncome: totalBuildingIncome,
    totalDisplayed: totalPassiveIncome,
    creditsPerSecond: gameState.creditsPerSecond
  });

  return (
    <LinearGradient colors={['#0B0D1A', '#1A1B3A', '#2D1B69']} style={styles.container}>
      {/* Static Background Stars - No animation to prevent performance issues */}
      <View style={styles.starsBackground} pointerEvents="none">
        {staticStars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {/* 1. Earon Credits Display - At the top */}
        <View style={styles.earonCard}>
          <View style={styles.earonHeader}>
            <EaronSymbol size="medium" />
            <Text style={styles.earonTitle}>Earon</Text>
          </View>
          <View style={styles.earonStats}>
            <Text style={styles.earonValue}>{formatEaronCredits(gameState.credits)}</Text>
            <View style={styles.perSecondRow}>
              <Zap size={16} color="#8B5CF6" />
              <Text style={styles.perSecondValue}>{formatEaronCredits(totalPassiveIncome)}/s</Text>
            </View>
          </View>
        </View>

        {/* 2. Interactive Earth */}
        <View style={styles.planetContainer}>
          <Text style={styles.planetTitle}>🌍 Earth</Text>
          <Text style={styles.planetSubtitle}>
            {currentRegionInfo.regionName} • Area {currentRegionInfo.areaNumber} • Zone {currentRegionInfo.zoneNumber}
          </Text>
          
          <TouchableOpacity onPress={handlePlanetPress} activeOpacity={0.9}>
            <Animated.View style={[styles.planetWrapper, planetAnimatedStyle]}>
              <View style={styles.earthPlanet}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800' }}
                  style={styles.earthImage}
                />
                <View style={styles.earthOverlay}>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
          
          {/* Click Effects */}
          {clickEffects.map(effect => (
            <Animated.View
              key={effect.id}
              style={[
                styles.clickEffect,
                { left: effect.x - 30, top: effect.y - 30 }
              ]}
            >
              <Text style={styles.clickEffectText} numberOfLines={1}>
                +{(() => {
                  const value = gameState.abilities.tapMultiplier.active 
                    ? gameState.creditsPerClick * gameState.abilities.tapMultiplier.multiplier
                    : gameState.creditsPerClick;
                  return value % 1 === 0 ? value.toString() : value.toFixed(2);
                })()}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* 3. Abilities Section - Moved to bottom for better flow */}
        <View style={styles.abilitiesContainer}>
          <Text style={styles.abilitiesTitle}>⚡ Abilities</Text>
          <View style={styles.abilitiesGrid}>
            {/* Tap Multiplier */}
            <TouchableOpacity
              style={[
                styles.abilityCard,
                !gameState.abilities.tapMultiplier.unlocked && styles.abilityLocked,
                gameState.abilities.tapMultiplier.active && styles.abilityActive
              ]}
              onPress={() => handleActivateAbility('tapMultiplier')}
              disabled={!gameState.abilities.tapMultiplier.unlocked || gameState.abilities.tapMultiplier.active || getAbilityCooldownInfo('tapMultiplier').status === 'cooldown'}
            >
              <Text style={styles.abilityIcon}>🔥</Text>
              <Text style={styles.abilityName}>Tap Multiplier</Text>
              <Text style={styles.abilityDescription}>1.5x tap power for 30s</Text>
              {!gameState.abilities.tapMultiplier.unlocked ? (
                <Text style={styles.abilityUnlock}>Unlock at 100 m²</Text>
              ) : (
                <Text style={styles.abilityStatus}>
                  {(() => {
                    const info = getAbilityCooldownInfo('tapMultiplier');
                    if (info.status === 'active') return `Active ${formatTime(info.remaining)}`;
                    if (info.status === 'cooldown') return `${formatTime(info.remaining)}`;
                    return 'Ready';
                  })()}
                </Text>
              )}
            </TouchableOpacity>

            {/* Continuous Tapping */}
            <TouchableOpacity
              style={[
                styles.abilityCard,
                !gameState.abilities.continuousTapping.unlocked && styles.abilityLocked,
                gameState.abilities.continuousTapping.active && styles.abilityActive
              ]}
              onPress={() => handleActivateAbility('continuousTapping')}
              disabled={!gameState.abilities.continuousTapping.unlocked || gameState.abilities.continuousTapping.active || getAbilityCooldownInfo('continuousTapping').status === 'cooldown'}
            >
              <Text style={styles.abilityIcon}>🔄</Text>
              <Text style={styles.abilityName}>Auto Tap</Text>
              <Text style={styles.abilityDescription}>3 taps/sec for 30s</Text>
              {!gameState.abilities.continuousTapping.unlocked ? (
                <Text style={styles.abilityUnlock}>Unlock at 500 m²</Text>
              ) : (
                <Text style={styles.abilityStatus}>
                  {(() => {
                    const info = getAbilityCooldownInfo('continuousTapping');
                    if (info.status === 'active') return `Active ${formatTime(info.remaining)}`;
                    if (info.status === 'cooldown') return `${formatTime(info.remaining)}`;
                    return 'Ready';
                  })()}
                </Text>
              )}
            </TouchableOpacity>

            {/* Stealing Land */}
            <TouchableOpacity
              style={[
                styles.abilityCard,
                !gameState.abilities.stealingLand.unlocked && styles.abilityLocked,
                gameState.abilities.stealingLand.active && styles.abilityActive
              ]}
              onPress={() => handleActivateAbility('stealingLand')}
              disabled={!gameState.abilities.stealingLand.unlocked || gameState.abilities.stealingLand.active || getAbilityCooldownInfo('stealingLand').status === 'cooldown'}
            >
              <Text style={styles.abilityIcon}>🏴‍☠️</Text>
              <Text style={styles.abilityName}>Land Steal</Text>
              <Text style={styles.abilityDescription}>1 cm²/tap for 30s</Text>
              {!gameState.abilities.stealingLand.unlocked ? (
                <Text style={styles.abilityUnlock}>Unlock at 2 km²</Text>
              ) : (
                <Text style={styles.abilityStatus}>
                  {(() => {
                    const info = getAbilityCooldownInfo('stealingLand');
                    if (info.status === 'active') return `Active ${formatTime(info.remaining)}`;
                    if (info.status === 'cooldown') return `${formatTime(info.remaining)}`;
                    return 'Ready';
                  })()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4. Land Purchase Section - Fixed at bottom */}
      <View style={styles.bottomSection}>
        <LandPurchaseCard
          credits={gameState.credits}
          totalLandOwned={gameState.totalLandOwned}
          onBuyLand={handleBuyLandAmount}
          getMaxAffordableLand={getMaxAffordableLand}
          formatNumber={formatNumber}
          showTitle={false}
          compact={true}
        />
      </View>

      {/* Welcome Popup */}
      <Modal
        visible={showWelcomePopup}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseWelcome}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseWelcome}
        >
          <View style={styles.modalContent}>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeHeader}>
                <Text style={styles.welcomeEmoji}>🌍</Text>
                <Text style={styles.welcomeTitle}>Welcome to Universe Owner!</Text>
              </View>
              <Text style={styles.welcomeText}>
                Start your Earth empire from nothing! Tap Earth to earn 1 Earon per click. Buy land by the square meter - 
                each starts at 1 Earon (increasing by 0.1% per purchase) and generates 0.01 Earon/second. 
                Your tap value grows by 1% of your total passive income!
              </Text>
              <Text style={styles.tapToContinue}>Tap anywhere to continue</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 60 : 80,
    paddingHorizontal: 20,
    paddingBottom: 120, // Add space for bottom section
    zIndex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8, // Add small padding to separate from abilities
    paddingBottom: Platform.OS === 'web' ? 20 : 40,
    zIndex: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPlanet: {
    marginBottom: 20,
  },
  loadingPlanetInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  loadingSubtext: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '400',
  },
  earonCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  earonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  earonTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  earonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earonValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  perSecondRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perSecondValue: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  continentCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  continentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  continentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  continentTitle: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '800',
  },
  continentSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  continentBonus: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  bonusCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  bonusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  bonusTitle: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
  },
  bonusValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  ownedContinents: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  ownedContinent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  ownedContinentIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ownedContinentText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  ownershipCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ownershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownershipTitle: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 70,
  },
  ownershipSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  planetContainer: {
    alignItems: 'center',
    marginVertical: 16,
    position: 'relative',
    height: 320, // Increased height for larger Earth
    justifyContent: 'center',
  },
  planetTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  planetSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  planetWrapper: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  earthPlanet: {
    width: 300, // Significantly larger Earth
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
  earthImage: {
    width: '100%',
    height: '100%',
    borderRadius: 147,
  },
  earthOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 147,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  clickEffect: {
    position: 'absolute',
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  clickEffectText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
    numberOfLines: 1,
    flexWrap: 'nowrap',
    width: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  welcomeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  welcomeTitle: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '800',
  },
  welcomeText: {
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 16,
  },
  tapToContinue: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  abilitiesContainer: {
    marginBottom: 0,
  },
  abilitiesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  abilitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  abilityCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 100,
    justifyContent: 'space-between',
  },
  abilityLocked: {
    backgroundColor: 'rgba(107, 114, 128, 0.05)',
    borderColor: 'rgba(107, 114, 128, 0.15)',
    opacity: 0.6,
  },
  abilityActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  abilityIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  abilityName: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  abilityDescription: {
    color: '#D1D5DB',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 4,
  },
  abilityUnlock: {
    color: '#F59E0B',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  abilityStatus: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});