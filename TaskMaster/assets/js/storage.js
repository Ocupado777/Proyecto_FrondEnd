function obtenerTareas() {
    let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

    // Asegurar compatibilidad con tareas antiguas
    tareas = tareas.map(t => ({
        ...t,
        etiquetas: t.etiquetas || [],
        subtareas: t.subtareas || []
    }));

    return tareas;
}

function guardarTareas(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

function agregarTarea(tarea) {
    const tareas = obtenerTareas();
    tareas.push(tarea);
    guardarTareas(tareas);
}

function eliminarTarea(id) {
    let tareas = obtenerTareas();
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas(tareas);
}

function actualizarTarea(tareaActualizada) {
    let tareas = obtenerTareas();
    tareas = tareas.map(t => t.id === tareaActualizada.id ? tareaActualizada : t);
    guardarTareas(tareas);
}
