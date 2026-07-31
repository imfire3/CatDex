import { create } from 'zustand';

export type ToastTone = 'default' | 'success' | 'warning' | 'danger';

type ToastPayload = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastState = {
  visible: boolean;
  title: string;
  description?: string;
  tone: ToastTone;
  show: (payload: ToastPayload) => void;
  hide: () => void;
};

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set, get) => ({
  visible: false,
  title: '',
  description: undefined,
  tone: 'default',
  show: ({ title, description, tone = 'default', durationMs = 3200 }) => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    set({ visible: true, title, description, tone });
    dismissTimer = setTimeout(() => {
      get().hide();
    }, durationMs);
  },
  hide: () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    set({ visible: false });
  },
}));
