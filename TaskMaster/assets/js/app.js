// ===============================
//  APP.JS – LÓGICA PRINCIPAL
// ===============================

let subtareas = [];          // Para nueva tarea
let subtareasEditar = [];    // Para editar tarea

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    //  TEMA
    // ===============================
    const btnTema = document.getElementById("toggleTema");
    if (btnTema) {
        inicializarTema();
        btnTema.addEventListener("click", cambiarTema);
    }

    // ===============================
    //  ORDENAMIENTO
    // ===============================
    const ordenar = document.getElementById("ordenarTareas");
    if (ordenar) ordenar.addEventListener("change", mostrarTareas);

    // ===============================
    //  FORMULARIO: CREAR NUEVA TAREA
    // ===============================
    const form = document.getElementById("formNuevaTarea");
    if (form) {

        const btnAgregarSubtarea = document.getElementById("btnAgregarSubtarea");
        const listaSubtareas = document.getElementById("listaSubtareas");
        subtareas = [];

        if (btnAgregarSubtarea && listaSubtareas) {
            btnAgregarSubtarea.addEventListener("click", () => {
                const input = document.getElementById("nuevaSubtarea");
                const texto = input.value.trim();
                if (texto === "") return;

                subtareas.push({ texto, completada: false });
                renderSubtareas(listaSubtareas, subtareas);

                input.value = "";
            });
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                return;
            }

            const nombre = document.getElementById("nombre").value;
            const descripcion = document.getElementById("descripcion").value;
            const prioridad = document.getElementById("prioridad").value;
            const estado = document.getElementById("estado").value;
            const fecha = document.getElementById("fecha").value;

            const etiquetasTexto = document.getElementById("etiquetas").value;
            const etiquetas = etiquetasTexto
                .split(",")
                .map(e => e.trim())
                .filter(e => e !== "");

            const id = Date.now();
            const nuevaTarea = new Tarea(
                id,
                nombre,
                descripcion,
                prioridad,
                estado,
                fecha,
                etiquetas,
                subtareas
            );

            agregarTarea(nuevaTarea);
            window.location.href = "tareas.html";
        });
    }

    // ===============================
    //  FORMULARIO: EDITAR TAREA
    // ===============================
    const formEditar = document.getElementById("formEditarTarea");
    if (formEditar) {

        const listaSubtareasEditar = document.getElementById("listaSubtareasEditar");
        const btnAgregarSubtareaEditar = document.getElementById("btnAgregarSubtareaEditar");
        subtareasEditar = [];

        cargarDatosEdicion();

        if (btnAgregarSubtareaEditar && listaSubtareasEditar) {
            btnAgregarSubtareaEditar.addEventListener("click", () => {
                const input = document.getElementById("nuevaSubtareaEditar");
                const texto = input.value.trim();
                if (texto === "") return;

                subtareasEditar.push({ texto, completada: false });
                renderSubtareas(listaSubtareasEditar, subtareasEditar);

                input.value = "";
            });
        }

        formEditar.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!formEditar.checkValidity()) {
                formEditar.classList.add("was-validated");
                return;
            }

            const id = parseInt(formEditar.dataset.id);

            const etiquetasTexto = document.getElementById("etiquetas").value;
            const etiquetas = etiquetasTexto
                .split(",")
                .map(e => e.trim())
                .filter(e => e !== "");

            const tareaActualizada = new Tarea(
                id,
                document.getElementById("nombre").value,
                document.getElementById("descripcion").value,
                document.getElementById("prioridad").value,
                document.getElementById("estado").value,
                document.getElementById("fecha").value,
                etiquetas,
                subtareasEditar
            );

            actualizarTarea(tareaActualizada);
            window.location.href = "tareas.html";
        });
    }

    // ===============================
    //  BUSCADOR
    // ===============================
    const buscador = document.getElementById("buscarTarea");
    if (buscador) buscador.addEventListener("input", mostrarTareas);

    // ===============================
    //  FILTROS
    // ===============================
    const filtroEstado = document.getElementById("filtroEstado");
    const filtroPrioridad = document.getElementById("filtroPrioridad");
    const filtroEtiquetas = document.getElementById("filtroEtiquetas");

    if (filtroEstado) filtroEstado.addEventListener("change", mostrarTareas);
    if (filtroPrioridad) filtroPrioridad.addEventListener("change", mostrarTareas);
    if (filtroEtiquetas) filtroEtiquetas.addEventListener("input", mostrarTareas);

    // ===============================
    //  MOSTRAR LISTA DE TAREAS
    // ===============================
    mostrarTareas();

    // ===============================
    //  MOSTRAR DETALLE
    // ===============================
    mostrarDetalleTarea();

    // ===============================
    //  MOSTRAR ESTADÍSTICAS
    // ===============================
    mostrarEstadisticas();
});


// ===============================
//  RENDER SUBTAREAS
// ===============================
function renderSubtareas(contenedor, lista) {
    contenedor.innerHTML = "";
    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `<p class="text-secondary mb-0"><small>Sin subtareas aún.</small></p>`;
        return;
    }

    lista.forEach(s => {
        const p = document.createElement("p");
        p.classList.add("mb-1");
        p.textContent = `• ${s.texto}`;
        contenedor.appendChild(p);
    });
}


// ===============================
//  MOSTRAR TODAS LAS TAREAS
// ===============================
function mostrarTareas() {
    const contenedor = document.getElementById("listaTareas");
    if (!contenedor) return;

    const filtroEstado = document.getElementById("filtroEstado")?.value || "";
    const filtroPrioridad = document.getElementById("filtroPrioridad")?.value || "";
    const filtroEtiquetas = document.getElementById("filtroEtiquetas")?.value.toLowerCase() || "";
    const textoBusqueda = document.getElementById("buscarTarea")?.value.toLowerCase() || "";
    const ordenar = document.getElementById("ordenarTareas")?.value || "";

    let tareas = obtenerTareas();

    if (filtroEstado !== "") tareas = tareas.filter(t => t.estado === filtroEstado);
    if (filtroPrioridad !== "") tareas = tareas.filter(t => t.prioridad === filtroPrioridad);

    if (filtroEtiquetas.trim() !== "") {
        tareas = tareas.filter(t =>
            (t.etiquetas || []).some(tag => tag.toLowerCase().includes(filtroEtiquetas))
        );
    }

    if (textoBusqueda.trim() !== "") {
        tareas = tareas.filter(t => t.nombre.toLowerCase().includes(textoBusqueda));
    }

    if (ordenar === "fechaAsc") tareas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    if (ordenar === "fechaDesc") tareas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (ordenar === "prioridadAlta") {
        const orden = { alta: 1, media: 2, baja: 3 };
        tareas.sort((a, b) => orden[a.prioridad] - orden[b.prioridad]);
    }

    if (ordenar === "prioridadBaja") {
        const orden = { alta: 3, media: 2, baja: 1 };
        tareas.sort((a, b) => orden[b.prioridad] - orden[a.prioridad]);
    }

    if (ordenar === "estado") {
        const orden = { pendiente: 1, progreso: 2, completada: 3 };
        tareas.sort((a, b) => orden[a.estado] - orden[b.estado]);
    }

    contenedor.innerHTML = "";

    if (tareas.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-secondary">
                <p class="lead">No hay tareas que coincidan con la búsqueda o filtros.</p>
            </div>
        `;
        return;
    }

    tareas.forEach(tarea => {

        // ===============================
        //  ALERTA DE FECHA
        // ===============================
        const hoy = new Date();
        const fechaTarea = new Date(tarea.fecha);
        const diff = Math.ceil((fechaTarea - hoy) / (1000 * 60 * 60 * 24));

        let alerta = "";
        if (diff < 0) alerta = `<span class="badge bg-danger ms-1">Vencida</span>`;
        else if (diff === 0) alerta = `<span class="badge bg-warning text-dark ms-1">Hoy</span>`;
        else if (diff === 1) alerta = `<span class="badge bg-info text-dark ms-1">Mañana</span>`;

        const card = document.createElement("div");
        card.classList.add("col-md-4", "tarea-animada");

        card.innerHTML = `
            <div class="card bg-secondary text-light h-100 shadow">
                <div class="card-body">
                    <h5 class="card-title fw-bold">${tarea.nombre}</h5>
                    <p class="card-text">${tarea.descripcion}</p>

                    <span class="badge bg-warning text-dark">Prioridad: ${tarea.prioridad}</span>
                    <span class="badge bg-info text-dark">Estado: ${tarea.estado}</span>
                    ${alerta}

                    <div class="mt-2">
                        ${(tarea.etiquetas || [])
                            .map(tag => `<span class="badge bg-primary me-1">${tag}</span>`)
                            .join("")}
                    </div>

                    <p class="mt-2"><small>Fecha límite: ${tarea.fecha}</small></p>

                    <div class="mt-3 d-flex justify-content-between">
                        <a href="detalle-tarea.html?id=${tarea.id}" class="btn btn-outline-light btn-sm">Ver</a>
                        <a href="editar-tarea.html?id=${tarea.id}" class="btn btn-warning btn-sm">Editar</a>
                        <button class="btn btn-danger btn-sm" onclick="eliminar(${tarea.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });
}


// ===============================
//  ELIMINAR UNA TAREA
// ===============================
function eliminar(id) {
    if (confirm("¿Seguro que deseas eliminar esta tarea?")) {
        eliminarTarea(id);
        mostrarTareas();
    }
}


// ===============================
//  MOSTRAR DETALLE DE UNA TAREA
// ===============================
function mostrarDetalleTarea() {
    const contenedor = document.getElementById("detalleTarea");
    if (!contenedor) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    const tareas = obtenerTareas();
    const tarea = tareas.find(t => t.id === id);

    if (!tarea) {
        contenedor.innerHTML = `
            <p class="text-center text-danger">❌ Tarea no encontrada.</p>
        `;
        return;
    }

    // ===============================
    //  ALERTA DE FECHA
    // ===============================
    const hoy = new Date();
    const fechaTarea = new Date(tarea.fecha);
    const diff = Math.ceil((fechaTarea - hoy) / (1000 * 60 * 60 * 24));

    let mensajeAlerta = "";
    if (diff < 0) mensajeAlerta = `<div class="alert alert-danger">Esta tarea está vencida.</div>`;
    else if (diff === 0) mensajeAlerta = `<div class="alert alert-warning text-dark">La tarea vence hoy.</div>`;
    else if (diff === 1) mensajeAlerta = `<div class="alert alert-info">La tarea vence mañana.</div>`;

    // ===============================
    //  PROGRESO DE SUBTAREAS
    // ===============================
    const total = (tarea.subtareas || []).length;
    const hechas = (tarea.subtareas || []).filter(s => s.completada).length;
    const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100);

    // ===============================
    //  RENDERIZAR DETALLE
    // ===============================
    contenedor.innerHTML = `
        ${mensajeAlerta}

        <h3 class="fw-bold">${tarea.nombre}</h3>
        <p class="mt-3">${tarea.descripcion}</p>

        <p><strong>Prioridad:</strong> 
            <span class="badge bg-warning text-dark">${tarea.prioridad}</span>
        </p>

        <p><strong>Estado:</strong> 
            <span class="badge bg-info text-dark">${tarea.estado}</span>
        </p>

        <p><strong>Etiquetas:</strong> 
            ${(tarea.etiquetas || [])
                .map(tag => `<span class="badge bg-primary me-1">${tag}</span>`)
                .join("") || "<span class='text-secondary'>Sin etiquetas</span>"}
        </p>

        <p><strong>Fecha límite:</strong> ${tarea.fecha}</p>

        <p class="mt-4 mb-1"><strong>Progreso de subtareas:</strong></p>
        <div class="progress mb-3">
            <div class="progress-bar bg-success" style="width: ${porcentaje}%;">
                ${porcentaje}%
            </div>
        </div>

        <p><strong>Subtareas:</strong></p>
        <ul class="list-group mb-3">
            ${(tarea.subtareas || []).length === 0
                ? `<li class="list-group-item bg-dark text-light">Sin subtareas.</li>`
                : tarea.subtareas.map((s, i) => `
                    <li class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                        <span>${s.completada ? "✔️ " : ""}${s.texto}</span>
                        <button class="btn btn-sm btn-success" onclick="toggleSubtarea(${tarea.id}, ${i})">
                            ${s.completada ? "Desmarcar" : "Completar"}
                        </button>
                    </li>
                `).join("")}
        </ul>

        <div class="mt-4 d-flex gap-2">
            <a href="editar-tarea.html?id=${tarea.id}" class="btn btn-warning">✏ Editar</a>
            <button class="btn btn-danger" onclick="eliminar(${tarea.id})">🗑 Eliminar</button>
        </div>
    `;
}


// ===============================
//  TOGGLE SUBTAREA
// ===============================
function toggleSubtarea(idTarea, indexSubtarea) {
    let tareas = obtenerTareas();
    let tarea = tareas.find(t => t.id === idTarea);
    if (!tarea) return;

    tarea.subtareas[indexSubtarea].completada = !tarea.subtareas[indexSubtarea].completada;

    guardarTareas(tareas);
    mostrarDetalleTarea();
}


// ===============================
//  CARGAR DATOS PARA EDICIÓN
// ===============================
function cargarDatosEdicion() {
    const form = document.getElementById("formEditarTarea");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    const tareas = obtenerTareas();
    const tarea = tareas.find(t => t.id === id);

    if (!tarea) {
        alert("Tarea no encontrada");
        window.location.href = "tareas.html";
        return;
    }

    document.getElementById("nombre").value = tarea.nombre;
    document.getElementById("descripcion").value = tarea.descripcion;
    document.getElementById("prioridad").value = tarea.prioridad;
    document.getElementById("estado").value = tarea.estado;
    document.getElementById("fecha").value = tarea.fecha;
    document.getElementById("etiquetas").value = (tarea.etiquetas || []).join(", ");

    const listaSubtareasEditar = document.getElementById("listaSubtareasEditar");
    subtareasEditar = [...(tarea.subtareas || [])];
    if (listaSubtareasEditar) {
        renderSubtareas(listaSubtareasEditar, subtareasEditar);
    }

    form.dataset.id = tarea.id;
}


// ===============================
//  MOSTRAR ESTADÍSTICAS
// ===============================
function mostrarEstadisticas() {
    const pendientes = document.getElementById("statPendientes");
    const progreso = document.getElementById("statProgreso");
    const completadas = document.getElementById("statCompletadas");
    const canvas = document.getElementById("graficoTareas");

    if (!pendientes || !progreso || !completadas || !canvas) return;

    const tareas = obtenerTareas();

    const totalPendientes = tareas.filter(t => t.estado === "pendiente").length;
    const totalProgreso = tareas.filter(t => t.estado === "progreso").length;
    const totalCompletadas = tareas.filter(t => t.estado === "completada").length;

    pendientes.textContent = totalPendientes;
    progreso.textContent = totalProgreso;
    completadas.textContent = totalCompletadas;

    new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Pendientes", "En progreso", "Completadas"],
            datasets: [{
                data: [totalPendientes, totalProgreso, totalCompletadas],
                backgroundColor: ["#ffc107", "#0dcaf0", "#198754"]
            }]
        }
    });
}


// ===============================
//  TEMA
// ===============================
function inicializarTema() {
    const temaGuardado = localStorage.getItem("tema") || "oscuro";

    if (temaGuardado === "claro") {
        document.body.classList.add("claro");
        document.getElementById("toggleTema").textContent = "☀️";
    } else {
        document.body.classList.remove("claro");
        document.getElementById("toggleTema").textContent = "🌙";
    }
}

function cambiarTema() {
    const body = document.body;

    if (body.classList.contains("claro")) {
        body.classList.remove("claro");
        localStorage.setItem("tema", "oscuro");
        document.getElementById("toggleTema").textContent = "🌙";
    } else {
        body.classList.add("claro");
        localStorage.setItem("tema", "claro");
        document.getElementById("toggleTema").textContent = "☀️";
    }
}
