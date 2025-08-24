const mongoose = require('mongoose');

const cultivoSchema = new mongoose.Schema({
  // Referencias
  parcela: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parcela',
    required: true 
  },
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  producto: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true 
  },
  
  // Datos de siembra
  cantidad_sembrada: {
    type: Number,
    required: true,
    min: 0
  },
  area_sembrada: {
    type: Number,
    required: true,
    min: 0,
    // En metros cuadrados o hectáreas según configuración
  },
  unidad_area: {
    type: String,
    enum: ['m2', 'hectarea'],
    default: 'm2'
  },
  fecha_siembra: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Estimaciones iniciales
  estimacion_produccion: {
    cantidad_estimada: Number,
    unidad: String,
    precio_estimado_por_unidad: Number,
    ingresos_estimados: Number,
    fecha_cosecha_estimada: Date,
    rendimiento_por_area: Number // kg por m2 o toneladas por hectarea
  },
  
  // Estado del cultivo
  estado: {
    type: String,
    enum: ['sembrado', 'en_crecimiento', 'listo_cosecha', 'cosechado', 'finalizado'],
    default: 'sembrado'
  },
  
  // Seguimiento del clima en el momento de siembra
  condiciones_siembra: {
    temperatura: Number,
    humedad: Number,
    precipitacion: Number,
    velocidad_viento: Number,
    fecha_registro: Date
  },
  
  // Datos reales de cosecha (cuando se complete)
  resultado_real: {
    cantidad_cosechada: Number,
    unidad: String,
    precio_venta_real: Number,
    ingresos_reales: Number,
    fecha_cosecha_real: Date,
    costos_produccion: Number,
    ganancia_neta: Number,
    rendimiento_real: Number,
    observaciones: String
  },
  
  // Origen de la siembra
  origen: {
    type: String,
    enum: ['recomendacion', 'seleccion_manual'],
    required: true
  },
  
  // Si vino de recomendación, guardar el score
  datos_recomendacion: {
    score_original: Number,
    posicion_en_ranking: Number,
    detalles_evaluacion: [String],
    alertas: [String]
  },
  
  // Notas y observaciones del usuario
  notas: [{
    fecha: { type: Date, default: Date.now },
    contenido: String,
    tipo: {
      type: String,
      enum: ['observacion', 'tratamiento', 'riego', 'fertilizacion', 'alerta', 'otro'],
      default: 'observacion'
    }
  }],
  
  // Control de cambios de estado
  historial_estados: [{
    estado_anterior: String,
    estado_nuevo: String,
    fecha_cambio: { type: Date, default: Date.now },
    motivo: String
  }]
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular días desde siembra
cultivoSchema.virtual('dias_desde_siembra').get(function() {
  if (!this.fecha_siembra) return 0;
  const ahora = new Date();
  const fechaSiembra = new Date(this.fecha_siembra);
  const diffTime = Math.abs(ahora - fechaSiembra);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual para calcular días hasta cosecha estimada
cultivoSchema.virtual('dias_hasta_cosecha_estimada').get(function() {
  if (!this.estimacion_produccion?.fecha_cosecha_estimada) return null;
  const ahora = new Date();
  const fechaCosecha = new Date(this.estimacion_produccion.fecha_cosecha_estimada);
  const diffTime = fechaCosecha - ahora;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual para calcular progreso del cultivo
cultivoSchema.virtual('progreso_cultivo').get(function() {
  const diasTranscurridos = this.dias_desde_siembra;
  const diasTotales = this.dias_hasta_cosecha_estimada + diasTranscurridos;
  if (diasTotales <= 0) return 100;
  return Math.min(100, Math.round((diasTranscurridos / diasTotales) * 100));
});

// Middleware para actualizar historial de estados
cultivoSchema.pre('save', function(next) {
  if (this.isModified('estado') && !this.isNew) {
    const original = this.constructor.findById(this._id);
    if (original && original.estado !== this.estado) {
      this.historial_estados.push({
        estado_anterior: original.estado,
        estado_nuevo: this.estado,
        fecha_cambio: new Date()
      });
    }
  }
  next();
});

// Índices para optimizar consultas
cultivoSchema.index({ usuario: 1, parcela: 1 });
cultivoSchema.index({ estado: 1 });
cultivoSchema.index({ fecha_siembra: 1 });
cultivoSchema.index({ 'estimacion_produccion.fecha_cosecha_estimada': 1 });

module.exports = mongoose.model('Cultivo', cultivoSchema);
