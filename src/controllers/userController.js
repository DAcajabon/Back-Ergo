"use strict";

var bcrypt = require("bcryptjs");
var jwt = require("../services/jwt");
var User = require("../models/user");
var path = require("path");
var fs = require("fs");
var Notifications = require('./notificationController');

function signUp(req, res) {
  var params = req.body;
  var user = new User();

  if (params.name && params.username && params.email && params.password) {
    user.name = params.name;
    user.lastName = params.lastName;
    user.username = params.username;
    user.email = params.email;
    user.password = params.password;
    user.image = null;
    user.notifications = 0;

    User.find({ $or: [{ username: user.username }, { email: user.email }] }).exec((err, users) => {
      if (err) return res.status(500).send({ message: 'Error en la petición' });
      if (users && users.length >= 1) {
        if (users[0].username == user.username) return res.status(500).send({ message: `El nombre de usuario '${user.username}' ya esta registrado` });
        else if (users[0].email == user.email) return res.status(500).send({ message: `El correo '${user.email}' ya esta registrado` });
      } else {
        console.log(user);
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(params.password, salt, function (err, hash) {
            user.password = hash;

            user.save((err, storedUser) => {
              if (err) return res.status(500).send({ message: "Error en la peticion" });
              if (!storedUser) return res.status(404).send({ message: "El usuario no pudo ser creado" });
              else {
                delete storedUser.password;
                return res.status(200).send({ user: storedUser });
              }
            });
          });
        });
      }
    });

  } else return res.status(500).send({ message: "Debe llenar todos los datos" });
}

function login(req, res) {
  var params = req.body;
  var email = params.email;
  var password = params.password;

  User.findOne({ email: email }, (err, foundUser) => {
    if (err) return res.status(500).send({ message: "Error en la peticion" });

    if (!foundUser) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    } else {
      bcrypt.compare(password, foundUser.password, (err, check) => {
        if (!check) {
          return res.status(404).send({ message: "Contraseña incorrecta" });
        } else {
          foundUser.password = undefined;
          Notifications.count(foundUser._id, function(err, not){
            if(err) console.log(err);
            foundUser.notifications = not;
            return res.status(200).send({ user: foundUser, token: jwt.createToken(foundUser) });
          });
        }
      });
    }
  });
}

function getUser(req, res) {
  let idUser = req.user.sub;

  User.findOne({ _id: idUser }).exec((err, user) => {
    if (err) return res.status(500).send({ message: 'Error en la peticion' });

    if (!user) {
      return res.status(500).send({ message: 'Usuario no encontrado' });
    } else {
      return res.status(200).send({ user: user });
    }
  })
}

function editUser(req, res) {
  var userId = req.params.id;
  var params = req.body;

  if (req.user.sub != userId) {
    return res.status(500).send({ message: "No se puede editar al usuario" });
  }
  delete params.password;

  User.findByIdAndUpdate(
    userId,
    params,
    { new: true },
    (err, usuarioActualizado) => {
      if (err) return res.status(500).send({ message: "Error en la peticion" });

      if (!usuarioActualizado)
        return res
          .status(404)
          .send({
            message: "No se ha podido actualizar los datos del usuario"
          });
      usuarioActualizado.password = undefined;
      return res.status(200).send({ user: usuarioActualizado });
    }
  );
}

function deleteUser(req, res) {
  var userId = req.params.id;

  if (req.user.sub != userId) {
    return res.status(500).send({ message: "No se puede eliminar al usuario" });
  }

  User.findByIdAndRemove(userId, (err, usuarioEliminado) => {
    if (err) return res.status(500).send({ message: "Error en la peticion" });

    if (usuarioEliminado) {
      return res.status(200).send({
        user: usuarioEliminado
      });
    } else {
      return res.status(404).send({
        message: "No existe el usuario"
      });
    }
  });
}

function uploadImage(req, res) {
  var userId = req.user.sub;
  if (req.files) {
    var file_path = req.files.image.path;

    var file_split = file_path.split("\\");

    var file_name = file_split[3];

    var ext_split = file_name.split(".");

    var file_ext = ext_split[1];

    if (
      file_ext == "png" ||
      file_ext == "jpg" ||
      file_ext == "jpeg" ||
      file_ext == "gif"
    ) {
      User.findById(userId).exec((err, user)=>{
        if (err) return res.status(500).send({ message: " no se a podido actualizar el usuario" });
        if (!user) return res.status(404).send({ message: "error en los datos del usuario, no se pudo actualizar" });
        if(user.image != null){
          fs.unlink(`src\\uploads\\users\\` + user.image, err => {
            console.log('imagen borrada: ', user.image)
          });
        }
        User.findByIdAndUpdate(
          userId,
          { image: file_name },
          { new: true },
          (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ message: "No se a podido actualizar el usuario" });
            if (!usuarioActualizado) return res.status(404).send({ message: "error en los datos del usuario, no se pudo actualizar" });
            return res.status(200).send({ user: usuarioActualizado });
          }
        );
      })
    } else {
      return removeFilesOfUploads(res, file_path, "extension no valida");
    }
  }
}

function removeFilesOfUploads(res, file_path, message) {
  fs.unlink(file_path, err => {
    return res.status(200).send({ message: message });
  });
}

function getImage(req, res) {
  var image_file = req.params.nameImage;
  var path_file = "./src/uploads/users/" + image_file;

  fs.exists(path_file, exists => {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      res.status(200).send({ message: "no existe la imagen" });
    }
  });
}

function listUsers(req, res) {
  User.find({}).exec((err, userUsers) => {
    if (err) return res.status(500).send({ message: 'Error en la peticion' });
    return res.status(200).send({ users: userUsers });
  })
}

module.exports = {
  signUp,
  login,
  getUser,
  editUser,
  deleteUser,
  uploadImage,
  getImage,
  listUsers
};
