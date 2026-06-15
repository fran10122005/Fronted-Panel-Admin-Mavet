import React, { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";

export default function Talleres() {
  const [talleres, setTalleres] = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);

  const { isOpen: isOpenTaller, openModal: openTaller, closeModal: closeTaller } = useModal();

  const [formData, setFormData] = useState({
    tallerId: "",
    alumnoNombre: "",
    alumnoEdad: "",
    repNombre: "",
    repCedula: "",
    repTelefono: ""
  });

  const [tallerForm, setTallerForm] = useState({
    nombre_curso: "",
    id_instructor: 0,
    id_espacio: 0,
    sesiones: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    horas_totales: 0,
    cupo_minimo: 0,
    cupo_maximo: 0,
    estado: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });

  const edadNum = parseInt(formData.alumnoEdad, 10);
  const esMenor = !isNaN(edadNum) && edadNum < 18;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [talleresData, inscripcionesData, instrData, espData] = await Promise.all([
        mavetApi.getTalleres(),
        mavetApi.getInscripcionesTaller(),
        mavetApi.getInstructores(),
        mavetApi.getEspaciosMuseo()
      ]);
      setTalleres(talleresData);
      setInscripciones(inscripcionesData);
      setInstructores(instrData);
      setEspacios(espData);
      if (talleresData.length > 0) {
        setFormData(prev => ({ ...prev, tallerId: talleresData[0].id_taller }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTallerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ["id_instructor", "id_espacio", "sesiones", "horas_totales", "cupo_minimo", "cupo_maximo"];
    setTallerForm({
      ...tallerForm,
      [name]: numFields.includes(name) ? Number(value) : value
    });
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  const handleSubmitInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esMenor && (!formData.repNombre || !formData.repCedula)) {
      showAlert("Los menores de edad requieren nombre y cédula del representante.", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      const payload: any = {
        tallerId: formData.tallerId,
        alumno: { nombre: formData.alumnoNombre, edad: formData.alumnoEdad }
      };
      if (esMenor) {
        payload.representante = {
          nombre: formData.repNombre,
          cedula: formData.repCedula,
          telefono: formData.repTelefono
        };
      }
      const response = await mavetApi.inscribirTaller(payload);

      showAlert(response.message, 'success');
      setFormData({ tallerId: formData.tallerId, alumnoNombre: "", alumnoEdad: "", repNombre: "", repCedula: "", repTelefono: "" });

      const inscripcionesData = await mavetApi.getInscripcionesTaller();
      setInscripciones(inscripcionesData);
    } catch (error: any) {
      showAlert(error.message || "Ocurrió un error al inscribir al alumno.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTaller = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await mavetApi.crearTaller(tallerForm);
      showAlert("Taller creado correctamente.", "success");
      closeTaller();
      const talleresData = await mavetApi.getTalleres();
      setTalleres(talleresData);
      setTallerForm({
        nombre_curso: "", id_instructor: 0, id_espacio: 0, sesiones: "",
        fecha: "", hora_inicio: "", hora_fin: "", horas_totales: 0,
        cupo_minimo: 0, cupo_maximo: 0, estado: true
      });
    } catch (error: any) {
      showAlert(error.message || "Error al crear taller.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50";
  const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

  return (
    <div className="space-y-6 relative">
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${alertInfo.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="font-semibold text-sm">{alertInfo.type === 'success' ? '✅' : '⚠️'} {alertInfo.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Talleres</h1>
          <p className="text-sm text-gray-500">Administración de programas y matrículas.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openTaller}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors"
          >
            + Crear Nuevo Taller
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitInscripcion}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ComponentCard title="Selección de Taller">
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Taller o Curso</label>
                <select name="tallerId" value={formData.tallerId} onChange={handleChange}
                  disabled={isSubmitting || talleres.length === 0}
                  className={inputCls} required>
                  {talleres.length === 0 && <option value="">Cargando talleres...</option>}
                  {talleres.map(t => (
                    <option key={t.id_taller} value={t.id_taller}>{t.nombre_curso}</option>
                  ))}
                </select>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Datos del Alumno">
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Nombre Completo</label>
                <input type="text" name="alumnoNombre" value={formData.alumnoNombre} onChange={handleChange}
                  disabled={isSubmitting} placeholder="Ej. Carlos Mendoza" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Edad</label>
                <input type="number" name="alumnoEdad" value={formData.alumnoEdad} onChange={handleChange}
                  disabled={isSubmitting} placeholder="Ej. 12" className={inputCls} required />
                {formData.alumnoEdad && !esMenor && (
                  <p className="text-xs text-green-600 mt-1">Mayor de edad — no requiere representante.</p>
                )}
                {esMenor && (
                  <p className="text-xs text-amber-600 mt-1">Menor de edad — se requieren datos del representante.</p>
                )}
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Datos del Representante">
            <div className="space-y-4">
              {!formData.alumnoEdad ? (
                <p className="text-sm text-gray-400 italic">Ingresa la edad del alumno para determinar si requiere representante.</p>
              ) : !esMenor ? (
                <p className="text-sm text-green-600 font-medium">Alumno mayor de edad — no requiere representante.</p>
              ) : (
                <>
                  <div>
                    <label className={labelCls}>Nombre del Representante</label>
                    <input type="text" name="repNombre" value={formData.repNombre} onChange={handleChange}
                      disabled={isSubmitting} placeholder="Ej. Ana Mendoza" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Cédula</label>
                    <input type="text" name="repCedula" value={formData.repCedula} onChange={handleChange}
                      disabled={isSubmitting} placeholder="Ej. V-12345678" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Teléfono</label>
                    <input type="text" name="repTelefono" value={formData.repTelefono} onChange={handleChange}
                      disabled={isSubmitting} placeholder="Ej. 0414-1234567" className={inputCls} required />
                  </div>
                </>
              )}
            </div>
          </ComponentCard>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={isSubmitting}
            className="flex items-center justify-center min-w-[180px] bg-brand-500 text-white font-medium py-3 px-8 rounded-lg shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-70 disabled:cursor-wait">
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Inscribir Alumno"
            )}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <ComponentCard title="Alumnos Inscritos Recientemente">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Alumno</th>
                  <th scope="col" className="px-6 py-3">Taller</th>
                  <th scope="col" className="px-6 py-3">Representante</th>
                  <th scope="col" className="px-6 py-3">Fecha</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {inscripciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay alumnos inscritos aún.</td>
                  </tr>
                ) : (
                  inscripciones.map((ins, index) => (
                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {ins.Alumno ? `${ins.Alumno.nombres || ""} ${ins.Alumno.apellidos || ""}`.trim() : "Desconocido"}
                      </td>
                      <td className="px-6 py-4">
                        {ins.Taller ? ins.Taller.nombre_curso : `Taller #${ins.id_taller}`}
                      </td>
                      <td className="px-6 py-4">
                        {ins.Representante ? `${ins.Representante.nombres || ""} ${ins.Representante.apellidos || ""}`.trim() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                          {ins.estado_inscripcion || "Activo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>

      {/* Modal: Crear Nuevo Taller */}
      <Modal isOpen={isOpenTaller} onClose={closeTaller} className="max-w-[550px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Crear Nuevo Taller</h3>
          <form onSubmit={handleSubmitTaller} className="space-y-3">
            <div>
              <label className={labelCls}>Nombre del Curso / Taller</label>
              <input type="text" name="nombre_curso" value={tallerForm.nombre_curso} onChange={handleTallerFormChange}
                className={inputCls} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Instructor</label>
                <select name="id_instructor" value={tallerForm.id_instructor} onChange={handleTallerFormChange} className={inputCls}>
                  <option value={0}>Seleccione...</option>
                  {instructores.map(i => (
                    <option key={i.id_instructor} value={i.id_instructor}>
                      {i.Persona ? `${i.Persona.nombres} ${i.Persona.apellidos}` : `Instructor #${i.id_instructor}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Espacio / Sala</label>
                <select name="id_espacio" value={tallerForm.id_espacio} onChange={handleTallerFormChange} className={inputCls}>
                  <option value={0}>Seleccione...</option>
                  {espacios.map(e => (
                    <option key={e.id_espacio} value={e.id_espacio}>{e.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Sesiones</label>
                <input type="number" name="sesiones" value={tallerForm.sesiones} onChange={handleTallerFormChange}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cupo Mínimo</label>
                <input type="number" name="cupo_minimo" value={tallerForm.cupo_minimo} onChange={handleTallerFormChange}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cupo Máximo</label>
                <input type="number" name="cupo_maximo" value={tallerForm.cupo_maximo} onChange={handleTallerFormChange}
                  className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Fecha del Taller</label>
              <input type="date" name="fecha" value={tallerForm.fecha} onChange={handleTallerFormChange} className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Hora Inicio</label>
                <input type="time" name="hora_inicio" value={tallerForm.hora_inicio} onChange={handleTallerFormChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hora Fin</label>
                <input type="time" name="hora_fin" value={tallerForm.hora_fin} onChange={handleTallerFormChange} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Horas Totales</label>
                <input type="number" name="horas_totales" value={tallerForm.horas_totales} onChange={handleTallerFormChange}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select name="estado" value={tallerForm.estado ? "true" : "false"}
                  onChange={(e) => setTallerForm({ ...tallerForm, estado: e.target.value === "true" })} className={inputCls}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
              <button type="button" onClick={closeTaller} disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting || !tallerForm.nombre_curso}
                className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "Crear Taller"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
