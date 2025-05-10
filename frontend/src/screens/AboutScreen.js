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
          style={styles.scroll}               // ocupa todo el hueco
          contentContainerStyle={styles.container} // sólo padding
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          {/* Descripción */}
          <Text style={styles.sectionTitle}>{t('about.description_title')}</Text>
          <Text style={styles.paragraph}>{t('about.description_text')}</Text>

          {/* Características */}
          <Text style={styles.sectionTitle}>{t('about.features_title')}</Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• {t('about.feature_create')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_categories')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_trash')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_auth')}</Text>
            <Text style={styles.listItem}>• {t('about.feature_profile')}</Text>
          </View>

          {/* Ajustes */}
          <Text style={styles.sectionTitle}>{t('about.settings_title')}</Text>
          <Text style={styles.paragraph}>{t('about.settings_text')}</Text>

          {/* Estadísticas */}
          <Text style={styles.sectionTitle}>{t('about.statistics_title')}</Text>
          <Text style={styles.paragraph}>{t('about.statistics_text')}</Text>

          {/* Versión */}
          <Text style={styles.sectionTitle}>{t('about.version_title')}</Text>
          <Text style={styles.paragraph}>{t('about.version_text')}</Text>

          {/* Autor */}
          <Text style={styles.sectionTitle}>{t('about.author_title')}</Text>
          <Text style={styles.paragraph}>{t('about.author_text')}</Text>

          {/* Contacto */}
          <Text style={styles.sectionTitle}>{t('about.contact_title')}</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(`mailto:${t('about.contact_email')}`)}
          >
            {t('about.contact_email')}
          </Text>

          {/* Futuros trabajos */}
          <Text style={styles.sectionTitle}>{t('about.future_title')}</Text>
          <View style={styles.listContainer}>
            {t('about.future_list', { returnObjects: true }).map((item, i) => (
              <Text key={i} style={styles.listItem}>• {item}</Text>
            ))}
          </View>
        </ScrollView>
      </View>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,            
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    color: '#CDF8FA',
    fontWeight: 'bold',
    marginTop: 20,
  },
  paragraph: {
    fontSize: 16,
    color: '#CDF8FA',
    marginTop: 8,
    lineHeight: 22,
  },
  listContainer: {
    marginTop: 8,
    paddingLeft: 12,
  },
  listItem: {
    fontSize: 16,
    color: '#CDF8FA',
    marginVertical: 4,
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    color: '#1e90ff',
    marginTop: 8,
  },
});

export default AboutScreen;
