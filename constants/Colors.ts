/**
 * InstantChat Enhanced Color Theme - Modern, accessible, and visually appealing
 */

const tintColorLight = '#2563EB';  // Modern blue
const tintColorDark = '#3B82F6';   // Bright blue

export const Colors = {
  light: {
    // Core colors
    text: '#1F2937',           // Dark gray for excellent readability
    textSecondary: '#6B7280',  // Secondary text
    background: '#F9FAFB',     // Very light gray background
    tint: tintColorLight,
    icon: '#6B7280',           // Medium gray
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    
    // Enhanced color palette
    primary: '#2563EB',        // Modern blue
    primaryLight: '#DBEAFE',   // Light blue background
    secondary: '#7C3AED',      // Purple
    secondaryLight: '#EDE9FE', // Light purple background
    success: '#059669',        // Green
    successLight: '#D1FAE5',   // Light green background
    warning: '#D97706',        // Orange
    warningLight: '#FEF3C7',   // Light yellow background
    danger: '#DC2626',         // Red
    dangerLight: '#FEE2E2',    // Light red background
    
    // Message colors
    myMessage: '#2563EB',      // Blue for sent messages
    otherMessage: '#F3F4F6',   // Light gray for received messages
    myMessageText: '#FFFFFF',  // White text on blue
    otherMessageText: '#1F2937', // Dark text on light gray
    
    // UI elements
    cardBackground: '#FFFFFF',
    cardBackgroundSecondary: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderColorLight: '#F3F4F6',
    placeholderText: '#9CA3AF',
    
    // Gradients and shadows
    shadowColor: '#000000',
    shadowLight: '#F3F4F6',
    
    // Status colors
    online: '#10B981',
    offline: '#9CA3AF',
    typing: '#F59E0B',
  },
  dark: {
    // Core colors
    text: '#F9FAFB',           // Light text
    textSecondary: '#D1D5DB',  // Secondary text
    background: '#111827',     // Dark background
    tint: tintColorDark,
    icon: '#9CA3AF',           // Medium gray
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    
    // Enhanced color palette
    primary: '#3B82F6',        // Bright blue
    primaryLight: '#1E3A8A',   // Dark blue background
    secondary: '#8B5CF6',      // Bright purple
    secondaryLight: '#4C1D95', // Dark purple background
    success: '#10B981',        // Bright green
    successLight: '#064E3B',   // Dark green background
    warning: '#F59E0B',        // Bright orange
    warningLight: '#78350F',   // Dark orange background
    danger: '#EF4444',         // Bright red
    dangerLight: '#7F1D1D',    // Dark red background
    
    // Message colors
    myMessage: '#3B82F6',      // Blue for sent messages
    otherMessage: '#374151',   // Dark gray for received messages
    myMessageText: '#FFFFFF',  // White text on blue
    otherMessageText: '#F9FAFB', // Light text on dark gray
    
    // UI elements
    cardBackground: '#1F2937',
    cardBackgroundSecondary: '#111827',
    borderColor: '#374151',
    borderColorLight: '#4B5563',
    placeholderText: '#9CA3AF',
    
    // Gradients and shadows
    shadowColor: '#000000',
    shadowLight: '#1F2937',
    
    // Status colors
    online: '#10B981',
    offline: '#6B7280',
    typing: '#F59E0B',
  },
};

// Additional design tokens
export const DesignTokens = {
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
    round: 50,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: '600' as const, lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
    h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
    caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    captionBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
    small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  },
};


