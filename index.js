const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// File path for data.json
const dataPath = path.join(__dirname, 'data.json');

// Utility function to read and write data.json
const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// 1. Create a New Book (POST /books)
app.post('/books', (req, res) => {
  const { book_id, title, author, genre, year, copies } = req.body;

  if (!book_id || !title || !author || !genre || !year || !copies) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const books = readData();
  const bookExists = books.some((book) => book.book_id === book_id);

  if (bookExists) {
    return res.status(400).json({ error: 'Book ID already exists' });
  }

  const newBook = { book_id, title, author, genre, year, copies };
  books.push(newBook);
  writeData(books);

  res.status(201).json(newBook);
});

// 2. Retrieve All Books (GET /books)
app.get('/books', (req, res) => {
  const books = readData();
  res.json(books);
});

// 3. Retrieve a Specific Book by ID (GET /books/:id)
app.get('/books/:id', (req, res) => {
  const books = readData();
  const book = books.find((b) => b.book_id === req.params.id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.json(book);
});

// 4. Update Book Information (PUT /books/:id)
app.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const books = readData();
  const bookIndex = books.findIndex((b) => b.book_id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books[bookIndex] = { ...books[bookIndex], ...updates };
  writeData(books);

  res.json(books[bookIndex]);
});

// 5. Delete a Book (DELETE /books/:id)
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;

  const books = readData();
  const bookIndex = books.findIndex((b) => b.book_id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books.splice(bookIndex, 1);
  writeData(books);

  res.json({ message: 'Book deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});