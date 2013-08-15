
/**
 * Publications JS API
 * Document Model
 * Michael Kelly and Carlos Paelinck
 */

var express = require('express'),
    mongoose = require('mongoose');

var Schema = mongoose.Schema;

var documentSchema = new Schema({
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true, unique: false },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    modified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);