const fs = require('fs');
const html_to_pdf = require('html-pdf-node');

const generarActaPDF = async (datosAlquiler) => {
    // 1. Preparamos las filas de la tabla de equipos
    const filasEquipos = datosAlquiler.equipos.map(eq => `
        <tr>
            <td style="border: 1px solid black; padding: 5px;">1</td>
            <td style="border: 1px solid black; padding: 5px;">${eq.nombre} - Serie: ${eq.serie}</td>
        </tr>
    `).join('');

    // 2. El HTML con alturas fijas (148mm por mitad)
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial; margin: 0; padding: 0; }
            .hoja-a4 { width: 210mm; height: 297mm; }
            .mitad { 
                height: 148.5mm; 
                padding: 15mm; 
                box-sizing: border-box; 
                border-bottom: 1px dashed #000;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            table { width: 100%; border-collapse: collapse; }
            .header { text-align: center; font-size: 10pt; }
            .firmas { display: flex; justify-content: space-around; margin-top: 20px; }
            .seccion-equipos { flex-grow: 1; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="hoja-a4">
            <div class="mitad">
                <div class="header">
                    <strong>2Q PROYECTOS Y SERVICIOS</strong><br>
                    RECEPCIÓN DE EQUIPOS
                </div>
                <p>Yo <b>${datosAlquiler.cliente_nombre}</b> con CI <b>${datosAlquiler.cliente_ci}</b> recibí conforme:</p>
                <div class="seccion-equipos">
                    <table>
                        <thead>
                            <tr><th style="border: 1px solid black;">Cant.</th><th style="border: 1px solid black;">Descripción</th></tr>
                        </thead>
                        <tbody>${filasEquipos}</tbody>
                    </table>
                </div>
                <div class="firmas">
                    <div>___________________<br>Entregué Conforme</div>
                    <div>___________________<br>Recibí Conforme</div>
                </div>
            </div>

            <div class="mitad">
                <div class="header">
                    <strong>2Q PROYECTOS Y SERVICIOS</strong> (Copia Empresa)<br>
                    RECEPCIÓN DE EQUIPOS
                </div>
                <p>Yo <b>${datosAlquiler.cliente_nombre}</b> con CI <b>${datosAlquiler.cliente_ci}</b> recibí conforme:</p>
                <div class="seccion-equipos">
                    <table>
                        <thead>
                            <tr><th style="border: 1px solid black;">Cant.</th><th style="border: 1px solid black;">Descripción</th></tr>
                        </thead>
                        <tbody>${filasEquipos}</tbody>
                    </table>
                </div>
                <div class="firmas">
                    <div>___________________<br>Entregué Conforme</div>
                    <div>___________________<br>Recibí Conforme</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    let options = { format: 'A4' };
    let file = { content: htmlContent };

    const pdfBuffer = await html_to_pdf.generatePdf(file, options);
    const nombreArchivo = `acta_${Date.now()}.pdf`;
    fs.writeFileSync(`./facturas/${nombreArchivo}`, pdfBuffer);
    return nombreArchivo;
};

module.exports = { generarActaPDF };