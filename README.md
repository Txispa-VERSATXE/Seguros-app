# Seguros-app

Aplicación web para el seguimiento de pólizas de seguro de automóvil desarrollada con React en el frontend y Node.js con Express en el backend, intercambiando datos en formato JSON mediante peticiones asíncronas.

## Tecnologías

- Backend: Node.js + Express (puerto 3001)
- Frontend: React 18 + React Router v6 (puerto 3000)
- Datos: fichero backend/seguros.json (acceso solo a través de la API)

## Instalación

cd backend && npm install
cd ../frontend && npm install

## Ejecución

Terminal 1 - Backend:
cd backend
npm start

Terminal 2 - Frontend:
cd frontend
npm start

## Endpoints de la API

- GET /polizas - Listado completo de polizas
- GET /polizas/:id_poliza - Detalle de una poliza
- POST /polizas - Alta de nueva poliza
- PUT /polizas - Actualizacion de poliza existente
- DELETE /polizas/:id_poliza - Eliminacion de poliza
- GET /estadisticas - Estadisticas con filtros

## Validaciones

1. ID poliza: formato IDXXXXX (ID seguido de 5 digitos). Expresion regular: /^ID\d{5}$/
2. Todos los campos son obligatorios
3. Vigencia: entre 1 y 21 meses
4. Matricula: 4 digitos seguidos de 3 letras del conjunto BCDFGHJKLMNPRSTVWXYZ. Expresion regular: /^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/
5. Edad del coche: entre 0 y 10 anos
6. Edad del tomador: entre 18 y 90 anos
7. Transmision: unicamente Manual o Automatica
8. Tipo de vehiculo: unicamente Combustion o Electrico
9. Las expresiones regulares se almacenan como variables en PolizasContext.jsx

## Unidades trabajadas

- UT5: Bibliotecas y Frameworks: React
- UT6: Componentes y objetos predefinidos
- UT7: Interaccion con el usuario: eventos y formularios
- UT8: Comunicacion asincrona