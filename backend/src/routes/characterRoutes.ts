import { Router } from 'express';
import {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  startGeneration,
  stopGeneration
} from '../controllers/characterController';

const router = Router();

// GET /api/characters
router.get('/', getAllCharacters);

// GET /api/characters/:id
router.get('/:id', getCharacterById);

// POST /api/characters
router.post('/', createCharacter);

// PUT /api/characters/:id
router.put('/:id', updateCharacter);

// DELETE /api/characters/:id
router.delete('/:id', deleteCharacter);

// POST /api/characters/generate/start
router.post('/generate/start', startGeneration);

// POST /api/characters/generate/stop
router.post('/generate/stop', stopGeneration);

export default router; 