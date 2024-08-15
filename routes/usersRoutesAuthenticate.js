const express = require("express");
const User = require("../models/user");
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

const authenticate = async (req, res) => {
  let cuerpoRequest = req.body; //mensaje que me envía el cliente para autenticar ej. {username:

  const _user = await User.findOne({ curp: cuerpoRequest.curp });
  if (_user) {
    console.log("Usuario encontrado");
    let passwordGuardado = _user.password;
    bcrypt.compare(cuerpoRequest.password, passwordGuardado, (err, result) => {
      if (result === false) {
        return res.status(401).json({
          message: "Usuario o contraseña incorrectos",
        });
      } else {
        console.log("Contraseña correcta");
        const payload = {
          user: _user,
        };
        const token = jwt.sign(payload, "A$per6uer.47", { expiresIn: "10" });
        res.status(200).json({
          message: "Usuario autentificado",
          username: _user.username,
          role: _user.role,
          token: token,
        });
      }
    });
  } else {
    console.log("Usuario no encontrado");
    res.status(401).json({
      message: "Usuario o contraseña incorrectos",
    });
  }
};

// inicia CRUD functions

// Crear un nuevo usuario POST /api/users
const createUser = async (req, res) => {
  // endpoint para crear un usuario

  let cuerpoRequest = req.body;
  try {
    //   User.exists({ username: cuerpoRequest.username }, (err, doc) => {
    const _userCURP = await User.exists({
      curp: cuerpoRequest.curp,
    });
    // const _userPassword = await User.exists({
    //   password: cuerpoRequest.password,
    // });
    const _userCorreo = await User.exists({
      correoElectronico: cuerpoRequest.correoElectronico,
    });
    console.log("inicia logicas de validacion");

    if (_userCURP != undefined || _userCorreo != undefined) {
      // alerta de mensaje de que el usuario ya existe
      console.log(err);
      // alert("El CURP o el Correo ya existen");

      return res.status(400).json({
        ok: false,
        message: "El usuario ya existe",
        // mandar ventana de alerta de que el usuario ya existe
      });
    } else {
      // Verificar si alguno de los campos requeridos está vacío
      const requiredFields = [
        "nombre",
        "apellidos",
        "ciudad",
        "correoElectronico",
        "curp",
        "password",
        "rol",
      ];

      const missingFields = [];
      requiredFields.map((field) => {
        if (!cuerpoRequest[field]) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Los campos: (${missingFields.join(
            ", "
          )}) estan vacios y son obligatorios`,
        });
      }

      // Verificar si se subió un archivo para el logo (si aplica)
      // const logo = req.file ? req.file.path : null;
      bcrypt.hash(cuerpoRequest.password, 10, async (err, hash) => {
        const User_Object_New = new User({
          nombre: cuerpoRequest.nombre,
          apellidos: cuerpoRequest.apellidos,
          ciudad: cuerpoRequest.ciudad,
          correoElectronico: cuerpoRequest.correoElectronico,
          curp: cuerpoRequest.curp,
          password: hash,
          rol: cuerpoRequest.rol,
          calificaciones: cuerpoRequest.calificaciones || [],
          conferencias: cuerpoRequest.conferencias || [],
          fechaIngreso: cuerpoRequest.fechaIngreso || Date.now(),
          cursos: cuerpoRequest.cursos || [],
        });

        await User_Object_New.save().then((createdUser) => {
          console.log(createdUser._id);
          if (createdUser) {
            res.status(201).json({
              message: "Usuario creado",
              userID: createdUser._id,
            });
          } else {
            res.status(500).json({
              message: "Error al crear el usuario",
            });
          }
        });
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario", error });
  }
};

const ejemploCreateUser = `{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "ciudad": "Ciudad de México",
  "correoElectronico": "
  "curp": "JUAP800101HDFRNN09",
  "password": "123456",
  "rol": "Alumno",
  "calificaciones": [90, 85, 88],
  "conferencias": ["Conferencia 1", "Conferencia 2"],
  "cursos": ["Curso 1", "Curso 2"]
}`;

// Obtener todos los usuarios GET /api/users
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener usuarios", error });
  }
};
// Obtener un usuario por ID GET /api/users/:id
const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ msg: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener usuario", error });
  }
};

// Editar un usuario por ID
const editarUsuario = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      rest.password = await bcrypt.hash(password, salt);
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      rest,
      { new: true }
    );

    if (usuarioActualizado) {
      res.status(200).json({
        msg: "Usuario actualizado",
        usuario: usuarioActualizado,
      });
    } else {
      res.status(404).json({ msg: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar usuario", error });
  }
};

// Borrar un usuario por ID
const borrarUsuario = async (req, res) => {
  try {
    const usuarioBorrado = await User.findByIdAndDelete(req.params.id);
    if (usuarioBorrado) {
      res.status(200).json({ msg: "Usuario borrado" });
    } else {
      res.status(404).json({ msg: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al borrar usuario", error });
  }
};

// asignar curso a un usuario
const asignarCurso = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (usuario) {
      usuario.cursos.push(req.params.cursoid);
      await usuario.save();
      res.status(200).json({ msg: "Curso asignado" });
    } else {
      res.status(404).json({ msg: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al asignar curso", error });
  }
};

const recoverPassword = async (req, res) => {
  try {
    const { correoElectronico } = req.body;
    const user = await User.findOne({ correoElectronico });
    if (user) {
      res.status(200).json({
        message: "Se ha enviado un correo para recuperar tu contraseña",
        // aquí enviar correo con enlace para recuperar contraseña
      });
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar contraseña", error });
  }
};

//endpoints
const router = express.Router();

router
  .route("/")
  // .post(upload.single("logo"), createUser) // with  this endpoint we can create
  .get(obtenerUsuarios)
  .post(createUser);
router
  .route("/:id")
  .get(obtenerUsuario)
  .put(editarUsuario)
  .delete(borrarUsuario);

router.route("/:id/:cursoid").put(asignarCurso);

router.route("/authenticate").post(authenticate);
router.route("/recover-password").post(recoverPassword);

// authenticate debe de llevar un body con username y password

module.exports = router;
