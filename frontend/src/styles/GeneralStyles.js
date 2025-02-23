import { StyleSheet } from 'react-native';

const GeneralStyles = StyleSheet.create({
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    marginTop: 100,
  },
  link: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 30,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
});

export default GeneralStyles;
