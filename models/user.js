const mongoose = require("mongoose"); //mongoose es un modulo que nos permite conectarnos a la base de datos de mongoDB

const userSchema = mongoose.Schema({
  //creamos un esquema para la base de datos
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
  },
  apellidos: {
    type: String,
    required: [true, "Los apellidos son obligatorios"],
  },
  ciudad: {
    type: String,
    required: [true, "La ciudad es obligatoria"],
  },
  correoElectronico: {
    type: String,
    required: [true, "El correo electrónico es obligatorio"],
    unique: true,
    match: [/.+\@.+\..+/, "Por favor ingrese un correo electrónico válido"],
  },
  curp: {
    type: String,
    required: [true, "El CURP es obligatorio"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
  },
  rol: {
    type: String,
    enum: ["Alumno", "Instructor"],
    required: [true, "El rol es obligatorio"],
  },
  calificaciones: {
    type: [Number],
    default: [],
  },
  conferencias: {
    type: [String],
    default: [],
  },
  fechaIngreso: {
    type: Date,
    default: Date.now,
  },
  cursos: {
    type: [String],
    default: [],
  },
}); //schema es una clase que nos permite crear esquemas para la base de datos

module.exports = mongoose.model("User", userSchema); //exportamos el modelo de usuario para poder utilizarlo en otros archivos
