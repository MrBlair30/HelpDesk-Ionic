const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incident.controller');

router.get('/', incidentController.getAll);
router.post('/', incidentController.create);
router.put('/:id', incidentController.update);
router.delete('/:id', incidentController.remove);

module.exports = router;
