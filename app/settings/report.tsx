import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Image, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { SettingsScreen } from '@/components/Settings';
import { Text } from '@/components/Text';
import { openSupportMail, SUPPORT_EMAIL } from '@/lib/supportLinks';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

export default function ReportProblemScreen() {
  const { colors, spacing, radius, shadow } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handlePickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    const trimmedSubject = subject.trim();
    const trimmedBody = description.trim();
    if (!trimmedSubject || !trimmedBody) {
      showToast({
        title: 'Champs manquants',
        description: 'Ajoute un sujet et une description.',
        tone: 'danger',
      });
      return;
    }

    setSending(true);
    try {
      const note = screenshotUri
        ? `\n\n(Capture d’écran sélectionnée sur l’appareil — joins-la à ton e-mail si possible.)`
        : '';
      await Linking.openURL(
        openSupportMail(`Bug CatDex — ${trimmedSubject}`, `${trimmedBody}${note}`),
      );
      showToast({
        title: 'Merci',
        description: 'Ton message s’ouvre dans ton app mail.',
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Impossible d’ouvrir le mail',
        description: `Réessaie ou écris à ${SUPPORT_EMAIL}.`,
        tone: 'danger',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <SettingsScreen
      title="Signaler un problème"
      subtitle="Dis-nous ce qui coince — on lit tout."
      footer={
        <Button
          title="Envoyer"
          loading={sending}
          onPress={() => {
            void handleSend();
          }}
        />
      }
    >
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[16],
            gap: spacing[16],
          },
          shadow.low,
        ]}
      >
        <TextInput
          label="Sujet"
          value={subject}
          onChangeText={setSubject}
          placeholder="Ex. Crash au scan"
          maxLength={80}
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Que s’est-il passé ?"
          multiline
          numberOfLines={5}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <Button
          title={screenshotUri ? 'Changer la capture' : 'Ajouter une capture d’écran'}
          variant="secondary"
          onPress={() => {
            void handlePickScreenshot();
          }}
        />
        {screenshotUri ? (
          <Image
            source={{ uri: screenshotUri }}
            accessibilityLabel="Capture d’écran sélectionnée"
            style={{
              width: '100%',
              height: 160,
              borderRadius: radius.lg,
              backgroundColor: colors.surfaceSecondary,
            }}
            resizeMode="cover"
          />
        ) : null}
        <Text variant="caption" color="textMuted">
          L’envoi ouvre ton client mail. La capture reste sur ton appareil.
        </Text>
      </View>
    </SettingsScreen>
  );
}
