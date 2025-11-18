// server.js (o app.js)
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io'); // Importamos la clase Server de Socket.io
const http = require('http'); // Módulo nativo HTTP de Node.js (Unidad 3)

const app = express();
const PORT = 8080;

// --- 1. Gestor de Productos Simulados ---
// Simulación de la lógica de negocio (normalmente sería una clase o base de datos)
let products = [{ id: 1, name: 'Producto A', price: 100 }, { id: 2, name: 'Producto B', price: 200 }];
let nextId = 3;

// --- 2. Configuración de Handlebars (Unidad 5) ---
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// --- 3. Middlewares ---
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos (CSS/JS del cliente)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 4. Creación del Servidor HTTP y Socket.io (Unidad 6) ---
const httpServer = http.createServer(app); // Creamos un servidor HTTP a partir de Express
const io = new Server(httpServer); // Adjuntamos Socket.io al servidor HTTP
// Hacemos el objeto 'io' accesible a los routers/peticiones HTTP
app.set('socketio', io);

// --- 5. Routers de Vistas ---
// Router de vistas simple (Podría ir en un archivo viewRouter.js)
app.get('/', (req, res) => {
    res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
    // Renderiza la vista que contendrá la lista y el formulario
    res.render('realTimeProducts', { products });
});

// **Ruta POST de ejemplo (para la sugerencia avanzada)**
// Si decides enviar la creación/eliminación por HTTP, necesitas acceder a 'io'
app.post('/products', (req, res) => {
    const newProduct = { id: nextId++, name: req.body.name, price: req.body.price };
    products.push(newProduct);

    // *Clave:* Obtener la instancia de Socket.io y emitir el evento
    const io = req.app.get('socketio'); 
    io.emit('productsUpdate', products); // Notificar a TODOS los clientes

    res.status(201).send({ message: 'Producto creado y notificado' });
});

// --- 6. Lógica del Servidor Socket.io (Unidad 6) ---
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Ejemplo de cómo manejar la creación de producto SOLO desde WebSockets
    socket.on('addProduct', (productData) => {
        const newProduct = { id: nextId++, name: productData.name, price: productData.price };
        products.push(newProduct);
        // io.emit envía el evento a TODOS los clientes conectados
        io.emit('productsUpdate', products); 
    });

    // Ejemplo de cómo manejar la eliminación de producto
    socket.on('deleteProduct', (productId) => {
        products = products.filter(p => p.id !== parseInt(productId));
        io.emit('productsUpdate', products); 
    });
});

// --- 7. Inicialización del Servidor ---
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});