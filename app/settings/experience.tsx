import { useEffect } from 'react';

import {
  IconSpark,
  IconSpeaker,
  IconVibrate,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { useSettingsPrefsStore } from '@/store/settingsPrefs';

export default function ExperienceSettingsScreen() {
  const prefs = useSettingsPrefsStore((s) => s.prefs);
  const hydrated = useSettingsPrefsStore((s) => s.hydrated);
  const hydrate = useSettingsPrefsStore((s) => s.hydrate);
  const setPref = useSettingsPrefsStore((s) => s.setPref);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SettingsScreen
      title="Expérience"
      subtitle="Sons, vibrations et animations pendant l’exploration."
    >
      <SettingsSection title="Feedback">
        <SettingsRow
          kind="switch"
          icon={<IconSpeaker />}
          title="Sons"
          subtitle="Captures, récompenses, interface"
          value={prefs.sounds}
          disabled={!hydrated}
          onValueChange={(v) => setPref('sounds', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconVibrate />}
          title="Vibrations"
          subtitle="Retours haptiques"
          value={prefs.haptics}
          disabled={!hydrated}
          onValueChange={(v) => setPref('haptics', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconSpark />}
          title="Animations"
          subtitle="Révélations et micro-mouvements"
          value={prefs.animations}
          disabled={!hydrated}
          showDivider={false}
          onValueChange={(v) => setPref('animations', v)}
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
