class Tarea {
    constructor(id, nombre, descripcion, prioridad, estado, fecha, etiquetas = [], subtareas = []) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.estado = estado;
        this.fecha = fecha;
        this.etiquetas = etiquetas;
        this.subtareas = subtareas;
    }
}
