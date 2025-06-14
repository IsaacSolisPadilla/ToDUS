import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity,
  InputAccessoryView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import GeneralTemplate from '../components/GeneralTemplate';
import { BASE_URL } from '../config';
import GeneralStyles from '../styles/GeneralStyles';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import LoadingOverlay from '../components/LoadingOverlay';
import logo from '../../assets/icono.png';
import { ScrollView } from 'react-native-gesture-handler';

const COLORS = [
  { name: 'BLUE',   hex: '#557F8F' },
  { name: 'YELLOW', hex: '#EDED04' },
  { name: 'PINK',   hex: '#FF174E' },
  { name: 'PURPLE', hex: '#8A548A' },
  { name: 'RED',    hex: '#D30A00' },
  { name: 'ORANGE', hex: '#FF8104' },
  { name: 'BLACK',  hex: '#000000' },
  { name: 'WHITE',  hex: '#FFFFFF' },
];

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  

  const [categorySettings, setCategorySettings] = useState([]);
  const [trashRetentionDays, setTrashRetentionDays] = useState('7');
  const [prioritiesList, setPrioritiesList] = useState([]);
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState(COLORS[0].hex);
  const [editingPriority, setEditingPriority] = useState(null);
  const swipeableRefs = useRef({});

  const [rules, setRules] = useState([]);
  const [fromId, setFromId] = useState(null);
  const [daysThreshold, setDaysThreshold] = useState('3');
  const [toId, setToId] = useState(null);

  const [notifyOnPriorityChange, setNotifyOnPriorityChange] = useState(false);
  const [notifyDueReminders, setNotifyDueReminders]         = useState(false);
  const [dueReminderDays, setDueReminderDays]               = useState('1');
  const accessoryID = 'daysAccessory';

  const [lang, setLang] = useState(i18n.language);
  const [loading, setLoading] = useState(true);

  const changeLanguage = async newLang => {
    await i18n.changeLanguage(newLang);
    setLang(newLang);
    await AsyncStorage.setItem('appLanguage', newLang);
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await axios.get(`${BASE_URL}/api/categories/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cats = await Promise.all(resp.data.map(async c => {
        const s = await AsyncStorage.getItem(`showCategory_${c.id}`);
        return { ...c, show: s === 'true' };
      }));
      setCategorySettings(cats);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudieron cargar categorías');
    }
  };
  const toggleCategoryOption = async (id, val) => {
    await AsyncStorage.setItem(`showCategory_${id}`, val.toString());
    setCategorySettings(cs =>
      cs.map(c => c.id === id ? { ...c, show: val } : c)
    );
  };

  const fetchTrashRetention = async () => {
    const s = await AsyncStorage.getItem('trashRetentionDays');
    if (s) setTrashRetentionDays(s);
  };
  const saveTrashRetention = async v => {
    const n = parseInt(v,10);
    if (isNaN(n)||n<1) return Alert.alert('Error','Introduce un número válido (>=1)');
    await AsyncStorage.setItem('trashRetentionDays', n.toString());
    setTrashRetentionDays(n.toString());
    Alert.alert('Guardado', `Eliminar tras ${n} días`);
  };

  const fetchPriorities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await axios.get(`${BASE_URL}/api/priorities/by-user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrioritiesList(resp.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudieron obtener prioridades');
    }
  };

  const createPriority = async () => {
    if (!newPriorityName.trim()) return Alert.alert('Error','Nombre requerido');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/priorities/create`,
        { name: newPriorityName, color: newPriorityColor },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      setNewPriorityName('');
      setNewPriorityColor(COLORS[0].hex);
      fetchPriorities();
    } catch (e) {
      console.error(e);
      Alert.alert('Error','No se creó prioridad');
    }
  };

  const updatePriority = async () => {
    if (!newPriorityName.trim()) return Alert.alert('Error','Nombre requerido');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/priorities/update/${editingPriority.id}`,
        { name: newPriorityName, color: newPriorityColor },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      setEditingPriority(null);
      setNewPriorityName('');
      setNewPriorityColor(COLORS[0].hex);
      fetchPriorities();
    } catch (e) {
      console.error(e);
      Alert.alert('Error','No se actualizó prioridad');
    }
  };

  const canDeletePriority = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await axios.get(`${BASE_URL}/api/tasks/list`, {
        headers:{ Authorization:`Bearer ${token}` }
      });
      return !resp.data.some(t=>t.priority?.id===id);
    } catch {
      return false;
    }
  };

  const deletePriority = async id => {
    if (!(await canDeletePriority(id))) {
      return Alert.alert('Error',t('settings.cannotDeletePriority'));
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/priorities/delete/${id}`, {
        headers:{ Authorization:`Bearer ${token}` }
      });
      fetchPriorities();
    } catch (e) {
      console.error(e);
      Alert.alert('Error','No se eliminó prioridad');
    }
  };

  const fetchRules = async () => {
    const s = await AsyncStorage.getItem('priorityRules');
    if (s) setRules(JSON.parse(s));
  };

  const saveRules = async rs => {
    await AsyncStorage.setItem('priorityRules', JSON.stringify(rs));
    setRules(rs);
  };

  const addRule = () => {
    if (!fromId || !toId) return Alert.alert('Selecciona prioridades');
    const n = parseInt(daysThreshold,10);
    if (isNaN(n)||n<1) return Alert.alert('Días inválidos');
    saveRules([...rules,{ fromId, days:n, toId }]);
    setFromId(null); setToId(null); setDaysThreshold('3');
  };

  const deleteRule = idx => saveRules(rules.filter((_,i)=>i!==idx));

  const fetchNotificationSettings = async () => {
    const a = await AsyncStorage.getItem('notifyOnPriorityChange');
    const b = await AsyncStorage.getItem('notifyDueReminders');
    const c = await AsyncStorage.getItem('dueReminderDays');
    if (a !== null) setNotifyOnPriorityChange(a === 'true');
    if (b !== null) setNotifyDueReminders(b === 'true');
    if (c !== null) setDueReminderDays(c);
  };

  const saveNotificationSettings = async () => {
    await AsyncStorage.setItem('notifyOnPriorityChange', notifyOnPriorityChange.toString());
    await AsyncStorage.setItem('notifyDueReminders',    notifyDueReminders.toString());
    await AsyncStorage.setItem('dueReminderDays',        dueReminderDays);
    Alert.alert('Configuración de notificaciones guardada');
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        // intento cargar idioma guardado
        const savedLang = await AsyncStorage.getItem('appLanguage');
        if (savedLang && savedLang !== i18n.language) {
          await i18n.changeLanguage(savedLang);
          setLang(savedLang);
        }
        // fetch de datos
        await fetchCategories();
        await fetchTrashRetention();
        await fetchPriorities();
        await fetchRules();
        await fetchNotificationSettings();
      } catch (err) {
        console.error(err);
        Alert.alert(t('settings.error'), t('settings.loadError'));
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  if (loading) {
    return (
      <LoadingOverlay 
        visible 
        text={t('settings.loading')} 
        logoSource={logo}
      />
    );
  }

return (
  <GeneralTemplate>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ width: screenWidth * 0.9 }}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            justifyContent: 'flex-start'
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={GeneralStyles.title}>{t('settings.title')}</Text>
          <Text style={styles.subheader}>
            {t('settings.subtitle')}
          </Text>

          {/* --- Retención de papelera --- */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>{t('settings.trashRetentionLabel')}</Text>
            <TextInput
              style={styles.numberInput}
              value={trashRetentionDays}
              onChangeText={setTrashRetentionDays}
              keyboardType="number-pad"
              onEndEditing={() => saveTrashRetention(trashRetentionDays)}
              returnKeyType="done"
              inputAccessoryViewID={accessoryID}
            />
            <InputAccessoryView nativeID={accessoryID}>
              <TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneBtn}>
                <Text style={styles.doneTxt}>Done</Text>
              </TouchableOpacity>
            </InputAccessoryView>
          </View>

          {/* --- Mostrar categorías --- */}
          <Text style={[GeneralStyles.title, { marginTop: 30 }]}>
            {t('settings.showCategories')}
          </Text>
          <View style={styles.optionsContainer}>
            {categorySettings.map(cat => (
              <View key={cat.id} style={styles.optionRow}>
                <Text style={styles.optionLabel}>{cat.name}</Text>
                <Switch
                  value={cat.show}
                  onValueChange={v => toggleCategoryOption(cat.id, v)}
                  thumbColor={'#084F52'}
                  trackColor={{ false: '#ccc', true: '#16CDD6' }}
                />
              </View>
            ))}
          </View>

          {/* --- Gestión de Prioridades --- */}
          <Text style={GeneralStyles.title}>{t('settings.prioritiesManagement')}</Text>
          <View style={styles.prioritiesSection}>
            {prioritiesList.map(p => (
              <Swipeable
                key={p.id}
                ref={ref => (swipeableRefs.current[p.id] = ref)}
                renderLeftActions={() => (
                  <View style={GeneralStyles.leftAction}>
                    <Text style={styles.actionText}>{t('settings.editPriority')}</Text>
                  </View>
                )}
                renderRightActions={() => (
                  <View style={GeneralStyles.rightAction}>
                    <Text style={styles.actionText}>{t('settings.deletePriority')}</Text>
                  </View>
                )}
                onSwipeableOpen={dir => {
                  swipeableRefs.current[p.id]?.close();
                  if (dir === 'left') {
                    setEditingPriority(p);
                    setNewPriorityName(p.name);
                    setNewPriorityColor(p.colorHex);
                  } else {
                    deletePriority(p.id);
                  }
                }}
              >
                <View style={styles.priorityRow}>
                  <View style={[styles.priorityColorBox, { backgroundColor: p.colorHex }]} />
                  <Text style={styles.priorityName}>{p.name}</Text>
                </View>
              </Swipeable>
            ))}

            <View style={styles.newPriorityContainer}>
              <TextInput
                placeholder={t('settings.namePriority')}
                style={styles.newPriorityInput}
                value={newPriorityName}
                onChangeText={setNewPriorityName}
              />
              <View style={styles.colorsContainer}>
                {COLORS.map(c => (
                  <TouchableOpacity
                    key={c.name}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c.hex },
                      newPriorityColor === c.hex && styles.colorSelected
                    ]}
                    onPress={() => setNewPriorityColor(c.hex)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.savePriorityButton}
                onPress={editingPriority ? updatePriority : createPriority}
              >
                <Text style={styles.savePriorityButtonText}>
                  {editingPriority
                    ? t('settings.updatePriority')
                    : t('settings.createPriority')}
                </Text>
              </TouchableOpacity>
              {editingPriority && (
                <TouchableOpacity
                  style={styles.cancelEditButton}
                  onPress={() => {
                    setEditingPriority(null);
                    setNewPriorityName('');
                    setNewPriorityColor(COLORS[0].hex);
                  }}
                >
                  <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* --- Reglas auto-prioridad --- */}
          <Text style={[GeneralStyles.title, { marginTop: 30 }]}>
            {t('settings.autoPriorityRules')}
          </Text>
          {rules.map((r, i) => (
            <View key={i} style={styles.ruleRow}>
              <Text style={styles.ruleText}>
                {t('settings.if')} "{prioritiesList.find(x => x.id === r.fromId)?.name}"{' '}
                {t('settings.and')} ≤{r.days}d → "{prioritiesList.find(x => x.id === r.toId)?.name}"
              </Text>
              <TouchableOpacity onPress={() => deleteRule(i)}>
                <Text style={styles.deleteRule}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.ruleForm}>
            <Text style={styles.optionLabel}>{t('settings.from')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {prioritiesList.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityBubble,
                    fromId === p.id && styles.bubbleSelected
                  ]}
                  onPress={() => setFromId(p.id)}
                >
                  <Text style={{ color: p.colorHex }}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.optionLabel, { marginTop: 8 }]}>{t('settings.days')} ≤</Text>
            <TextInput
              style={[styles.numberInput, { marginBottom: 8 }]}
              value={daysThreshold}
              onChangeText={setDaysThreshold}
              keyboardType="number-pad"
              returnKeyType="done"
              inputAccessoryViewID={accessoryID}
            />

            <Text style={styles.optionLabel}>{t('settings.to')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {prioritiesList.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityBubble,
                    toId === p.id && styles.bubbleSelected
                  ]}
                  onPress={() => setToId(p.id)}
                >
                  <Text style={{ color: p.colorHex }}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.addRuleBtn} onPress={addRule}>
              <Text style={styles.addRuleTxt}>{t('settings.addRule')}</Text>
            </TouchableOpacity>
          </View>

          {/* --- Notificaciones --- */}
          <Text style={[GeneralStyles.title, { marginTop: 30 }]}>{t('settings.notifications')}</Text>
          <View style={styles.optionGroup}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>{t('settings.notificationsLabel1')}</Text>
              <Switch
                value={notifyOnPriorityChange}
                onValueChange={setNotifyOnPriorityChange}
                thumbColor="#084F52"
                trackColor={{ false: '#ccc', true: '#16CDD6' }}
              />
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>{t('settings.notificationsLabel2')}</Text>
              <Switch
                value={notifyDueReminders}
                onValueChange={setNotifyDueReminders}
                thumbColor="#084F52"
                trackColor={{ false: '#ccc', true: '#16CDD6' }}
              />
            </View>
            {notifyDueReminders && (
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>{t('settings.notificationsLabel2')}</Text>
                <TextInput
                  style={[styles.numberInput, { width: 60 }]}
                  keyboardType="number-pad"
                  value={dueReminderDays}
                  onChangeText={setDueReminderDays}
                  onEndEditing={saveNotificationSettings}
                  returnKeyType="done"
                />
              </View>
            )}
            <TouchableOpacity style={styles.saveNotifButton} onPress={saveNotificationSettings}>
              <Text style={styles.saveNotifButtonText}>{t('settings.saveNotifications')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[GeneralStyles.title, { marginTop: 30 }]}>{t('settings.language')}</Text>
          <View style={[styles.optionGroup, { paddingVertical: 8 }]}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={lang}
                onValueChange={value => changeLanguage(value)}
                mode="dropdown"
              >
                <Picker.Item label={t('idioms.es')} value="es" />
                <Picker.Item label={t('idioms.en')} value="en" />
                <Picker.Item label={t('idioms.fr')} value="fr" />
                <Picker.Item label={t('idioms.de')} value="de" />
                <Picker.Item label={t('idioms.zh')} value="zh" />
              </Picker>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center'
  },
  subheader: {
    fontSize: 16,
    color: '#CDF8FA',
    textAlign: 'center',
    marginBottom: 20
  },
  optionGroup: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#CDF8FA',
    borderRadius: 8
  },
  optionLabel: {
    fontSize: 16,
    color: '#084F52',
    marginBottom: 8
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#084F52',
    width: 80,
    textAlign: 'center',
    marginBottom: 10,
  },
  optionsContainer: {
    paddingBottom: 30
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#CDF8FA',
    borderRadius: 8,
    marginBottom: 10
  },
  prioritiesSection: {
    marginTop: 20
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDF8FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 5
  },
  priorityColorBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10
  },
  priorityName: {
    fontSize: 16,
    color: '#084F52'
  },
  leftAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8
  },
  rightAction: {
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    flex: 1,
    borderRadius: 8
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold'
  },
  newPriorityContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#CDF8FA',
    borderRadius: 8
  },
  newPriorityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#084F52'
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  colorSelected: {
    borderColor: '#000',
    borderWidth: 2
  },
  savePriorityButton: {
    backgroundColor: '#084F52',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  savePriorityButtonText: {
    color: '#fff',
    fontSize: 16
  },
  cancelEditButton: {
    alignItems: 'center',
    paddingVertical: 6
  },
  cancelEditButtonText: {
    color: '#FF4C4C',
    fontSize: 16
  },

  // Reglas auto‑prioridad
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDF8FA',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6
  },
  ruleText: {
    flex: 1,
    color: '#084F52'
  },
  deleteRule: {
    fontSize: 18,
    marginLeft: 8
  },
  ruleForm: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#CDF8FA',
    borderRadius: 8
  },
  priorityBubble: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8
  },
  bubbleSelected: {
    borderColor: '#084F52',
    backgroundColor: '#E0F7F9'
  },
  doneBtn: {
    backgroundColor: '#084F52',
    padding: 6,
    alignItems: 'center'
  },
  doneTxt: {
    color: 'white',
    fontWeight: 'bold'
  },
  addRuleBtn: {
    marginTop: 12,
    backgroundColor: '#084F52',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  addRuleTxt: {
    color: 'white',
    fontWeight: 'bold'
  },

  // Notificaciones
  saveNotifButton: {
    backgroundColor: '#084F52',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  saveNotifButtonText: {
    color: '#fff',
    fontSize: 16
  }
});

export default SettingsScreen;
