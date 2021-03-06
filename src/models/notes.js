'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notesSchema = Schema({
    title: String, //Titulo de la nota
    content: String, //contenido de la nota
    owner: { type: Schema.Types.ObjectId, ref: 'User' } //propietario de la nota
});

module.exports = mongoose.model('Note', notesSchema);