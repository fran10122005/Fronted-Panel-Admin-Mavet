# Manual Operativo: Recepción y Auto-Registro QR

Este manual sirve como guía de referencia rápida para recordar cómo opera el módulo de recepción y el sistema público de códigos QR del MAVET.

## 1. El Portal de Auto-Registro (Público)

- **Ruta de Acceso:** `http://tudominio.com/registro-visitante`
- **Propósito:** Permite a los visitantes individuales registrar su propio ingreso sin hacer fila en el mostrador.
- **Funcionamiento:** 
  1. El usuario escanea el código QR que está impreso en la entrada.
  2. Ingresa su cédula. El sistema verifica rápidamente si existe.
  3. Si es nuevo, llena sus datos básicos.
  4. Selecciona el **Motivo de Visita** (o el **Evento/Taller** al que asiste).
  5. Se registra. Automáticamente aparecerá en las estadísticas del museo y en el panel de la recepcionista.
- **Limitaciones de Seguridad:** Desde este portal NO se pueden registrar grupos, instituciones ni acompañantes múltiples. Está diseñado exclusivamente para individuos y familias pequeñas que se registran uno por uno.

## 2. Generación del Código QR Físico

Si el cartel impreso con el código QR de la entrada se rompe o se pierde, no necesitas un programa externo para crear uno nuevo:
1. Inicia sesión en el Panel de Administración de MAVET.
2. Ve a la pestaña **Recepción**.
3. En la esquina superior derecha, haz clic en el botón **"🖨️ Generar QR Público"**.
4. Haz clic en **Imprimir QR** para enviarlo directo a la impresora.

## 3. Selección Inteligente de Motivos

Tanto en la pantalla de la recepcionista como en el teléfono del visitante, la lista de opciones para "Motivo" es dinámica:
- **Motivos Generales:** Biblioteca, Visita General, etc.
- **Eventos y Talleres de Hoy:** Si en el módulo de *Educación* agendaste un taller para el día de hoy, este aparecerá automáticamente en la lista de opciones.
- *Beneficio Estadístico:* Si un usuario selecciona un evento específico, el sistema guarda internamente el `id_taller` exacto, lo que te permitirá saber en el futuro cuánta gente exacta vino a ese evento.

## 4. Visitas Institucionales y Grupos

> [!IMPORTANT]
> **Regla de Oro de Recepción:** Las escuelas, grupos grandes o excursiones **NUNCA** deben usar el Código QR. 

Cuando llegue un grupo de 30 niños:
1. La recepcionista busca o registra únicamente a la profesora/representante.
2. Selecciona la casilla **"Es Visita Institucional / Grupal"**.
3. Escribe el número total de niños (ej: 30).
4. El sistema contará 31 ingresos (La maestra + 30 acompañantes) en un solo clic, sin colapsar el mostrador.

## 5. Menores de Edad (Sin Cédula)

Si llega un menor de edad (menos de 9 años) sin cédula propia:
1. La recepcionista registra primero a su representante (Madre/Padre/Tutor).
2. Hace clic en el botón verde **"Registrar Menor Acompañante"**.
3. El sistema creará un código interno único para el niño y los vinculará. Las próximas veces que vengan, la recepcionista solo tiene que buscar a la madre, y debajo de su perfil aparecerá el botón de "Ingreso rápido" para sus hijos.
