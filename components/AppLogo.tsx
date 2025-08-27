import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  useImage?: boolean;
  imageSource?: ImageSourcePropType;
}

export default function AppLogo({ size = 'medium', showText = true, useImage = true, imageSource }: AppLogoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const logoSizes = {
    small: { width: 40, height: 40, fontSize: 16, textSize: 12 },
    medium: { width: 80, height: 80, fontSize: 32, textSize: 16 },
    large: { width: 120, height: 120, fontSize: 48, textSize: 20 }
  };

  const currentSize = logoSizes[size];

  const source = imageSource || require('../assets/images/icon.jpeg');

  return (
    <View style={styles.container}>
      {useImage ? (
        <Image
          source={source}
          style={{ width: currentSize.width, height: currentSize.height, borderRadius: 20 }}
          resizeMode="contain"
        />
  ) : (
  <View style={[
        styles.logoIcon,
        {
          width: currentSize.width,
          height: currentSize.height,
          backgroundColor: colors.primary,
        }
      ]}>
        {/* Chat bubble design */}
        <View style={[styles.chatBubble, { backgroundColor: 'white' }]}>
          <Text style={[styles.chatIcon, { fontSize: currentSize.fontSize * 0.3 }]}>💬</Text>
        </View>
        <View style={[styles.qrIcon, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
          <Text style={[styles.qrText, { fontSize: currentSize.fontSize * 0.2 }]}>QR</Text>
        </View>
      </View>
      )}

      {/* App Name */}
      {showText && (
        <Text style={[
          styles.appName,
          {
            color: colors.text,
            fontSize: currentSize.textSize,
            marginTop: size === 'large' ? 15 : 8
          }
        ]}>
          InstantChat
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatBubble: {
    width: '60%',
    height: '60%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '20%',
    left: '20%',
  },
  chatIcon: {
    color: '#007AFF',
  },
  qrIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  appName: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
