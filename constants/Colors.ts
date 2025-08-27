/**
 * InstantChat Color Theme - Designed for better visibility and modern UI
 */

const tintColorLight = '#007AFF';  // iOS Blue
const tintColorDark = '#00aaffff';   // Bright Cyan

export const Colors = {
  light: {
    text: '#1C1C1E',           // Dark gray for readability
    background: '#F2F2F7',     // Light gray background
    tint: tintColorLight,      // iOS Blue
    icon: '#8E8E93',           // Medium gray
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorLight,
    
    // Chat-specific colors
    primary: '#007AFF',        // Primary blue
    secondary: '#5856D6',      // Purple
    success: '#34C759',        // Green
    warning: '#FF9500',        // Orange
    danger: '#FF3B30',         // Red
    
    // Message colors
    myMessage: '#007AFF',      // Blue for sent messages
    otherMessage: '#E5E5EA',   // Light gray for received messages
    myMessageText: '#FFFFFF',  // White text on blue
    otherMessageText: '#000000', // Black text on gray
    
    // UI elements
    cardBackground: '#FFFFFF',
    borderColor: '#E5E5EA',
    placeholderText: '#8E8E93',
  },
  dark: {
    text: '#FFFFFF',           // White text
    background: '#000000',     // Pure black background
    tint: tintColorDark,       // Bright cyan
    icon: '#8E8E93',           // Medium gray
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    
    // Chat-specific colors
    primary: '#00aaffff',        // Bright cyan
    secondary: '#000000ff',      // Bright purple
    success: '#30D158',        // Bright green
    warning: '#FF9F0A',        // Bright orange
    danger: '#FF453A',         // Bright red
    
    // Message colors
    myMessage: '#00D4FF',      // Cyan for sent messages
    otherMessage: '#2C2C2E',   // Dark gray for received messages
    myMessageText: '#000000',  // Black text on cyan
    otherMessageText: '#FFFFFF', // White text on dark gray
    
    // UI elements
    cardBackground: '#1C1C1E',
    borderColor: '#38383A',
    placeholderText: '#8E8E93',
  },
};
