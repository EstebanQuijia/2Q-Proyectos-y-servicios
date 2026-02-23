// const fs = require('fs');
// const html_to_pdf = require('html-pdf-node');

// const generarActaPDF = async (datosAlquiler) => {
//     // 1. Preparamos las filas de la tabla de equipos
//     const filasEquipos = datosAlquiler.equipos.map(eq => `
//         <tr>
//             <td style="border: 1px solid black; padding: 5px;">1</td>
//             <td style="border: 1px solid black; padding: 5px;">${eq.nombre} - Serie: ${eq.serie}</td>
//         </tr>
//     `).join('');

//     // 2. El HTML con alturas fijas (148mm por mitad)
//     let htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <style>
//             body { font-family: Arial; margin: 0; padding: 0; }
//             .hoja-a4 { width: 210mm; height: 297mm; }
//             .mitad { 
//                 height: 148.5mm; 
//                 padding: 15mm; 
//                 box-sizing: border-box; 
//                 border-bottom: 1px dashed #000;
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: space-between;
//             }
//             table { width: 100%; border-collapse: collapse; }
//             .header { text-align: center; font-size: 10pt; }
//             .firmas { display: flex; justify-content: space-around; margin-top: 20px; }
//             .seccion-equipos { flex-grow: 1; margin-top: 10px; }
//         </style>
//     </head>
//     <body>
//         <div class="hoja-a4">
//             <div class="mitad">
//                 <div class="header">
//                     <strong>2Q PROYECTOS Y SERVICIOS</strong><br>
//                     RECEPCIÓN DE EQUIPOS
//                 </div>
//                 <p>Yo <b>${datosAlquiler.cliente_nombre}</b> con CI <b>${datosAlquiler.cliente_ci}</b> recibí conforme:</p>
//                 <div class="seccion-equipos">
//                     <table>
//                         <thead>
//                             <tr><th style="border: 1px solid black;">Cant.</th><th style="border: 1px solid black;">Descripción</th></tr>
//                         </thead>
//                         <tbody>${filasEquipos}</tbody>
//                     </table>
//                 </div>
//                 <div class="firmas">
//                     <div>___________________<br>Entregué Conforme</div>
//                     <div>___________________<br>Recibí Conforme</div>
//                 </div>
//             </div>

//             <div class="mitad">
//                 <div class="header">
//                     <strong>2Q PROYECTOS Y SERVICIOS</strong> (Copia Empresa)<br>
//                     RECEPCIÓN DE EQUIPOS
//                 </div>
//                 <p>Yo <b>${datosAlquiler.cliente_nombre}</b> con CI <b>${datosAlquiler.cliente_ci}</b> recibí conforme:</p>
//                 <div class="seccion-equipos">
//                     <table>
//                         <thead>
//                             <tr><th style="border: 1px solid black;">Cant.</th><th style="border: 1px solid black;">Descripción</th></tr>
//                         </thead>
//                         <tbody>${filasEquipos}</tbody>
//                     </table>
//                 </div>
//                 <div class="firmas">
//                     <div>___________________<br>Entregué Conforme</div>
//                     <div>___________________<br>Recibí Conforme</div>
//                 </div>
//             </div>
//         </div>
//     </body>
//     </html>
//     `;

//     let options = { format: 'A4' };
//     let file = { content: htmlContent };

//     const pdfBuffer = await html_to_pdf.generatePdf(file, options);
//     const nombreArchivo = `acta_${Date.now()}.pdf`;
//     fs.writeFileSync(`./facturas/${nombreArchivo}`, pdfBuffer);
//     return nombreArchivo;
// };

// module.exports = { generarActaPDF };

const fs = require('fs');
const path = require('path');
const html_to_pdf = require('html-pdf-node');

const generarActaPDF = async (datosAlquiler) => {
    // Asegurar que la carpeta de destino exista
    const dir = './facturas';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    // 1. Preparamos las filas de la tabla de equipos
    // Usamos 'numero_serie' para coincidir con tu nueva base de datos en Postgres
    const filasEquipos = datosAlquiler.equipos.map(eq => `
        <tr>
            <td style="border: 1px solid black; padding: 5px; text-align: center;">1</td>
            <td style="border: 1px solid black; padding: 5px;">${eq.nombre} - <b>S/N: ${eq.numero_serie}</b></td>
        </tr>
    `).join('');

    const fechaHoy = new Date().toLocaleDateString();

    // 2. El HTML con formato optimizado para impresión
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .hoja-a4 { width: 210mm; height: 297mm; }
            .mitad { 
                height: 148.5mm; 
                padding: 15mm; 
                box-sizing: border-box; 
                border-bottom: 1px dashed #ccc;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f2f2f2; font-size: 9pt; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 5px; }
            .header strong { font-size: 14pt; color: #000; }
            .info-cliente { font-size: 10pt; margin-top: 15px; }
            .firmas { display: flex; justify-content: space-around; margin-top: 30px; text-align: center; font-size: 9pt; }
            .linea-firma { border-top: 1px solid #000; width: 150px; margin-bottom: 5px; }
            .footer-fecha { text-align: right; font-size: 8pt; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="hoja-a4">
            ${[1, 2].map(num => `
            <div class="mitad">
                <div class="header">
                    <strong>2Q PROYECTOS Y SERVICIOS</strong><br>
                    <span style="letter-spacing: 2px;">ACTA DE ENTREGA - RECEPCIÓN</span>
                    ${num === 2 ? '<br><small>(Copia Empresa)</small>' : ''}
                </div>
                
                <div class="info-cliente">
                    Fecha: <b>${fechaHoy}</b><br>
                    Yo, <b>${datosAlquiler.cliente.nombre}</b> con CI/RUC <b>${datosAlquiler.cliente.cedula}</b>, 
                    declaro haber recibido en perfecto estado operativo los siguientes activos:
                </div>

                <div class="seccion-equipos">
                    <table>
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; width: 10%;">Cant.</th>
                                <th style="border: 1px solid black; width: 90%;">Descripción del Equipo</th>
                            </tr>
                        </thead>
                        <tbody>${filasEquipos}</tbody>
                    </table>
                </div>

                <div class="firmas">
                    <div><div class="linea-firma"></div>2Q Proyectos<br><b>Entregué Conforme</b></div>
                    <div><div class="linea-firma"></div>${datosAlquiler.cliente.nombre}<br><b>Recibí Conforme</b></div>
                </div>
                <div class="footer-fecha">Documento generado por Sistema 2Q - ID: ${Date.now()}</div>
            </div>
            `).join('')}
        </div>
    </body>
    </html>
    `;

    let options = { 
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    };
    
    let file = { content: htmlContent };

    try {
        const pdfBuffer = await html_to_pdf.generatePdf(file, options);
        const nombreArchivo = `acta_${Date.now()}.pdf`;
        const pathArchivo = path.join(dir, nombreArchivo);
        
        fs.writeFileSync(pathArchivo, pdfBuffer);
        return nombreArchivo;
    } catch (error) {
        console.error("Error generando PDF:", error);
        throw error;
    }
};

module.exports = { generarActaPDF };