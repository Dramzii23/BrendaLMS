const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "El título es obligatorio"],
  },
  descripcion: {
    type: String,
    default: "Descripción no asignada",
    // required: [true, "La descripción es obligatoria"],
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
  instructor: {
    type: String,
    default: "Instructor no asignado",

  },
  fecha_de_publicacion: {
    type: Date,
    default: Date.now,
  },
  alumnos: {
    type: [String],
    default: [],
   
  },
});

module.exports = mongoose.model("Curso", cursoSchema);
