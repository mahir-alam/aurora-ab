require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.warn('MongoDB unavailable (sessions disabled):', err.message));
}

app.use('/api/aurora',      require('./routes/aurora'));
app.use('/api/locations',   require('./routes/locations'));
app.use('/api/ai',          require('./routes/ai'));
app.use('/api/directions',  require('./routes/directions'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'running', message: 'AuroraAB backend is alive' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
