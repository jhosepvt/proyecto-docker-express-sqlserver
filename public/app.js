async function cargarTareas() {
    try {
        const res = await fetch('/api/tareas');
        const tareas = await res.json();
        const lista = document.getElementById('lista');
        
        lista.innerHTML = tareas.map(t => 
            `<li>
                <span>${t.descripcion || t.Titulo}</span> 
                <span>${t.Completado ? '✅' : '⏳'}</span>
            </li>`
        ).join('');
    } catch (error) {
        console.error('Error al cargar tareas:', error);
    }
}

async function agregarTarea() {
    const input = document.getElementById('titulo');
    const titulo = input.value.trim();
    
    if(!titulo) return;

    try {
        await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: titulo }) // Se envía como 'descripcion'
        });
        
        input.value = '';
        cargarTareas();
    } catch (error) {
        console.error('Error al guardar tarea:', error);
    }
}

cargarTareas();
