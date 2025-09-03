import { StyleSheet } from 'react-native';

import AppLogo from '@/components/AppLogo';
import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <ThemedView style={styles.headerContainer}>
          <AppLogo size="large" showText={false} />
        </ThemedView>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="h1">About InstantChat</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.description}>
        InstantChat is a real-time messaging app that allows two users to quickly connect 
        and chat using QR codes. Perfect for meeting new people or quick conversations 
        without sharing personal contact information.
      </ThemedText>

      <Collapsible title="How to Use">
        <ThemedText style={styles.stepText}>
          <ThemedText type="bodyBold">1. Generate QR Code:</ThemedText> 
          {'\n'}Create a QR code with your name to share with others.
        </ThemedText>
        <ThemedText style={styles.stepText}>
          <ThemedText type="bodyBold">2. Scan QR Code:</ThemedText> 
          {'\n'}Use your camera to scan someone else's QR code.
        </ThemedText>
        <ThemedText style={styles.stepText}>
          <ThemedText type="bodyBold">3. Start Chatting:</ThemedText> 
          {'\n'}Once connected, start your conversation immediately.
        </ThemedText>
        <ThemedText style={styles.stepText}>
          <ThemedText type="bodyBold">4. View History:</ThemedText> 
          {'\n'}Access your previous chat sessions anytime.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Features">
        <ThemedText style={styles.featureText}>
          • <ThemedText type="bodyBold">QR Code Generation & Scanning</ThemedText>
          {'\n'}• <ThemedText type="bodyBold">Real-time Messaging</ThemedText>
          {'\n'}• <ThemedText type="bodyBold">Local Message Storage</ThemedText>
          {'\n'}• <ThemedText type="bodyBold">Chat History</ThemedText>
          {'\n'}• <ThemedText type="bodyBold">Dark & Light Mode</ThemedText>
          {'\n'}• <ThemedText type="bodyBold">Temporary Connections</ThemedText>
        </ThemedText>
      </Collapsible>

      <Collapsible title="Privacy & Security">
        <ThemedText>
          <ThemedText type="bodyBold">Local Storage:</ThemedText> All chat messages 
          are stored locally on your device using SQLite database.
        </ThemedText>
        <ThemedText style={styles.privacyText}>
          <ThemedText type="bodyBold">Temporary Sessions:</ThemedText> QR codes 
          expire after 1 hour for security.
        </ThemedText>
        <ThemedText style={styles.privacyText}>
          <ThemedText type="bodyBold">No Personal Data:</ThemedText> Only the name 
          you provide is shared with chat partners.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Technical Details">
        <ThemedText>
          <ThemedText type="bodyBold">Platform:</ThemedText> React Native with Expo
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="bodyBold">Database:</ThemedText> SQLite for local storage
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="bodyBold">Camera:</ThemedText> Expo Camera for QR scanning
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="bodyBold">QR Generation:</ThemedText> react-native-qrcode-svg
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="bodyBold">Compatibility:</ThemedText> Android 9+ supported
        </ThemedText>
      </Collapsible>

      <Collapsible title="Version Information">
        <ThemedText>
          <ThemedText type="bodyBold">Version:</ThemedText> 1.0.0
        </ThemedText>
        <ThemedText style={styles.versionText}>
          <ThemedText type="bodyBold">Built for:</ThemedText> Academic Project
        </ThemedText>
        
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  stepText: {
    marginBottom: 12,
    lineHeight: 20,
  },
  featureText: {
    lineHeight: 24,
  },
  privacyText: {
    marginTop: 10,
    lineHeight: 20,
  },
  techText: {
    marginTop: 8,
    lineHeight: 20,
  },
  versionText: {
    marginTop: 8,
    lineHeight: 20,
  },
});
