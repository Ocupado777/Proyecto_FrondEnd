// ===============================
//  CALENDARIO GOOGLE-LIKE
// ===============================

let fechaActual = new Date();

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("calendario")) {

        inicializarSelects();
        renderizarCalendario();

        document.getElementById("prevMes").onclick = () => cambiarMes(-1);
        document.getElementById("nextMes").onclick = () => cambiarMes(1);

        document.getElementById("selectMes").onchange = cambiarDesdeSelect;
        document.getElementById("selectAnio").onchange = cambiarDesdeSelect;
    }
});

function inicializarSelects() {
    const selectMes = document.getElementById("selectMes");
    const selectAnio = document.getElementById("selectAnio");

    // Mes actual
    selectMes.value = fechaActual.getMonth();

    // Años disponibles (2020–2035)
    for (let y = 2020; y <= 2035; y++) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        selectAnio.appendChild(option);
    }

    selectAnio.value = fechaActual.getFullYear();
}

function cambiarDesdeSelect() {
    const mes = parseInt(document.getElementById("selectMes").value);
    const anio = parseInt(document.getElementById("selectAnio").value);

    fechaActual = new Date(anio, mes, 1);
    renderizarCalendario();
}

function cambiarMes(delta) {
    fechaActual.setMonth(fechaActual.getMonth() + delta);

    document.getElementById("selectMes").value = fechaActual.getMonth();
    document.getElementById("selectAnio").value = fechaActual.getFullYear();

    renderizarCalendario();
}

function renderizarCalendario() {
    const calendario = document.getElementById("calendario");
    const tituloMes = document.getElementById("tituloMes");

    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();

    const nombreMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    tituloMes.textContent = `${nombreMeses[month]} ${year}`;

    calendario.innerHTML = "";

    const primerDia = new Date(year, month, 1).getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();

    const tareas = obtenerTareas();

    // Espacios vacíos antes del día 1
    for (let i = 0; i < (primerDia === 0 ? 6 : primerDia - 1); i++) {
        calendario.innerHTML += `<div></div>`;
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        const tareasDia = tareas.filter(t => t.fecha === fechaStr);

        let dots = tareasDia.map(t => {
            if (t.prioridad === "alta") return `<span class="event-dot dot-alta"></span>`;
            if (t.prioridad === "media") return `<span class="event-dot dot-media"></span>`;
            return `<span class="event-dot dot-baja"></span>`;
        }).join("");

        calendario.innerHTML += `
            <div class="calendar-day" onclick="abrirDia('${fechaStr}')">
                <h5>${dia}</h5>
                ${dots}
            </div>
        `;
    }
}

function abrirDia(fecha) {
    const tareas = obtenerTareas().filter(t => t.fecha === fecha);

    const modalTitulo = document.getElementById("modalDiaTitulo");
    const modalContenido = document.getElementById("modalDiaContenido");

    modalTitulo.textContent = `Tareas del ${fecha}`;

    if (tareas.length === 0) {
        modalContenido.innerHTML = `<p class="text-muted">No hay tareas para este día.</p>`;
    } else {
        modalContenido.innerHTML = tareas.map(t => `
            <div class="p-2 mb-2 bg-dark rounded">
                <h6 class="fw-bold">${t.nombre}</h6>
                <p class="mb-1">${t.descripcion}</p>
                <span class="badge bg-warning text-dark">Prioridad: ${t.prioridad}</span>
                <span class="badge bg-info text-dark">Estado: ${t.estado}</span>
                <a href="detalle-tarea.html?id=${t.id}" class="btn btn-sm btn-outline-light mt-2">Ver</a>
            </div>
        `).join("");
    }

    const modal = new bootstrap.Modal(document.getElementById("modalDia"));
    modal.show();
}
