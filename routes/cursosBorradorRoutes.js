const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const { default: mongoose } = require("mongoose");

const storage = multer.diskStorage({
  // con destination le decimos a multer donde guardar los archivos
  destination: function (req, files, cb) {
    cb(null, "uploads/");
  },
  // con filename le damos un nombre a los archivos
  //cb es el callback que se ejecuta cuando multer ya tiene el nombre del archivo
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });





const CursoBorrador = require("../models/curso-borrador");
// inicia CRUD functions
// Crear un nuevo curso POST /api/cursos
const createCursoBorrador = async (req, res) => {
  let cuerpoRequest = req.body;
  try {
    const _cursoTitulo = await Curso.exists({ titulo: cuerpoRequest.titulo });

    if (_cursoTitulo) {
      return res.status(400).json({
        ok: false,
        message: "El curso ya existe",
      });
    } else {
      const Curso_Object_New = new Curso({
        titulo: cuerpoRequest.titulo,
        descripcion: cuerpoRequest.descripcion,
        contenido: cuerpoRequest.contenido,
        creditos: cuerpoRequest.creditos,
        horario: cuerpoRequest.horario,
        examenes: cuerpoRequest.examenes,
        tests: cuerpoRequest.tests,
        instructor: cuerpoRequest.instructor,
        fecha_de_publicacion: cuerpoRequest.fecha_de_publicacion,
        alumnos: cuerpoRequest.alumnos
      });

      await Curso_Object_New.save().then((createdCurso) => {
        if (createdCurso) {
          res.status(201).json({
            message: "Curso creado",
            cursoID: createdCurso._id,
          });
        } else {
          res.status(500).json({
            message: "Error al crear el curso",
          });
        }
      });
    }
  } catch (error) {
    console.log(
      "Error al crear el curso",
      error
    );
    
    res.status(500).json({ message: "Error al crear el curso", error });
  }
};
// Ejemplo crear curso
const curso = {
  "titulo": "Curso de Node.js",
  "descripcion": "Aprende Node.js desde cero",
  "contenido": "Contenido del curso",
  "creditos": 5,
  "horario": "Lunes a Viernes de 9 a 12",
  "examenes": "Exámenes del curso",
  "tests": "Tests del curso",
  "instructor": "Juan Pérez",
  "fecha_de_publicacion": new Date(),
  "alumnos": ["Alumno1", "Alumno2"]
};

// Obtener todos los cursos GET /api/cursos
const obtenerCursosBorrador = async (req, res) => {
  try {
    const cursos = await Curso.find();
    res.status(200).json(cursos);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener cursos", error });
  }
};

// Obtener un curso por ID GET /api/cursos/:id
const obtenerCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (curso) {
      res.status(200).json(curso);
    } else {
      res.status(404).json({ msg: "Curso no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener curso", error });
  }
};

// Editar un curso por ID PUT /api/cursos/:id
const editarCursoBorrador = async (req, res) => {
  try {
    const cursoActualizado = await Curso.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (cursoActualizado) {
      res.status(200).json({
        msg: "Curso actualizado",
        curso: cursoActualizado,
      });
    } else {
      res.status(404).json({ msg: "Curso no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar curso", error });
  }
};

// Borrar un curso por ID DELETE /api/cursos/:id
const borrarCursoBorrador = async (req, res) => {
  try {
    const cursoBorrado = await Curso.findByIdAndDelete(req.params.id);
    if (cursoBorrado) {
      res.status(200).json({ msg: "Curso borrado" });
    } else {
      res.status(404).json({ msg: "Curso no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al borrar curso", error });
  }
};

// Endpoints
const router = express.Router();

router.route("/")
    .get(obtenerCursosBorrador)
    .post(createCursoBorrador);

router.route("/:id")
    .get(obtenerCursoBorrador)
    .put(editarCursoBorrador)
    .delete(borrarCursoBorrador);

module.exports = router;
