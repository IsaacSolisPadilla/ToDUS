import { useTranslation } from 'react-i18next';

const SettingsScreen = () => {
  const { t } = useTranslation();

  return <Text>{t('settings.title')}</Text>;
};
