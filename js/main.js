// Variables y arrays
const productos = ["Mate", "Bombilla", "Termo", "Bolso Matero", "Yerbera"];
const precios = [3500, 1500, 9500, 7000, 2000];

let carrito = [];

// Mostrar productos en consola
function mostrarProductos() {
  console.log("Productos disponibles:");
  for (let i = 0; i < productos.length; i++) {
    console.log(`${i + 1}. ${productos[i]} - $${precios[i]}`);
  }
}

//Elegir producto
function seleccionarProducto() {
  let mensaje = "¿Qué producto querés comprar?\n";
  for (let i = 0; i < productos.length; i++) {
    mensaje += `${i + 1}. ${productos[i]} - $${precios[i]}\n`;
  }

  let opcion = parseInt(prompt(mensaje));

  if (opcion >= 1 && opcion <= productos.length) {
    let confirmado = confirm(`¿Agregar "${productos[opcion - 1]}" al carrito por $${precios[opcion - 1]}?`);
    if (confirmado) {
      carrito.push(productos[opcion - 1]);
      alert(`"${productos[opcion - 1]}" agregado al carrito.`);
    } else {
      alert("Producto no agregado.");
    }
  } else {
    alert("Opción inválida.");
  }
}

// Resumen del carrito
function mostrarCarrito() {
  if (carrito.length === 0) {
    alert("No agregaste productos al carrito.");
    return;
  }

  let resumen = "Productos en tu carrito:\n";
  let total = 0;

  for (let producto of carrito) {
    let i = productos.indexOf(producto);
    resumen += `- ${producto} ($${precios[i]})\n`;
    total += precios[i];
  }

  resumen += `\nTotal a pagar: $${total}`;
  alert(resumen);
}

// Simulación de compra
alert("¡Bienvenido/a a la Tienda Matera!");

let seguirComprando = true;

while (seguirComprando) {
  mostrarProductos();
  seleccionarProducto();
  seguirComprando = confirm("¿Querés agregar otro producto?");
}

mostrarCarrito();