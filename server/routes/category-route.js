const express = require("express");
const { createCategory, getAllCategory, updateCategory, deleteCategory, getCategoryById } = require("../controller/category-controller.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const CategoryRouter = express.Router();

const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

CategoryRouter.post('/', upload.single('image'), createCategory)
CategoryRouter.get('/', getAllCategory)
CategoryRouter.patch('/:id', upload.single('image'), updateCategory)
CategoryRouter.delete('/:id', deleteCategory)
CategoryRouter.get('/:id', getCategoryById)


module.exports = CategoryRouter;