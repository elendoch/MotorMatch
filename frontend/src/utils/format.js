// src/utils/format.js

export const formatCOP = (precio) => {
  if (precio === undefined || precio === null || isNaN(precio)) {
    return 'Precio no disponible';
  }
  return `$${Number(precio).toLocaleString('es-CO')} COP`;
};
