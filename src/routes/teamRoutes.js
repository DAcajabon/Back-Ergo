'use strict'

var express = require('express');
var md_auth = require('../middlewares/authentication');
var teamController = require('../controllers/teamController');

var api = express.Router();

api.get('', teamController.listTeams);
api.get('/:id', teamController.getTeam);
api.get('/user', md_auth.ensureAuth, teamController.userTeams)
api.post('', md_auth.ensureAuth, teamController.createTeam);
api.put('/:id', md_auth.ensureAuth, teamController.editTeam);
api.put('/:teamId/integrant/:integrantId/supervisor/:supervisorId', md_auth.ensureAuth, teamController.addIntegrant);
api.delete('/:teamId', md_auth.ensureAuth, teamController.deleteTeam);
api.delete('/:teamId/member/:memberId', md_auth.ensureAuth, teamController.removeMember);

module.exports = api;
