const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const Admin = require("../models/admin");

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

// Crear un nuevo admin POST /api/admins
const createAdmin = async (req, res) => {
  let cuerpoRequest = req.body;
  try {
    const _adminCorreo = await Admin.exists({
      correoElectronico: cuerpoRequest.correoElectronico,
    });

    if (_adminCorreo) {
      return res.status(400).json({
        ok: false,
        message: "El correo electrónico ya está en uso",
      });
    } else {
      // Verificar si alguno de los campos requeridos está vacío
      const requiredFields = [
        "nombre",
        "apellidos",
        "correoElectronico",
        "password",
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

      // Si todos los campos están llenos, proceder con la creación del admin
      bcrypt.hash(cuerpoRequest.password, 10, async (err, hash) => {
        const Admin_Object_New = new Admin({
          nombre: cuerpoRequest.nombre,
          apellidos: cuerpoRequest.apellidos,
          correoElectronico: cuerpoRequest.correoElectronico,
          password: hash,
          rol: cuerpoRequest.rol,
          fechaIngreso: cuerpoRequest.fechaIngreso,
        });

        await Admin_Object_New.save().then((createdAdmin) => {
          if (createdAdmin) {
            res.status(201).json({
              message: "Admin creado",
              adminID: createdAdmin._id,
            });
          } else {
            res.status(500).json({
              message: "Error al crear el admin",
            });
          }
        });
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al crear el admin", error });
  }
};

const ejemploCreateAdmin = `{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "correoElectronico": "juan.perez@example.com",
  "password": "123456",
  "rol": "Admin",
  "fechaIngreso": "2023-11-01T00:00:00.000Z"
}`;

const authenticate = async (req, res) => {
  let cuerpoRequest = req.body; //mensaje que me envía el cliente para autenticar ej. {username:

  const _user = await User.findOne({ username: cuerpoRequest.username });
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
          message: "Usuario autenticado",
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

// Obtener todos los admins GET /api/admins
const obtenerAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener admins", error });
  }
};

// Obtener un admin por ID GET /api/admins/:id
const obtenerAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (admin) {
      res.status(200).json(admin);
    } else {
      res.status(404).json({ msg: "Admin no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener admin", error });
  }
};

// Editar un admin por ID PUT /api/admins/:id
const editarAdmin = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    // If password is not being updated then dont hash it, else hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      rest.password = await bcrypt.hash(password, salt);
    } else {
      delete rest.password;
    } // if password is not being updated then delete it from the object

    const adminActualizado = await Admin.findByIdAndUpdate(
      req.params.id,
      rest, // Use 'rest' instead of 'req.body'
      { new: true }
    );

    if (adminActualizado) {
      res.status(200).json({
        msg: "Admin actualizado",
        admin: adminActualizado,
      });
    } else {
      res.status(404).json({ msg: "Admin no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar admin", error });
  }
};

// Borrar un admin por ID DELETE /api/admins/:id
const borrarAdmin = async (req, res) => {
  try {
    const adminBorrado = await Admin.findByIdAndDelete(req.params.id);
    if (adminBorrado) {
      res.status(200).json({ msg: "Admin borrado" });
    } else {
      res.status(404).json({ msg: "Admin no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al borrar admin", error });
  }
};

// Endpoints
const router = express.Router();

router.route("/").get(obtenerAdmins).post(createAdmin);

router.route("/:id").get(obtenerAdmin).put(editarAdmin).delete(borrarAdmin);

module.exports = router;
