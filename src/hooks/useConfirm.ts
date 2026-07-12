import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    cancelLabel: "Cancelar",
    variant: "danger",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const requestConfirm = useCallback((options: ConfirmOptions) => {
    setState({
      open: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel || "Confirmar",
      cancelLabel: options.cancelLabel || "Cancelar",
      variant: options.variant || "danger",
      onConfirm: async () => {
        setState(prev => ({ ...prev, open: false }));
        await options.onConfirm();
      },
      onCancel: () => setState(prev => ({ ...prev, open: false })),
    });
  }, []);

  return { confirm: state, requestConfirm };
}
