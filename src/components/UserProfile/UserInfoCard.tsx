import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { mavetApi } from "../../services/api";
import toast from "react-hot-toast";
import PasswordStrengthMeter from "../ui/PasswordStrengthMeter";
import PasswordRules from "../ui/PasswordRules";

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900";
const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

interface UserInfoCardProps {
  profile: any;
  onRefresh: () => void;
}

export default function UserInfoCard({ profile, onRefresh }: UserInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [activeTab, setActiveTab] = useState<"datos" | "seguridad">("datos");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo_personal: "",
    telefono: ""
  });

  const [passwordData, setPasswordData] = useState({
    password_actual: "",
    password_nuevo: "",
    password_confirmar: ""
  });

  useEffect(() => {
    if (profile && profile.Trabajador) {
      setFormData({
        nombres: profile.Trabajador.nombres || "",
        apellidos: profile.Trabajador.apellidos || "",
        correo_personal: profile.Trabajador.correo_personal || profile.correo || "",
        telefono: profile.Trabajador.telefono || ""
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await mavetApi.updateMe(formData);
      toast.success("Perfil actualizado exitosamente");
      onRefresh();
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.password_nuevo !== passwordData.password_confirmar) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordData.password_nuevo.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y carácter especial");
      return;
    }
    setIsSubmitting(true);
    try {
      await mavetApi.cambiarPassword({
        password_actual: passwordData.password_actual,
        password_nuevo: passwordData.password_nuevo
      });
      toast.success("Contraseña actualizada exitosamente");
      setPasswordData({ password_actual: "", password_nuevo: "", password_confirmar: "" });
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar la contraseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = profile?.Trabajador || {};

  const detailRow = (label: string, value: string) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-white/90">{value || "—"}</span>
    </div>
  );

  const tabBtn = (tab: "datos" | "seguridad", label: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab
          ? "bg-brand-500 text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">Información Personal</h4>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Editar
        </button>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {detailRow("Nombres", t.nombres)}
          {detailRow("Apellidos", t.apellidos)}
          {detailRow("Usuario", profile?.nombre_usuario)}
          {detailRow("Rol", profile?.Role?.nombre_rol || "Administrador")}
          {detailRow("Correo Institucional", profile?.correo)}
          {detailRow("Correo Personal", t.correo_personal)}
          {detailRow("Teléfono", t.telefono)}
          {detailRow("Cargo", t.cargo)}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Editar Perfil</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Administra tus datos, seguridad y foto de perfil.</p>

          <div className="flex gap-2 mb-5">
            {tabBtn("datos", "Datos Personales")}
            {tabBtn("seguridad", "Seguridad")}
          </div>

          {activeTab === "datos" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className={labelCls}>Nombres <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.nombres}
                    onChange={e => setFormData({...formData, nombres: e.target.value})}
                    className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Apellidos <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.apellidos}
                    onChange={e => setFormData({...formData, apellidos: e.target.value})}
                    className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Correo Electrónico Personal</label>
                  <input type="email" value={formData.correo_personal}
                    onChange={e => setFormData({...formData, correo_personal: e.target.value})}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="text" value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    className={inputCls} placeholder="0412-1234567" />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={closeModal} disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center min-w-[140px] px-5 py-2.5 sm:py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Guardar Cambios"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "seguridad" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={labelCls}>Contraseña Actual <span className="text-red-500">*</span></label>
                <input type="password" value={passwordData.password_actual}
                  onChange={e => setPasswordData({...passwordData, password_actual: e.target.value})}
                  className={inputCls} required placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nueva Contraseña <span className="text-red-500">*</span></label>
                  <input type="password" value={passwordData.password_nuevo}
                    onChange={e => setPasswordData({...passwordData, password_nuevo: e.target.value})}
                    className={inputCls} required minLength={8} placeholder="Mín. 8 caracteres" />
                  <PasswordStrengthMeter password={passwordData.password_nuevo} />
                  <PasswordRules password={passwordData.password_nuevo} />
                </div>
                <div>
                  <label className={labelCls}>Confirmar Contraseña <span className="text-red-500">*</span></label>
                  <input type="password" value={passwordData.password_confirmar}
                    onChange={e => setPasswordData({...passwordData, password_confirmar: e.target.value})}
                    className={inputCls} required minLength={8} placeholder="Repite la contraseña" />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={closeModal} disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center min-w-[160px] px-5 py-2.5 sm:py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Cambiar Contraseña"}
                </button>
              </div>
            </form>
          )}


        </div>
      </Modal>
    </div>
  );
}
