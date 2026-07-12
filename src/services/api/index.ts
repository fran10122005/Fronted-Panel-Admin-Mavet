import { auth } from "./auth";
import { obras } from "./obras";
import { biblioteca } from "./biblioteca";
import { rrhh } from "./rrhh";
import { talleres } from "./talleres";
import { auditorio } from "./auditorio";
import { recepcion } from "./recepcion";
import { publico } from "./publico";
import { papelera } from "./papelera";
import { dashboard } from "./dashboard";

export { axiosInstance, API_BASE } from "./client";

export const mavetApi = {
  ...auth,
  ...obras,
  ...biblioteca,
  ...rrhh,
  ...talleres,
  ...auditorio,
  ...recepcion,
  ...publico,
  ...papelera,
  ...dashboard,
};
