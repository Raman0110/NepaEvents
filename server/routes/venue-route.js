const express = require("express");
const { createVenue, getAllVenues, updateVenue, deleteVenue, getVenueById, addFavoriteVenue,removeFavoriteVenue, getFavoriteVenues, checkVenueAvailability } = require('../controller/venue-controller');
const verifyToken = require("../middleware/verify-token");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


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
const venueRouter = express.Router();

venueRouter.post('/', upload.single("image"), createVenue)
venueRouter.get('/', getAllVenues)
venueRouter.patch('/:venueId', upload.single("image"), updateVenue)
venueRouter.delete('/:id', deleteVenue)
venueRouter.get('/:id', getVenueById)

venueRouter.post('/:id/favorite', verifyToken, addFavoriteVenue);
venueRouter.delete('/:id/favorite', verifyToken, removeFavoriteVenue);
venueRouter.get('/user/favorites', verifyToken, getFavoriteVenues);

// New endpoint to check venue availability for a specific date
venueRouter.get('/:venueId/availability/:date', checkVenueAvailability);

venueRouter.post('/bookVenue',)
module.exports = venueRouter;