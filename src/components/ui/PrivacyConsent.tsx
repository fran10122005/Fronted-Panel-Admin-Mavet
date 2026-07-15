import { useState } from 'react';

interface PrivacyConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export default function PrivacyConsent({ checked, onChange, error }: PrivacyConsentProps) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      error
        ? 'border-error-300 bg-error-50/50 dark:border-error-700 dark:bg-error-950/20'
        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consentimiento_datos"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="consentimiento_datos" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
          He leído y acepto el{' '}
          <button
            type="button"
            onClick={() => setShowFull(!showFull)}
            className="text-brand-600 dark:text-brand-400 underline hover:text-brand-700 dark:hover:text-brand-300 font-medium"
          >
            Aviso de Privacidad
          </button>{' '}
          y consiento el tratamiento de mis datos personales conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP).
        </label>
      </div>

      {showFull && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-2 max-h-48 overflow-y-auto">
          <p className="font-semibold text-gray-700 dark:text-gray-300">AVISO DE PRIVACIDAD</p>
          <p>
            El Museo de Artes Visuales y Espacios del Táchira (MAVET), con domicilio en San Cristóbal, Estado Táchira, 
            es el responsable del tratamiento de sus datos personales.
          </p>
          <p>
            <strong>Datos recabados:</strong> nombres, apellidos, cédula de identidad, teléfono, fecha de nacimiento, 
            y datos de acompañantes menores.
          </p>
          <p>
            <strong>Finalidades:</strong> registro de ingreso, control de acceso, estadísticas de visitantes, 
            inscripción en talleres educativos y comunicaciones relacionadas con las actividades del museo.
          </p>
          <p>
            <strong>Derechos ARCO:</strong> Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y 
            Oposición enviando una solicitud a la dirección del MAVET.
          </p>
          <p>
            Los datos serán conservados durante el tiempo necesario para cumplir con las finalidades del tratamiento 
            y las obligaciones legales aplicables.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
}
