// public/js/realTime.js
const socket = io(); // Inicia la conexión con el servidor (WebSockets)

// --- Función para actualizar la lista en el DOM ---
function updateProductList(products) {
    const container = document.getElementById('productListContainer');
    let html = '<ul>';
    products.forEach(product => {
        html += `
            <li>
                ID: ${product.id} | 
                Nombre: ${product.name} | 
                Precio: $${product.price}
                <button onclick="deleteProduct('${product.id}')">Eliminar (Socket)</button>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

// --- 1. Receptor de Eventos (Actualización) ---
// Escucha el evento 'productsUpdate' que el servidor EMITE (io.emit)
socket.on('productsUpdate', (updatedProducts) => {
    console.log('Lista de productos actualizada recibida.');
    updateProductList(updatedProducts); // Actualiza el HTML sin recargar
});


// --- 2. Emisor de Eventos (Creación) ---
// Maneja el envío del formulario para agregar un producto
document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Evita la recarga (comportamiento por defecto HTTP)

    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;

    // socket.emit envía el evento SOLO al servidor (addProduct)
    socket.emit('addProduct', { name, price }); 

    // Limpia el formulario
    document.getElementById('productForm').reset();
});

// --- 3. Emisor de Eventos (Eliminación) ---
// Función global llamada por el botón "Eliminar" en el HTML
function deleteProduct(productId) {
    socket.emit('deleteProduct', productId); 
}

// Inicializar la lista con los datos iniciales (opcional, si el servidor no los envía primero)
// Como Handlebars ya renderiza la lista inicial, este código solo se enfoca en las actualizaciones.