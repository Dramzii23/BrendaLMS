const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "El título es obligatorio"],
  },
  descripcion: {
    type: String,
    required: [true, "La descripción es obligatoria"],
  },
  contenido: {
    type: String,
    required: [true, "El contenido es obligatorio"],
  },
  creditos: {
    type: Number,
    required: [true, "Los créditos son obligatorios"],
  },
  horario: {
    type: String,
    required: [true, "El horario es obligatorio"],
  },
  examenes: {
    type: String,
    required: [true, "Los exámenes son obligatorios"],
  },
  tests: {
    type: String,
    required: [true, "Los tests son obligatorios"],
  },
});

module.exports = mongoose.model("Curso", cursoSchema);
