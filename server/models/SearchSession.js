const mongoose = require('mongoose');

const searchSessionSchema = new mongoose.Schema({
  userLocation: { type: String, default: 'Unknown' },
  userLat:      { type: Number, required: true },
  userLng:      { type: Number, required: true },
  kpAtSearch:   { type: Number, required: true },
  topLocation:  { type: String, required: true },
  viewingScore: { type: Number, required: true },
  searchedAt:   { type: Date, default: Date.now },
}, { bufferCommands: false });

module.exports = mongoose.model('SearchSession', searchSessionSchema);
