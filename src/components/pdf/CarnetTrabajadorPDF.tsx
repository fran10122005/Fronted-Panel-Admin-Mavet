import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Trabajador } from "../../types";

const C = {
  maroon: "#800000",
  maroonDark: "#240000",
  gold: "#c4985a",
  goldLight: "#e8d5b0",
  white: "#ffffff",
  textGray: "#4b5563",
  textSoft: "#6b7280",
  lightBg: "#fdf8f6"
};

const styles = StyleSheet.create({
  page: {
    width: 153,
    height: 242,
    backgroundColor: C.lightBg,
    fontFamily: "Helvetica",
  },
  rootContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  borderFrame: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 145,
    height: 234,
    borderWidth: 1.2,
    borderColor: C.gold,
    borderRadius: 4,
  },
  watermarkImage: {
    position: "absolute",
    top: 76,
    left: 31.5,
    width: 90,
    height: 90,
    opacity: 0.06,
    objectFit: "contain",
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    height: 32,
  },
  logoImage: {
    width: 20,
    height: 20,
    objectFit: "contain",
  },
  headerTextContainer: {
    marginLeft: 6,
    justifyContent: "center",
  },
  institucion: {
    fontSize: 6.5,
    fontWeight: 700,
    color: C.maroon,
    letterSpacing: 0.3,
  },
  estado: {
    fontSize: 5,
    fontWeight: 600,
    color: C.gold,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerLine: {
    width: 133,
    height: 0.5,
    backgroundColor: C.gold,
    alignSelf: "center",
    marginTop: 4,
  },
  photoWrapper: {
    alignSelf: "center",
    marginTop: 8,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: C.gold,
    backgroundColor: C.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    // Sombra sutil
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
    objectFit: "cover"
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: 700,
    color: C.maroon
  },
  infoSection: {
    marginTop: 6,
    alignItems: "center",
    paddingHorizontal: 8
  },
  cargo: {
    fontSize: 6,
    fontWeight: 700,
    color: C.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  name: {
    fontSize: 10.5,
    fontWeight: 700,
    color: C.maroonDark,
    textAlign: "center",
    marginTop: 2
  },
  idText: {
    fontSize: 6.5,
    color: C.textGray,
    fontWeight: 600,
    letterSpacing: 0.3,
    marginTop: 2
  },
  qrContainer: {
    width: 58,
    height: 58,
    backgroundColor: C.white,
    padding: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.goldLight,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  qrImage: {
    width: "100%",
    height: "100%"
  },
  validityText: {
    fontSize: 6,
    color: C.textSoft,
    marginTop: 6,
    letterSpacing: 0.3,
    fontWeight: 500
  },
  footer: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 145,
    height: 18,
    backgroundColor: C.maroon,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  footerText: {
    fontSize: 6.5,
    color: C.white,
    fontWeight: 700,
    letterSpacing: 0.5,
    textAlign: "center"
  }
});

function getInitiales(nombre: string, apellido: string) {
  if (!nombre && !apellido) return "?";
  return ((nombre ? nombre.charAt(0) : "") + (apellido ? apellido.charAt(0) : "")).toUpperCase();
}

interface Props {
  trabajador: Trabajador;
}

export default function CarnetTrabajadorPDF({ trabajador }: Props) {
  const p = trabajador.Persona || { nombres: "", apellidos: "", cedula: "" };
  
  // Soporta tanto la estructura anidada de la DB como la aplanada de la tabla
  const nombre = p.nombres || (trabajador as any).nombre || "";
  const apellido = p.apellidos || (trabajador as any).apellido || "";
  const cargo = trabajador.Cargo?.nombre_cargo || (trabajador as any).cargo || "TRABAJADOR";
  const idEmpleado = p.cedula || (trabajador as any).cedula || `ID-${(trabajador as any).id_trabajador || trabajador.id || 'X'}`;
  
  // URL para la foto o iniciales de fallback
  const urlFoto = trabajador.foto_url ? trabajador.foto_url : null;
  const iniciales = getInitiales(nombre.split(" ")[0], apellido.split(" ")[0]);
  
  // API para generar el código QR centrado y en color granate usando qr_uuid por seguridad
  const qrData = (trabajador as any).qr_uuid || idEmpleado;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=800000`;

  return (
    <Document>
      <Page size={[153, 242]} style={styles.page}>
        <View style={styles.rootContainer}>
          
          {/* Marco dorado elegante */}
          <View style={styles.borderFrame} />
          
          {/* Marca de agua de fondo */}
          <Image style={styles.watermarkImage} src="/images/logo/mavet2.png" />
          
          {/* Membrete con Logo en la esquina */}
          <View style={styles.headerSection}>
            <Image style={styles.logoImage} src="/images/logo/mavet2.png" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.institucion}>MUSEO DE ARTES VISUALES</Text>
              <Text style={styles.estado}>ESTADO TÁCHIRA</Text>
            </View>
          </View>
          <View style={styles.headerLine} />

          {/* Foto de Perfil / Iniciales de Fallback (En flujo normal, sin cabecera) */}
          <View style={styles.photoWrapper}>
            {urlFoto ? (
              <Image style={styles.photo} src={urlFoto} />
            ) : (
              <Text style={styles.fallbackText}>{iniciales}</Text>
            )}
          </View>

          {/* Información del Trabajador y Código QR Centralizado */}
          <View style={styles.infoSection}>
            <Text style={styles.cargo}>{cargo}</Text>
            <Text style={styles.name}>{`${nombre.split(" ")[0]} ${apellido.split(" ")[0]}`.toUpperCase()}</Text>
            <Text style={styles.idText}>C.I: {idEmpleado}</Text>
            
            {/* Código QR Principal para Escaneo */}
            <View style={styles.qrContainer}>
              <Image style={styles.qrImage} src={qrUrl} />
            </View>
            
            <Text style={styles.validityText}>VÁLIDO 2026 - 2027</Text>
          </View>

          {/* Barra de Footer Sólida en la base */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>MUSEO DE ARTES VISUALES</Text>
          </View>

        </View>
      </Page>
    </Document>
  );
}
