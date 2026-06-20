import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar, ViewProps } from 'react-native';

const AstralSafeAreaView: React.FC<ViewProps> = ({ style, children, ...props }) => {
  return (
    <SafeAreaView 
      style={[styles.safeArea, style]} 
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
});

export default AstralSafeAreaView;
