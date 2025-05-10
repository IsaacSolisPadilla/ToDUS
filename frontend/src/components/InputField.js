import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  ScrollView
} from 'react-native';

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  editable = true,
  multiline = false,
  maxLines = 5,
}) => {
  const [inputHeight, setInputHeight] = useState(null);

  // Si es de solo lectura y multiline, renderizamos ScrollView + Text
  if (!editable && multiline) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <ScrollView
          style={[
            styles.input,
            {
              maxHeight: 20 * maxLines * 1.5,
            },
          ]}
        >
          <Text style={styles.readOnlyText}>
            {value || placeholder}
          </Text>
        </ScrollView>
      </View>
    );
  }

  // En el resto de casos, TextInput normal
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && {
            minHeight: 20 * 1.5,
            maxHeight: 20 * maxLines * 1.5,
            height: inputHeight,
          },
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        placeholderTextColor="#777"
        multiline={multiline}
        numberOfLines={multiline ? maxLines : 1}
        scrollEnabled={multiline}
        onContentSizeChange={event => {
          if (multiline) {
            const h = Math.min(
              event.nativeEvent.contentSize.height,
              20 * maxLines * 1.5
            );
            setInputHeight(h);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#CDF8FA',
    marginLeft: 4,
  },
  input: {
    width: 300,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#084F52',
    borderRadius: 8,
    backgroundColor: '#CDF8FA',
  },
  readOnlyText: {
    color: 'black',
    fontSize: 16,
    lineHeight: 20 * 1.5,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default InputField;
