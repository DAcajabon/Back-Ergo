'use strict'

var express = require('express');
var md_auth = require('../middlewares/authentication');
var projectController = require('../controllers/projectController');

var api = express.Router();

api.post('', md_auth.ensureAuth, projectController.addProject);
api.get('', md_auth.ensureAuth, projectController.getProjects);
api.get('/:id', md_auth.ensureAuth, projectController.getProject);
api.put('/:id', md_auth.ensureAuth, projectController.editProject);
api.delete('/:id', md_auth.ensureAuth, projectController.deleteProject);

module.exports = api;
