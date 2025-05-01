import React from 'react';
import { Text, View, StyleSheet, Linking, Dimensions } from 'react-native';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';

const AboutScreen = () => {
    const screenWidth = Dimensions.get('window').width;
    const { t } = useTranslation();
    
  return (
    <GeneralTemplate>
                
    <View style={{ width: screenWidth * 0.9, flex: 1 }}>
        <Text style={GeneralStyles.title}>{t('about.title')}</Text>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>{t('about.description_title')}</Text>
          <Text style={styles.paragraph}>{t('about.description_text')}</Text>

          <Text style={styles.sectionTitle}>{t('about.features_title')}</Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• {t('about.feature_create')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_categories')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_trash')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_auth')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_profile')}</Text>
          </View>

          <Text style={styles.sectionTitle}>{t('about.version_title')}</Text>
          <Text style={styles.paragraph}>{t('about.version_text')}</Text>

          <Text style={styles.sectionTitle}>{t('about.author_title')}</Text>
          <Text style={styles.paragraph}>{t('about.author_text')}</Text>

          <Text style={styles.sectionTitle}>{t('about.contact_title')}</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(`mailto:${t('about.contact_email')}`)}
          >
            {t('about.contact_email')}
          </Text>
        </ScrollView>
      </View>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center'

  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 30,
    color: '#CDF8FA',
    fontWeight: 'bold',
    marginTop: 15,
    
  },
  paragraph: {
    fontSize: 19,
    color: '#CDF8FA',
    marginTop: 5,
    lineHeight: 22,
  },
  listContainer: {
    marginTop: 5,
    paddingLeft: 10,
  },
  listItem: {
    fontSize: 19,
    color: '#CDF8FA',
    marginVertical: 2,
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    color: '#1e90ff',
    marginTop: 5,
  },
});

export default AboutScreen;
