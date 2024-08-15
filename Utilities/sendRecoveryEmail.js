// import { createTransport } from "nodemailer";

// import { config } from "dotenv"; //dotenv es un middleware que nos permite cargar variables de entorno

const nodemailer = require("nodemailer");
const { createTransport } = nodemailer;
const { config } = require("dotenv");

// const { resolve } = require("path");

config({ path: "../config.env" }); //cargamos las variables de entorno

const sendRecoveryEmail = async (email, token) => {
  // let transporter = createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  let transporter = nodemailer.createTransport({
    // host: "live.smtp.mailtrap.io",
    // port: 587,
    // auth: {
    //   user: process.env.EMAIL_USER,
    //   pass: process.env.EMAIL_PASS,
    // },
    //  })
    // var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "622022455d39b4",
      pass: "4cca3629946b55",
    },
    // });
  });

  let mailOptions = {
    from: "info@demomailtrap.com",
    //process.env.EMAIL_USER,
    to: email,
    subject: "Recuperación de contraseña",
    text: `Haz clic en el siguiente enlace para recuperar tu contraseña: http://localhost:3001/api/users/reeset-password/token=${token}`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendRecoveryEmail;
