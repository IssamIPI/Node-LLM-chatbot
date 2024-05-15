// src/controllers/apiController.js
const apiService = require('../services/apiService');

exports.exampleFunction = async (req, res) => {
  try {
    const userQuery = req.query.q;
    const result = await apiService.callExternalApi(userQuery);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
