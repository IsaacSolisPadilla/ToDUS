import { StyleSheet } from 'react-native';

const GeneralStyles = StyleSheet.create({
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#CDF8FA',
    marginBottom: 30,
    marginTop: 100,
    textAlign: 'center',
  },
  link: {
    color: '#CDF8FA',
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
  leftAction: {
    backgroundColor: '#328060',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  rightAction: {
    backgroundColor: '#C8494B',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
});

export default GeneralStyles;
