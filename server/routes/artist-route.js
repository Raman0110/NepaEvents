const express = require("express");
const { addArtist, getAllArtist, getArtistById, deleteArtist, updateArtist } = require("../controller/artist-controller");
const verifyToken = require("../middleware/verify-token.js");
const router = express.Router();

router.post('/',verifyToken,  addArtist);
router.get('/', getAllArtist);
router.get('/:id', getArtistById);
router.delete('/:id', deleteArtist);
router.patch('/:id', updateArtist)

module.exports = router;