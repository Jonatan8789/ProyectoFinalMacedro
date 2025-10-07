# ProyectoFinal_Macedro (Ecommerce simulador)
**Descripción:** Simulador de ecommerce que carga productos desde `products.json`, permite agregar al carrito, editar cantidades, y simula un flujo de checkout con almacenamiento de pedidos en `localStorage`.

**Entrega:** Contiene los archivos `index.html`, `styles.css`, `app.js`, `products.json`. El proyecto cumple los criterios: uso de datos remotos (JSON), HTML generado desde JS, uso de librería externa (SweetAlert2), lógica de negocio simulada (checkout, stock), funciones y objetos, asincronía con fetch, y precarga de formularios.

**Cómo ejecutar:** Descomprimir el ZIP y abrir `index.html` en un navegador con conexión a Internet (necesita SweetAlert2 CDN para los diálogos). Alternativa: servir con un servidor local (recomendado) para evitar restricciones de fetch con archivos locales:
```bash
# desde la carpeta del proyecto
python -m http.server 8000
# luego abrir http://localhost:8000
```

**Nombre del archivo ZIP:** ProyectoFinal_Macedro.zip
**Nota:** Reemplaza 'Macedro' por tu apellido si prefieres otro nombre de entrega. Puedes editar `products.json` para agregar más productos o ajustar precios y stock.
