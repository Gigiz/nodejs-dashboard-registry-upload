const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const registrySchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  birthCity: {
    type: String,
    required: true,
  },
  taxCode: {
    type: String,
    required: true,
  },
});

const registryFields = [
  'firstName',
  'lastName',
  'birthDate',
  'birthCity',
  'taxCode',
];

module.exports = {
  Registry: mongoose.model('Registry', registrySchema),
  registryFields,
}