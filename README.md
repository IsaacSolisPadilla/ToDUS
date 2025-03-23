eas build --platform android --profile preview
adb logcat *:E
adb uninstall com.isasolpad.frontend
adb logcat | Select-String -Pattern "com.isasolpad.frontend" > filtered_logcat_output.txt
adb logcat > logcat_output.txt
npm cache clean --force
npx expo prebuild
expo eject
npx expo-doctor
eas build 
eas build:configure
