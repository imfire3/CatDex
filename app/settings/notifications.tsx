import { useEffect } from 'react';

import {
  IconFlag,
  IconFlame,
  IconSparkle,
  IconTrophy,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { useSettingsPrefsStore } from '@/store/settingsPrefs';

export default function NotificationsSettingsScreen() {
  const prefs = useSettingsPrefsStore((s) => s.prefs);
  const hydrated = useSettingsPrefsStore((s) => s.hydrated);
  const hydrate = useSettingsPrefsStore((s) => s.hydrate);
  const setPref = useSettingsPrefsStore((s) => s.setPref);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SettingsScreen
      title="Notifications"
      subtitle="Choisis les alertes que tu souhaites recevoir."
    >
      <SettingsSection title="Alertes">
        <SettingsRow
          kind="switch"
          icon={<IconSparkle />}
          title="Chats rares"
          subtitle="Quand un chat rare est repéré près de toi"
          value={prefs.notifRareCats}
          disabled={!hydrated}
          onValueChange={(v) => setPref('notifRareCats', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconFlag />}
          title="Missions"
          subtitle="Objectifs et rappels d’exploration"
          value={prefs.notifMissions}
          disabled={!hydrated}
          onValueChange={(v) => setPref('notifMissions', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconTrophy />}
          title="Badges"
          subtitle="Quand tu débloques un trophée"
          value={prefs.notifBadges}
          disabled={!hydrated}
          onValueChange={(v) => setPref('notifBadges', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconFlame />}
          title="Série quotidienne"
          subtitle="Ne casse pas ta flamme"
          value={prefs.notifDailyStreak}
          disabled={!hydrated}
          showDivider={false}
          onValueChange={(v) => setPref('notifDailyStreak', v)}
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
