"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const characterController_1 = require("../controllers/characterController");
const router = (0, express_1.Router)();
// GET /api/characters
router.get('/', characterController_1.getAllCharacters);
// GET /api/characters/:id
router.get('/:id', characterController_1.getCharacterById);
// POST /api/characters
router.post('/', characterController_1.createCharacter);
// PUT /api/characters/:id
router.put('/:id', characterController_1.updateCharacter);
// DELETE /api/characters/:id
router.delete('/:id', characterController_1.deleteCharacter);
// POST /api/characters/generate/start
router.post('/generate/start', characterController_1.startGeneration);
// POST /api/characters/generate/stop
router.post('/generate/stop', characterController_1.stopGeneration);
exports.default = router;
