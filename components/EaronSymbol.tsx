import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EaronSymbolProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

export default function EaronSymbol({ size = 'medium', color = '#F59E0B', style }: EaronSymbolProps) {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 18, height: 22, fontSize: 16 };
      case 'medium': return { width: 22, height: 26, fontSize: 20 };
      case 'large': return { width: 26, height: 30, fontSize: 24 };
      default: return { width: 22, height: 26, fontSize: 20 };
    }
  };

  const dimensions = getSize();

  return (
    <View style={[styles.container, { width: dimensions.width, height: dimensions.height }, style]}>
      <LinearGradient
        colors={[color, color + 'DD', color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.symbolBackground}
      >
        <Text style={[styles.symbol, { fontSize: dimensions.fontSize, color: 'white' }]}>
          E
        </Text>
      </LinearGradient>
      <View style={[styles.accent, { borderColor: color }]} />
      <View style={[styles.bottomAccent, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  symbol: {
    fontWeight: '900',
    fontFamily: 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  accent: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  bottomAccent: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
});