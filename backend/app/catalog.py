"""Catálogo inicial alineado con el frontend actual."""

CATALOG: tuple[dict[str, str], ...] = (
    {"operation": "ene", "label": "Ocupación y desocupación", "topic": "Mercado laboral"},
    {"operation": "informality", "label": "Informalidad laboral", "topic": "Mercado laboral"},
    {"operation": "ipc", "label": "Índice de Precios al Consumidor", "topic": "Precios"},
    {"operation": "ipp", "label": "Índice de Precios al Productor", "topic": "Precios"},
    {"operation": "births", "label": "Nacimientos", "topic": "Demografía y población"},
    {"operation": "fertility", "label": "Fecundidad", "topic": "Demografía y población"},
    {"operation": "deaths", "label": "Defunciones", "topic": "Demografía y población"},
    {"operation": "mortality", "label": "Mortalidad", "topic": "Demografía y población"},
    {"operation": "unions", "label": "Matrimonios y AUC", "topic": "Demografía y población"},
    {"operation": "enusc", "label": "ENUSC", "topic": "Condiciones de vida"},
    {"operation": "police", "label": "Policías", "topic": "Condiciones de vida"},
    {"operation": "permits", "label": "Permisos de Edificación", "topic": "Industria, Energía y Construcción"},
    {"operation": "energy", "label": "Energía", "topic": "Industria, Energía y Construcción"},
    {"operation": "industry", "label": "Industria", "topic": "Industria, Energía y Construcción"},
    {"operation": "commerce", "label": "Comercio", "topic": "Servicios"},
    {"operation": "tourism", "label": "Turismo", "topic": "Servicios"},
    {"operation": "supermarkets", "label": "Supermercados", "topic": "Servicios"},
    {"operation": "businessDemography", "label": "Demografía de empresas", "topic": "Estadísticas Experimentales"},
)
