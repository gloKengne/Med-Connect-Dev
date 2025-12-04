// LandingPage.tsx or HomeScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();
  const handleGetStarted = () => {
    console.log('Navigate to signup');
    router.push("/signup");
  };

  
  const handleWatchDemo = () => {
    console.log('Play demo video');
    // Add demo logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="heart" size={24} color="#fff" />
            </View>
            <Text style={styles.logoText}>Med-Connect</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* HIPAA Badge */}
          <View style={styles.badge}>
            <MaterialCommunityIcons name="shield-check" size={18} color="#4a9d9c" />
            <Text style={styles.badgeText}>HIPAA Compliant & Secure</Text>
          </View>

          {/* Main Headline */}
          <Text style={styles.mainHeadline}>
            Your Health Records,{'\n'}
            <Text style={styles.highlightText}>Always Accessible</Text>
          </Text>

          {/* Subheadline */}
          <Text style={styles.subheadline}>
            Securely manage all your medical records in one place. Connect with healthcare providers
            and take control of your health journey.
          </Text>

          {/* CTA Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started Free</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleWatchDemo}>
            <Text style={styles.secondaryButtonText}>Watch Demo</Text>
          </TouchableOpacity>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="file-document-multiple" size={28} color="#4a7c9d" />
              </View>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Records{'\n'}Managed</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="doctor" size={28} color="#4a7c9d" />
              </View>
              <Text style={styles.statNumber}>1,200+</Text>
              <Text style={styles.statLabel}>Doctors{'\n'}Connected</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="shield-lock" size={28} color="#4a9d9c" />
              </View>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Secure &{'\n'}Private</Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Med-Connect?</Text>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="cloud-upload" size={32} color="#4a7c9d" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Easy Upload</Text>
              <Text style={styles.featureDescription}>
                Upload and organize your medical records with just a few taps
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="account-multiple" size={32} color="#4a7c9d" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Connect with Doctors</Text>
              <Text style={styles.featureDescription}>
                Share your records instantly with healthcare providers
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="bell-alert" size={32} color="#4a7c9d" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Reminders</Text>
              <Text style={styles.featureDescription}>
                Never miss appointments or medication schedules
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="cellphone-lock" size={32} color="#4a9d9c" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Bank-Level Security</Text>
              <Text style={styles.featureDescription}>
                Your data is encrypted and protected with industry-leading security
              </Text>
            </View>
          </View>
        </View>

        {/* Testimonial Section */}
        <View style={styles.testimonialSection}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>
          
          <View style={styles.testimonialCard}>
            <View style={styles.quoteIcon}>
              <Text style={styles.quoteText}>"</Text>
            </View>
            <Text style={styles.testimonialText}>
              Med-Connect has made managing my family's health records so much easier. I can access
              everything in one place!
            </Text>
            <Text style={styles.testimonialAuthor}>- Sarah J., Patient</Text>
          </View>

          <View style={styles.testimonialCard}>
            <View style={styles.quoteIcon}>
              <Text style={styles.quoteText}>"</Text>
            </View>
            <Text style={styles.testimonialText}>
              As a doctor, having instant access to patient records has improved my ability to
              provide timely care.
            </Text>
            <Text style={styles.testimonialAuthor}>- Dr. Michael T., Physician</Text>
          </View>
        </View>

        {/* Final CTA Section */}
        <View style={styles.finalCtaSection}>
          <Text style={styles.finalCtaTitle}>Ready to Take Control?</Text>
          <Text style={styles.finalCtaText}>
            Join thousands of users managing their health records securely
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Med-Connect. All rights reserved.</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
            <Text style={styles.footerDivider}>•</Text>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#4a7c9d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a7c9d',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e6f7f7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4a9d9c',
    fontWeight: '500',
  },
  mainHeadline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 40,
    marginBottom: 16,
  },
  highlightText: {
    color: '#4a7c9d',
  },
  subheadline: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#4a7c9d',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginBottom: 40,
  },
  secondaryButtonText: {
    color: '#4a7c9d',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testimonialSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#f0f7fa',
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 48,
    color: '#4a7c9d',
    opacity: 0.3,
    lineHeight: 48,
  },
  testimonialText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  finalCtaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalCtaText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    color: '#4a7c9d',
  },
  footerDivider: {
    marginHorizontal: 12,
    color: '#ccc',
  },
});