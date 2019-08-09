'use strict'

var express = require('express');
var md_auth = require('../middlewares/authentication');
var taskController = require('../controllers/taskController');

var api = express.Router();

api.post('/', md_auth.ensureAuth, taskController.addTask);
api.get('/:id', md_auth.ensureAuth, taskController.getTask);
api.get('/', md_auth.ensureAuth, taskController.getTasks);
api.put('/:id', md_auth.ensureAuth, taskController.editTask);
api.delete('/:id', md_auth.ensureAuth, taskController.deleteTask);
api.get('/project/:id', md_auth.ensureAuth, taskController.getProjectTasks);

module.exports = api;
