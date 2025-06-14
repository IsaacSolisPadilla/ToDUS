import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';


const CustomModal = ({ 
  visible, 
  title, 
  children, 
  onConfirm, 
  onCancel, 
  showConfirm = true, // Prop para mostrar u ocultar el botón "Confirmar"
  showCancel = true, // Prop para mostrar u ocultar el botón "Cancelar"
  modalWidth = '80%' // Prop para personalizar el ancho del modal
  
}) => {
  const { t } = useTranslation();

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { width: modalWidth }]}>
          {title && <Text style={styles.modalTitle}>{title}</Text>}

          {/* Contenido dinámico del modal */}
          <View style={styles.contentContainer}>{children}</View>

          {/* Botón Confirmar y, opcionalmente, el botón Cancelar */}
          <View style={styles.buttonContainer}>
            {showConfirm && (
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Text style={styles.buttonText}>{t('modal.confirm')}</Text>
              </TouchableOpacity>
            )}
            {showCancel && (
              <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                <Text style={styles.buttonText}>{t('modal.cancel')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro detrás del modal
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#CDF8FA', // Fondo del modal
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#084F52', // Color del texto
    marginBottom: 10,
  },
  contentContainer: {
    marginBottom: 15, // Espacio antes de los botones
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  confirmButton: {
    backgroundColor: '#16CDD6', // Color de Confirmar
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: '#C380FF', // Color de Cancelar
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '0C2527',
    fontWeight: 'bold',
  },
};

export default CustomModal;