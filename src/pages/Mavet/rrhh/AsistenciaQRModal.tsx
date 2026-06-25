import { Modal } from "../../../components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AsistenciaQRModal({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-5">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Registro de Asistencia por QR
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Escanee el código QR para registrar su asistencia.
        </p>
      </div>
    </Modal>
  );
}
