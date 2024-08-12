const express = require("express");
// const router = express.Router();
const User = require("../models/user"); // Asegúrate de que la ruta sea correcta
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

// inicia CRUD functions
// Crear un nuevo usuario POST /api/users

const createUser = async (req, res) => {
  let cuerpoRequest = req.body;

  const _user = await User.exists({
    correoElectronico: cuerpoRequest.correoElectronico,
  });

  if (_user) {
    return res.status(400).json({
      ok: false,
      message: "El usuario ya existe",
    });
  } else {
    // Verificar si se subió un archivo para el logo (si aplica)
    const logo = req.file ? req.file.path : null;

    // Crear un nuevo objeto de tipo User
    const User_Object_New = new User({
      nombre: cuerpoRequest.nombre,
      apellidos: cuerpoRequest.apellidos,
      ciudad: cuerpoRequest.ciudad,
      correoElectronico: cuerpoRequest.correoElectronico,
      curp: cuerpoRequest.curp,
      rol: cuerpoRequest.rol,
      calificaciones: cuerpoRequest.calificaciones || [],
      conferencias: cuerpoRequest.conferencias || [],
      fechaIngreso: cuerpoRequest.fechaIngreso || Date.now(),
      cursos: cuerpoRequest.cursos || [],
    });

    // Ejemplo de cuerpoRequest
    // {
    //     "nombre": "Juan",
    //     "apellidos": "Pérez",
    //     "ciudad": "Ciudad de México",
    //     "correoElectronico": "juan.perez@example.com",
    //     "curp": "JUAP800101HDFRNN09",
    //     "rol": "Alumno",
    //     "calificaciones": [90, 85, 88],
    //     "conferencias": ["Conferencia 1", "Conferencia 2"],
    //     "cursos": ["Curso 1", "Curso 2"]
    // }

    await User_Object_New.save().then((createdUser) => {
      console.log(createdUser._id);
      if (createdUser) {
        res.status(201).json({
          msg: "Usuario creado",
          UserID: createdUser._id,
        });
      } else {
        res.status(500).json({
          msg: "Error al crear usuario",
        });
      }
    });
  }
};
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
    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
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
// const editarUsuario = async (req, res) => {
//   let cuerpoRequest = req.body;
//   try {
//     const result = await Servicio.updateOne(
//       { _id: req.params.id },
//       {
//         $set: {
//           nombre: cuerpoRequest.nombre,
//           apellidos: cuerpoRequest.apellidos,
//           ciudad: cuerpoRequest.ciudad,
//           correoElectronico: cuerpoRequest.correoElectronico,
//           curp: cuerpoRequest.curp,
//           rol: cuerpoRequest.rol,
//           calificaciones: cuerpoRequest.calificaciones || [],
//           conferencias: cuerpoRequest.conferencias || [],
//           fechaIngreso: cuerpoRequest.fechaIngreso || Date.now(),
//           cursos: cuerpoRequest.cursos || [],
//         },
//       }
//     );

//     if (result.nModified > 0) {
//       res.status(200).json({
//         msg: "Usuario actualizado",
//       });
//     } else {
//       res.status(404).json({
//         msg: "Usuario no encontrado o no se realizaron cambios",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       msg: "Error al actualizar usuario",
//       error: error.message,
//     });
//   }
// };

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

module.exports = router;

// // const createServicio = async (req, res) => {
// //   let cuerpoRequest = req.body;

// //   const _servicio = await Servicio.exists({
// //     nombreServicio: cuerpoRequest.nombreServicio,
// //   });

// //   if (_servicio) {
// //     return res.status(400).json({
// //       ok: false,
// //       message: "El servicio ya existe",
// //     });
// //   } else {
// //     // funcion ternaria para verificar si se subió un archivo. Funciona asi:
// //     // si req.file existe, entonces logo = req.file.path, si no, logo = null

// //     const logo = req.file ? req.file.path : null;

// //     // se crea un nuev objeto de tipo Serv
// //     const Servicio_Object_New = new Servicio({
// //       nombreServicio: cuerpoRequest.nombreServicio,
// //       nombreCompania: cuerpoRequest.nombreCompania,
// //       numeroContrato: cuerpoRequest.numeroContrato,
// //       frecuenciaPago: cuerpoRequest.frecuenciaPago,
// //       costoPorPago: cuerpoRequest.costoPorPago,
// //       idFraccionamiento: cuerpoRequest.idFraccionamiento,
// //       nombreFraccionamiento: cuerpoRequest.nombreFraccionamiento,
// //       logo: String(logo),
// //     });

// //     //Ejemplo
// //     // {
// //     //     "nombreServicio": "Electricidad",
// //     //     "nombreCompania": "CFE",
// //     //     "numeroContrato": "123456789",
// //     //     "frecuenciaPago": "Mensual",
// //     //     "costoPorPago": 500,
// //     //     "idFraccionamiento": "FRACC001",
// //     //     "nombreFraccionamiento": "Fraccionamiento Los Pinos"
// //     //   }

// //     await Servicio_Object_New.save().then((createdService) => {
// //       console.log(createdService._id);
// //       if (createdService) {
// //         res.status(201).json({
// //           msg: "Servicio creado",
// //           ServiceID: createdService._id,
// //         });
// //       } else {
// //         res.status(500).json({
// //           msg: "Error al crear servicio",
// //         });
// //       }
// //     });
// //   }
// // };

// // const getAll = async (req, res) => {
// //   const servs = await Servicio.find({}); //esto me trae todos los servicios
// //   res.status(200).json({
// //     servicios: servs,
// //   });
// // };

// // const getServicio = async (req, res) => {
// //   console.log(req.params);
// //   const id = req.params.id;

// //   const servicioEncontrado = await Servicio.find(
// //     { _id: id },
// //     {
// //       nombreServicio: 1,
// //       nombreCompania: 1,
// //       numeroContrato: 1,
// //       frecuenciaPago: 1,
// //       costoPorPago: 1,
// //       idFraccionamiento: 1,
// //       nombreFraccionamiento: 1,
// //       // logo, 1
// //     }
// //   );
// //   if (servicioEncontrado) {
// //     res.status(200).json({
// //       servicio: servicioEncontrado,
// //     });
// //   }
// // };

// const updateServicio = async (req, res) => {
//   let cuerpoRequest = req.body;

//   return Servicio.updateOne(
//     { _id: req.params.id },
//     {
//       $set: {
//         nombreServicio: cuerpoRequest.nombreServicio,
//         nombreCompania: cuerpoRequest.nombreCompania,
//         numeroContrato: cuerpoRequest.numeroContrato,
//         frecuenciaPago: cuerpoRequest.frecuenciaPago,
//         costoPorPago: cuerpoRequest.costoPorPago,
//         idFraccionamiento: cuerpoRequest.idFraccionamiento,
//         nombreFraccionamiento: cuerpoRequest.nombreFraccionamiento,
//         // logo: logo,
//       },
//     }
//   ).then((result) => {
//     res.status(200).json({
//       msg: "Servicio actualizado",
//     });
//   });
// };

// const delServicio = async (req, res) => {
//   console.log(req.params);
//   const id = req.params.id;

//   const servicioEliminado = await Servicio.deleteOne(
//     { _id: id },
//     {
//       Fraccname: 1,
//       direccion: 1,
//       NumeroCasas: 1,
//       tipoFraccionamiento: 1,
//       zonasInteres: 1,
//       casasHabitadas: 1,
//       // logo, 1
//     }
//   );
//   if (servicioEliminado) {
//     res.status(200).json({
//       servicio: servicioEliminado,
//       msg: "Servicio eliminado",
//     });
//   }
// };

// const router = express.Router();
// //endpoints
// router
//   .route("/")
//   // .post(createServicio) // with  this endpoint we can create a Serv
//   .post(upload.single("logo"), createServicio) // with  this endpoint we can create
//   .get(getAll); // with  this endpoint we can get all Serv

// router
//   .route("/:id")

//   // Patch y PUT son para actualizar
//   .patch(updateServicio) //  with  this endpoint we can update
//   .put(updateServicio) //  with  this endpoint we can update

//   // Delete requires the id of the Servicio
//   .delete(delServicio) //  with  this endpoint we can delete

//   // Get requires the id of the Servicio
//   .get(getServicio); //

// router.route("/").get(getUsers);

// module.exports = router;
