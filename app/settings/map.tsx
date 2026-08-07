import { useEffect } from 'react';

import {
  IconEye,
  IconSparkle,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { useSettingsPrefsStore } from '@/store/settingsPrefs';

export default function MapSettingsScreen() {
  const prefs = useSettingsPrefsStore((s) => s.prefs);
  const hydrated = useSettingsPrefsStore((s) => s.hydrated);
  const hydrate = useSettingsPrefsStore((s) => s.hydrate);
  const setPref = useSettingsPrefsStore((s) => s.setPref);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SettingsScreen
      title="Carte"
      subtitle="Personnalise les chats affichés sur la carte."
    >
      <SettingsSection title="Affichage">
        <SettingsRow
          kind="switch"
          icon={<IconEye />}
          title="Afficher les chats déjà découverts"
          subtitle="Tes captures restent visibles sur la carte"
          value={prefs.mapShowDiscovered}
          disabled={!hydrated}
          onValueChange={(v) => setPref('mapShowDiscovered', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconSparkle />}
          title="Afficher les chats rares"
          subtitle="Pins et alertes de rareté"
          value={prefs.mapShowRare}
          disabled={!hydrated}
          showDivider={false}
          onValueChange={(v) => setPref('mapShowRare', v)}
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
