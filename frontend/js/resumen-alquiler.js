// Verificar sesión
if (!localStorage.getItem('token')) window.location.href = '/';

const config = JSON.parse(localStorage.getItem('configAlquiler'));

document.addEventListener('DOMContentLoaded', () => {
    if (!config) {
        alert("No hay una configuración de alquiler activa.");
        window.location.href = 'combos.html';
        return;
    }
    if(document.getElementById('fechaInicio')) {
        document.getElementById('fechaInicio').value = config.fechaInicio;
    }
    renderizarEquipos();
    buscarClientes(); 

    const formRapido = document.getElementById('formClienteRapido');
    if (formRapido) {
        formRapido.addEventListener('submit', registrarClienteRapido);
    }
});

async function renderizarEquipos() {
    const container = document.getElementById('listaEquiposResumen');
    if (!container) return;
    container.innerHTML = '';
    const s = config.seleccionados;
    const categoriasMapeo = {
        receptores: "RECEPTOR GNSS MARCA 2Q DE DOBLE FRECUENCIA",
        colectores: "COLECTOR CON SURPAD 4.2 (Incluye 1 power bank y 1 cable usb tipo C)",
        bastones: "BASTON DE 4.5M",
        tripodes: "SOPORTE DE COLECTOR"
    };

    Object.keys(categoriasMapeo).forEach(cat => {
        if (s[cat] && s[cat].length > 0) {
            s[cat].forEach(equipo => {
                const item = document.createElement('div');
                item.className = 'item-alquiler d-flex justify-content-between align-items-center mb-2 p-2 bg-light border-start border-primary';
                item.innerHTML = `<span><strong>1</strong> ${categoriasMapeo[cat]}</span><span class="badge bg-dark">Serie: ${equipo.numeroSerie}</span>`;
                container.appendChild(item);
            });
        }
    });

    if (s.extras && s.extras.length > 0) {
        s.extras.forEach(extra => {
            const item = document.createElement('div');
            item.className = 'item-alquiler d-flex justify-content-between align-items-center mb-2 p-2 bg-light border-start border-info';
            item.innerHTML = `<span><span class="badge bg-info text-dark me-2">EXTRA</span><strong>1</strong> ${extra.tipoNombre.toUpperCase()}</span><span class="badge bg-dark">Serie: ${extra.numeroSerie}</span>`;
            container.appendChild(item);
        });
    }
}

async function buscarClientes() {
    const busquedaInput = document.getElementById('buscarCliente');
    const busqueda = busquedaInput ? busquedaInput.value : '';
    try {
        const res = await fetch(`/api/clientes?busqueda=${encodeURIComponent(busqueda)}`);
        const clientes = await res.json();
        const select = document.getElementById('selectCliente');
        if (!select) return;
        select.innerHTML = '';
        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.nombre} (${c.cedula})`;
            option.addEventListener('click', () => seleccionarCliente(c));
            select.appendChild(option);
        });
    } catch (e) { console.error(e); }
}

function seleccionarCliente(c) {
    document.getElementById('infoClienteSeleccionado').style.display = 'block';
    document.getElementById('nombreCli').textContent = c.nombre;
    document.getElementById('cedulaCli').textContent = c.cedula;
    config.clienteId = c.id;
    config.clienteNombre = c.nombre; 
    config.clienteCedula = c.cedula; 
    config.clienteDireccion = c.direccion || "Quito - Pichincha - Ecuador";
    config.clienteTelefono = c.telefono || "09XXXXXXXX";
}

async function registrarClienteRapido(e) {
    e.preventDefault();
    const datos = {
        nombre: document.getElementById('m-nombre').value,
        cedula: document.getElementById('m-cedula').value,
        telefono: document.getElementById('m-telefono').value,
        correo: document.getElementById('m-correo').value,
        direccion: "Registrado desde flujo de alquiler"
    };
    try {
        const res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(datos)
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ Cliente registrado.");
            const modalEl = document.getElementById('modalNuevoCliente');
            bootstrap.Modal.getInstance(modalEl).hide();
            await buscarClientes();
            seleccionarCliente({ id: data.id, nombre: datos.nombre, cedula: datos.cedula });
        }
    } catch (error) { console.error(error); }
}

async function procesarAlquiler() {
    if (!config.clienteId) return alert("Selecciona un cliente.");
    const fechaFin = document.getElementById('fechaFin').value;
    if (!fechaFin) return alert("Selecciona fecha fin.");

    const s = config.seleccionados;
    const equiposIds = [
        ...(s.receptores || []).map(e => e.id),
        ...(s.colectores || []).map(e => e.id),
        ...(s.bastones || []).map(e => e.id),
        ...(s.tripodes || []).map(e => e.id),
        ...(s.extras || []).map(e => e.id)
    ];

    const datosAlquiler = {
        clienteId: config.clienteId,
        equiposIds: equiposIds,
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaFin: fechaFin,
        observaciones: `Plan: ${config.nombrePlan}`
    };

    try {
        const res = await fetch('/api/alquileres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(datosAlquiler)
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Alquiler registrado exitosamente.");
            generarActaImpresion(data.actaData);
            localStorage.removeItem('configAlquiler');
            setTimeout(() => { window.location.href = 'inicio.html'; }, 3000);
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (error) { console.error(error); }
}

function generarActaImpresion(data) {
    const ventana = window.open('', '_blank');
    
    const nombreLimpio = data.cliente.nombre.toUpperCase().replace(/ /g, "_");
    ventana.document.title = `ACTA_${nombreLimpio}_${data.fecha.replace(/\//g, "-")}`;

    let montoNum = "3500.00";
    let montoLetras = "TRES MIL QUINIENTOS DÓLARES CON 00/100";
    
    if (config.nombrePlan.toLowerCase().includes("básico") || config.nombrePlan.includes("1")) {
        montoNum = "2000.00";
        montoLetras = "DOS MIL DÓLARES CON 00/100";
    } else if (config.nombrePlan.toLowerCase().includes("premium") || config.nombrePlan.includes("3")) {
        montoNum = "5000.00";
        montoLetras = "CINCO MIL DÓLARES CON 00/100";
    }

    const filas = data.equipos.map(e => `
        <tr>
            <td style="border:1px solid black; text-align:center; padding: 2px;">1</td>
            <td style="border:1px solid black; padding-left:10px; font-size: 9pt;">${e.nombre.toUpperCase()} (S/N: ${e.numero_serie})</td>
        </tr>
    `).join('');

    ventana.document.write(`
        <html>
        <head>
            <style>
                @page { size: A4; margin: 0; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #000; overflow: hidden; }
                .pagina { width: 210mm; height: 297mm; background: white; box-sizing: border-box; }
                .salto { page-break-after: always; }
                
                .seccion-corte { 
                    height: 148.5mm; 
                    padding: 10mm 20mm 5mm 20mm; 
                    box-sizing: border-box; 
                    border-bottom: 1px dashed black; 
                    display: flex; 
                    flex-direction: column; 
                }

                .header { display: flex; align-items: center; border-bottom: 1px solid black; padding-bottom: 5px; }
                .info-empresa { flex-grow: 1; text-align: center; font-size: 7.5pt; line-height: 1.2; }
                .titulo-seccion { text-align: center; font-weight: bold; font-size: 10pt; text-decoration: underline; margin: 5px 0; }
                
                /* Altura mínima para la tabla para empujar las firmas hacia abajo */
                .contenedor-tabla { min-height: 50mm; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                
                .frase-seguridad { 
                    margin-top: 40px; /* Aquí generamos el espacio que faltaba */
                    font-size: 9pt; 
                    line-height: 1.4;
                }

                .flex-grow { flex-grow: 1; }
                
                .firmas { display: flex; justify-content: space-between; margin-top: auto; padding-bottom: 10px; text-align: center; font-size: 8.5pt; }
                .linea-firma { border-top: 1px solid black; width: 220px; margin: 0 auto 5px auto; }
                
                .gray-bar { background: #e0e0e0; text-align: center; font-weight: bold; padding: 3px; border: 1px solid #000; margin: 8px 0; font-size: 9pt; }
                .tabla-costos td { border: 1px solid #000; padding: 2px 8px; font-size: 8pt; }
                
                .datos-deudor-table { border: 2px solid black; width: 100%; border-collapse: collapse; margin-top: 10px; }
                .datos-deudor-table td { border: 1px solid black; padding: 10px; vertical-align: top; font-size: 9pt; }
            </style>
        </head>
        <body>
            <div class="pagina salto">
                ${[1, 2].map(i => `
                <div class="seccion-corte">
                    <div class="header">
                        <div style="font-weight:bold; font-size:16pt; border:1px solid black; padding:5px;">2Q</div>
                        <div class="info-empresa">
                            <strong>2Q PROYECTOS Y SERVICIOS</strong><br>
                            Dir: 19 de diciembre N1-71 y atahualpa Quito - Nayón<br>
                            RUC: 1721938114001 | Cel: 0961000572
                        </div>
                    </div>
                    <div class="titulo-seccion">RECEPCIÓN DE EQUIPOS</div>
                    <p style="font-size: 9pt; margin: 5px 0;">Yo <strong>${data.cliente.nombre.toUpperCase()}</strong> con CI N° <strong>${data.cliente.cedula}</strong> recibí de FELIPE OLMEDO QUIJIA MOLINA con CI N° 1721938114 los siguientes equipos en alquiler:</p>
                    
                    <div class="contenedor-tabla">
                        <table>
                            <thead><tr><th style="border:1px solid black; font-size:8pt; width:15%;">Cant.</th><th style="border:1px solid black; font-size:8pt;">Descripción / Serie</th></tr></thead>
                            <tbody>${filas}</tbody>
                        </table>
                    </div>

                    <div class="frase-seguridad">
                        Los equipos antes detallados están en pleno funcionamiento y han sido probados.<br>
                        <strong>Fecha:</strong> ${data.fecha} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Hora:</strong> ${data.hora}
                    </div>

                    <div class="firmas">
                        <div><div class="linea-firma"></div><strong>${data.cliente.nombre.toUpperCase()}</strong><br>CI: ${data.cliente.cedula}</div>
                        <div><div class="linea-firma"></div><strong>FELIPE OLMEDO QUIJIA MOLINA</strong><br>CI: 1721938114</div>
                    </div>
                </div>`).join('')}
            </div>

            <div class="pagina">
                <div class="seccion-corte">
                    <div class="gray-bar">Costo de accesorios en caso de pérdida:</div>
                    <table style="width: 85%; margin: 0 auto;" class="tabla-costos">
                        <tr><td>COLECTOR CON FIELDGENIUS 10 / SURPAD</td><td style="text-align: right;">300 USD</td></tr>
                        <tr><td>BASTÓN PARA TOPOGRAFÍA</td><td style="text-align: right;">180 USD</td></tr>
                        <tr><td>BIPODE/TRIPODE DE ALUMINIO</td><td style="text-align: right;">180 USD</td></tr>
                        <tr><td>SOPORTE DE COLECTOR</td><td style="text-align: right;">100 USD</td></tr>
                        <tr><td>PUNTAS DE ACERO / TORNILLOS / PERNOS</td><td style="text-align: right;">20 USD</td></tr>
                        <tr><td>CASE TAPA / CASE BASE</td><td style="text-align: right;">30 / 80 USD</td></tr>
                        <tr><td>ANTENA RADIO / CABLE USB</td><td style="text-align: right;">10 / 5 USD</td></tr>
                    </table>
                    <div class="gray-bar">Horario entrega y recepción de equipos</div>
                    <p style="font-size: 8.5pt; text-align: center; margin-top: 5px;">
                        Entrega de equipos: 2:00 p.m. a 6:00 p.m.<br>
                        Recepción equipos: Mañana de 9:00 am. a 10:00 am.<br>
                        <strong>Si se reciben después de este horario se cobrará el día de alquiler.</strong>
                    </p>
                </div>
                <div class="seccion-corte" style="border-bottom: none;">
                    <div class="gray-bar">PAGARÉ N° 1</div>
                    <p style="font-size: 9pt; text-align: justify; line-height: 1.4; margin-top: 5px;">
                        Debo y pagaré incondicionalmente este pagaré a la orden de: <strong>FELIPE OLMEDO QUIJIA MOLINA</strong> con CI: 1721938114 en la ciudad de Quito-Ecuador en la fecha <strong>${data.fecha}</strong> la cantidad de:
                    </p>
                    <p style="text-align: center; font-weight: bold; font-size: 11pt; margin: 10px 0;">${montoNum} USD (${montoLetras})</p>
                    <p style="font-size: 8.5pt; text-align: center; margin-bottom: 10px;">En caso de no cumplir con el pago en la fecha acordada, se generará un interés moratorio a 5% mensual</p>
                    <table class="datos-deudor-table">
                        <tr>
                            <td style="width: 55%;">
                                <strong>DATOS DEL DEUDOR</strong><br><br>
                                Nombre: ${data.cliente.nombre.toUpperCase()}<br>
                                Dirección: ${data.cliente.direccion || 'Quito- Pichincha-Ecuador'}<br>
                                Teléfono: ${data.cliente.telefono}
                            </td>
                            <td style="text-align: center; vertical-align: bottom; padding-bottom: 15px;">
                                <strong>Acepto y pagaré a su vencimiento</strong><br><br><br>
                                <div class="linea-firma" style="width: 200px;"></div>
                                <strong>${data.cliente.nombre.toUpperCase()}</strong><br>
                                CI: ${data.cliente.cedula}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <script>window.onload = function() { window.print(); setTimeout(window.close, 1500); }</script>
        </body>
        </html>
    `);
    ventana.document.close();
}