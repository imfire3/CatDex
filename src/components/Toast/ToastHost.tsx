import { Toast } from './Toast';
import { useToastStore } from '@/store/toast';

export function ToastHost() {
  const visible = useToastStore((state) => state.visible);
  const title = useToastStore((state) => state.title);
  const description = useToastStore((state) => state.description);
  const tone = useToastStore((state) => state.tone);
  const hide = useToastStore((state) => state.hide);

  return (
    <Toast
      visible={visible}
      title={title}
      description={description}
      tone={tone}
      onDismiss={hide}
    />
  );
}
