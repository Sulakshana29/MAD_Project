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
        <ThemedText type="title">About InstantChat</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.description}>
        InstantChat is a real-time messaging app that allows two users to quickly connect 
        and chat using QR codes. Perfect for meeting new people or quick conversations 
        without sharing personal contact information.
      </ThemedText>

      <Collapsible title="How to Use">
        <ThemedText style={styles.stepText}>
          <ThemedText type="defaultSemiBold">1. Generate QR Code:</ThemedText> 
          {'\n'}Create a QR code with your name to share with others.
        </ThemedText>
        <ThemedText style={styles.stepText}>
          <ThemedText type="defaultSemiBold">2. Scan QR Code:</ThemedText> 
          {'\n'}Use your camera to scan someone else's QR code.
        </ThemedText>
        <ThemedText style={styles.stepText}>
          <ThemedText type="defaultSemiBold">3. Start Chatting:</ThemedText> 
          {'\n'}Once connected, start your conversation immediately.
        </ThemedText>
        <ThemedText style={styles.stepText}>
          <ThemedText type="defaultSemiBold">4. View History:</ThemedText> 
          {'\n'}Access your previous chat sessions anytime.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Features">
        <ThemedText style={styles.featureText}>
          • <ThemedText type="defaultSemiBold">QR Code Generation & Scanning</ThemedText>
          {'\n'}• <ThemedText type="defaultSemiBold">Real-time Messaging</ThemedText>
          {'\n'}• <ThemedText type="defaultSemiBold">Local Message Storage</ThemedText>
          {'\n'}• <ThemedText type="defaultSemiBold">Chat History</ThemedText>
          {'\n'}• <ThemedText type="defaultSemiBold">Dark & Light Mode</ThemedText>
          {'\n'}• <ThemedText type="defaultSemiBold">Temporary Connections</ThemedText>
        </ThemedText>
      </Collapsible>

      <Collapsible title="Privacy & Security">
        <ThemedText>
          <ThemedText type="defaultSemiBold">Local Storage:</ThemedText> All chat messages 
          are stored locally on your device using SQLite database.
        </ThemedText>
        <ThemedText style={styles.privacyText}>
          <ThemedText type="defaultSemiBold">Temporary Sessions:</ThemedText> QR codes 
          expire after 1 hour for security.
        </ThemedText>
        <ThemedText style={styles.privacyText}>
          <ThemedText type="defaultSemiBold">No Personal Data:</ThemedText> Only the name 
          you provide is shared with chat partners.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Technical Details">
        <ThemedText>
          <ThemedText type="defaultSemiBold">Platform:</ThemedText> React Native with Expo
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="defaultSemiBold">Database:</ThemedText> SQLite for local storage
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="defaultSemiBold">Camera:</ThemedText> Expo Camera for QR scanning
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="defaultSemiBold">QR Generation:</ThemedText> react-native-qrcode-svg
        </ThemedText>
        <ThemedText style={styles.techText}>
          <ThemedText type="defaultSemiBold">Compatibility:</ThemedText> Android 9+ supported
        </ThemedText>
      </Collapsible>

      <Collapsible title="Version Information">
        <ThemedText>
          <ThemedText type="defaultSemiBold">Version:</ThemedText> 1.0.0
        </ThemedText>
        <ThemedText style={styles.versionText}>
          <ThemedText type="defaultSemiBold">Built for:</ThemedText> Academic Project
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
