import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Trabajador } from "../../types";

const C = {
  maroon: "#800000",
  maroonDark: "#240000",
  gold: "#c4985a",
  white: "#ffffff",
  textGray: "#4b5563",
  lightBg: "#fdf8f6"
};

const styles = StyleSheet.create({
  page: {
    width: 153,
    height: 242,
    backgroundColor: C.lightBg,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
  },
  headerBg: {
    backgroundColor: C.maroon,
    height: 90,
    width: "100%",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
    paddingTop: 10,
    zIndex: 1
  },
  logoPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  logoText: {
    fontSize: 10,
    fontWeight: 700,
    color: C.maroonDark
  },
  institucion: {
    fontSize: 7,
    fontWeight: 600,
    color: C.white,
    letterSpacing: 0.5,
    textAlign: "center"
  },
  estado: {
    fontSize: 5,
    color: "#e8d5b0",
    textAlign: "center",
    marginTop: 1,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  photoWrapper: {
    marginTop: -25, // Pulls the avatar up to overlap the header cleanly
    alignSelf: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: C.gold,
    borderStyle: "solid",
    backgroundColor: C.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: 700,
    color: C.maroon,
    marginTop: 3 // visual centering fix for text inside circles
  },
  infoSection: {
    marginTop: 6,
    alignItems: "center",
    paddingHorizontal: 8
  },
  name: {
    fontSize: 10,
    fontWeight: 700,
    color: C.maroon,
    textAlign: "center",
    marginBottom: 2
  },
  cargo: {
    fontSize: 6.5,
    fontWeight: 600,
    color: C.gold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center"
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 6,
    alignSelf: "center"
  },
  idText: {
    fontSize: 6,
    color: C.textGray,
    fontWeight: 600
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 40,
    backgroundColor: C.maroonDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12
  },
  qrContainer: {
    width: 28,
    height: 28,
    backgroundColor: C.white,
    padding: 2,
    borderRadius: 2
  },
  qrImage: {
    width: "100%",
    height: "100%"
  },
  footerText: {
    fontSize: 5,
    color: C.gold,
    textAlign: "right",
    flex: 1,
    marginLeft: 4,
    lineHeight: 1.4
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
  const p = trabajador.Persona || {};
  
  // Soporta tanto la estructura anidada de la DB como la aplanada de la tabla
  const nombre = p.nombres || (trabajador as any).nombre || "";
  const apellido = p.apellidos || (trabajador as any).apellido || "";
  const cargo = trabajador.Cargo?.nombre_cargo || (trabajador as any).cargo || "TRABAJADOR";
  const idEmpleado = p.cedula || (trabajador as any).cedula || `ID-${trabajador.id_trabajador || 'X'}`;
  
  // URL for the photo (from backend) or fallback initials
  const urlFoto = trabajador.foto_url ? trabajador.foto_url : null;
  const iniciales = getInitiales(nombre.split(" ")[0], apellido.split(" ")[0]);
  
  // Free API for QR code generation
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(idEmpleado)}&color=800000`;

  return (
    <Document>
      <Page size={[153, 242]} style={styles.page}>
        
        {/* Background Header */}
        <View style={styles.headerBg}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.institucion}>MUSEO DE ARTES VISUALES</Text>
          <Text style={styles.estado}>Estado Táchira</Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoWrapper}>
          {urlFoto ? (
            <Image style={styles.photo} src={urlFoto} />
          ) : (
            <Text style={styles.fallbackText}>{iniciales}</Text>
          )}
        </View>

        {/* Worker Information */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{`${nombre.split(" ")[0]} ${apellido.split(" ")[0]}`.toUpperCase()}</Text>
          <Text style={styles.cargo}>{cargo}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.idText}>C.I: {idEmpleado}</Text>
        </View>

        {/* Footer with QR */}
        <View style={styles.footer}>
          <View style={styles.qrContainer}>
            <Image style={styles.qrImage} src={qrUrl} />
          </View>
          <View style={styles.footerText}>
            <Text>VÁLIDO</Text>
            <Text>2026 - 2027</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
