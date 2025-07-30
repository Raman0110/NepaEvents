const Artist = require("../models/artist-model.js");

const addArtist = async (req, res) => {
  try {
    await Artist.create(req.body);
    res.status(201).json({ message: "Artist added successfully" });
  } catch (error) {
    console.error('Error creating an artist:', error);
    res.status(500).json({ message: 'Error creating an artist', error: error.message });
  }
};

const getAllArtist = async (req, res) => {
  try {
    const users = await Artist.find();
    res.status(201).json({ data: users });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ message: 'Error fetching artists', error: error.message });
  }
};

const getArtistById = async (req, res) => {
  try {
    const user = await Artist.findById(req.params.id);
    res.status(201).json({ data: user });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ message: 'Error fetching artist', error: error.message });
  }
};

const deleteArtist = async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.status(201).json({ message: "Artist deleted successfully" });
  } catch (error) {
    console.error('Error deleting an artist:', error);
    res.status(500).json({ message: 'Error deleting an artist', error: error.message });
  }
};

const updateArtist = async (req, res) => {
  try {
    await Artist.findByIdAndUpdate(req.params.id, req.body);
    res.status(201).json({ message: "Artist updated successfully" });
  } catch (error) {
    console.error('Error updating an artist:', error);
    res.status(500).json({ message: 'Error updating an artist', error: error.message });
  }
};

module.exports = { addArtist, getAllArtist, getArtistById, deleteArtist, updateArtist };
