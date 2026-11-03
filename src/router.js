// src/router.js
import { Router } from 'express';
import { getBooksHandler, getBookByIdHandler } from './controllers/books.js';

const router = Router();

router.get('/books', getBooksHandler);
router.get('/books/:id', getBookByIdHandler);

export default router;