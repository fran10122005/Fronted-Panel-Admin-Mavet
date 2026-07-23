import { useState } from "react";
import Talleres from "./Talleres";
import Auditorio from "./Auditorio";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/ui/Tabs";

export default function Educacion() {
  const [activeTab, setActiveTab] = useState<"talleres" | "auditorio">("talleres");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Módulo de Educación"
        subtitle="Gestión de talleres, cursos y reservas del auditorio."
      />

      <Tabs
        variant="underline"
        tabs={[
          { id: "talleres", label: "Talleres y Cursos" },
          { id: "auditorio", label: "Solicitudes de Auditorio" },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as "talleres" | "auditorio")}
      />

      <div className="mt-6">
        {activeTab === "talleres" && <Talleres />}
        {activeTab === "auditorio" && <Auditorio />}
      </div>
    </div>
  );
}
