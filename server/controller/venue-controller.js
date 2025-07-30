const Venue = require('../models/venue-model')
const User = require('../models/user-model');
const VenueBooking = require('../models/venue-booking-model');

const createVenue = async (req, res) => {
    console.log(req.body);
    try {
        const { name, location, capacity, price, locationCoordinates} = req.body;
        const priceNumber = parseFloat(price);
        const image = req.file ? req.file.path : null; // Ensure image is stored
        if (!image) {
            return res.status(400).json({ message: 'Image is required' });
        }
        const newVenue = await Venue.create({ name, location, capacity, image, price: priceNumber, locationCoordinates });
        res.status(201).json({
            success: true,
            message: 'Venue booked successfully',
            venue: newVenue
        });
    } catch (error) {
        console.error('Error booking venue:', error);
        res.status(500).json({ message: 'Error booking venue', error: error.message });
    }
};

const getAllVenues = async (req, res) => {
    try {
        // Get query parameter for date (optional)
        const { date } = req.query;
        const selectedDate = date ? new Date(date) : new Date();
        
        // Get all venues
        const venues = await Venue.find();
        
        // Get all approved bookings that haven't been rejected
        const approvedBookings = await VenueBooking.find({
            status: "approved",
            "eventDetails.date": { 
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)), 
                $lte: new Date(selectedDate.setHours(23, 59, 59, 999)) 
            }
        });
        
        // Create a set of booked venue IDs
        const bookedVenueIds = new Set(approvedBookings.map(booking => booking.venue.toString()));
        
        // Add booking status to each venue
        const venuesWithStatus = venues.map(venue => {
            const venueObj = venue.toObject();
            venueObj.isBooked = bookedVenueIds.has(venue._id.toString());
            
            // Find the booking for this venue if it exists
            const booking = approvedBookings.find(b => b.venue.toString() === venue._id.toString());
            if (booking) {
                venueObj.bookedBy = booking.organizer;
                venueObj.bookingDate = booking.eventDetails.date;
                venueObj.bookingId = booking._id;
            }
            
            return venueObj;
        });
        
        res.status(200).json(venuesWithStatus);
    } catch (error) {
        console.error("Error getting venues:", error);
        res.status(500).json({ message: "Error getting venues", error: error.message });
    }
};

const updateVenue = async (req, res) => {
    try {
        const { name, location, capacity } = req.body;
        const image = req.file ? req.file.path : null;
        const newVenueData = {
            name,
            location,
            capacity,
            image,
        };
        const updatedVenue = await Venue.findByIdAndUpdate(
            req.params.venueId,
            newVenueData,
            { new: true }
        );

        if (!updatedVenue) {
            return res.status(404).json({ message: "Venue not found" });
        }

        res.status(200).json({ success: true, message: "Venue updated successfully", updatedVenue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};

const deleteVenue = async (req, res) => {
    try {
        const venueToDelete = await Venue.findByIdAndDelete(req.params.id)
        if (!venueToDelete) {
            return res.status(404).json({ success: false, message: "Venue not found" });
        }
        res.status(200).json({ sucess: true, message: "Venue deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }

}

const getVenueById = async (req, res) => {
    try {
        const id = req.params.id;
        const venue = await Venue.findById(id);
        
        if (!venue) {
            return res.status(404).json({ success: false, message: "Venue not found" });
        }
        
        // Check if the venue is booked
        const { date } = req.query;
        const selectedDate = date ? new Date(date) : new Date();
        
        const booking = await VenueBooking.findOne({
            venue: id,
            status: "approved",
            "eventDetails.date": { 
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)), 
                $lte: new Date(selectedDate.setHours(23, 59, 59, 999))
            }
        }).populate("organizer", "fullName email");
        
        const venueWithStatus = venue.toObject();
        venueWithStatus.isBooked = !!booking;
        if (booking) {
            venueWithStatus.bookedBy = booking.organizer;
            venueWithStatus.bookingDate = booking.eventDetails.date;
            venueWithStatus.bookingId = booking._id;
        }
        
        res.status(200).json({ success: true, data: venueWithStatus });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
}

// Check venue availability for a specific date
const checkVenueAvailability = async (req, res) => {
    try {
        const { venueId, date } = req.params;
        
        if (!venueId || !date) {
            return res.status(400).json({ success: false, message: "Venue ID and date are required" });
        }
        
        const selectedDate = new Date(date);
        
        // Check if there are any approved bookings for this venue on the selected date
        const existingBooking = await VenueBooking.findOne({
            venue: venueId,
            status: "approved",
            "eventDetails.date": { 
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)), 
                $lte: new Date(selectedDate.setHours(23, 59, 59, 999))
            }
        }).populate("organizer", "fullName email");
        
        if (existingBooking) {
            return res.status(200).json({
                success: true,
                available: false,
                message: "Venue is already booked for this date",
                booking: {
                    id: existingBooking._id,
                    date: existingBooking.eventDetails.date,
                    bookedBy: existingBooking.organizer
                }
            });
        }
        
        res.status(200).json({
            success: true,
            available: true,
            message: "Venue is available for this date"
        });
        
    } catch (error) {
        console.error("Error checking venue availability:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add venue to favorites
const addFavoriteVenue = async (req, res) => {
    try {
        const venueId = req.params.id;
        const userId = req.user.user._id;; 
  
   // Check if venue exists
   const venue = await Venue.findById(venueId);
   if (!venue) {
       return res.status(404).json({ message: 'Venue not found' });
   }

   // Add to favorites
   const user = await User.findByIdAndUpdate(
       userId,
       { $addToSet: { favoriteVenues: venueId } },
       { new: true }
   ).populate('favoriteVenues');

   res.status(200).json({
       success: true,
       message: 'Venue added to favorites',
       favoriteVenues: user.favoriteVenues
   });
} catch (error) {
   console.error('Error adding favorite venue:', error);
   res.status(500).json({ message: 'Server error', error: error.message });
}
};

  // Remove venue from favorites
const removeFavoriteVenue = async (req, res) => {
    try {
      const venueId = req.params.id;
        const userId = req.user.user._id;; 
  
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { favoriteVenues: venueId } },
        { new: true }
      ).populate('favoriteVenues');
  
      res.status(200).json({
        success: true,
        message: 'Venue removed from favorites',
        favoriteVenues: user.favoriteVenues
      });
    } catch (error) {
      console.error('Error removing favorite venue:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  // Get user's favorite venues
const getFavoriteVenues = async (req, res) => {
    try {
      const userId = req.user.user._id;; 
  
      const user = await User.findById(userId).populate('favoriteVenues');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(user.favoriteVenues);
    } catch (error) {
      console.error('Error getting favorite venues:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

module.exports = { createVenue, getAllVenues, updateVenue, deleteVenue, getVenueById, addFavoriteVenue, removeFavoriteVenue, getFavoriteVenues, checkVenueAvailability };