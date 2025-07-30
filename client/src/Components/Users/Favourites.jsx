import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHeart, FiCalendar, FiMapPin, FiClock, FiTrash2 } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const Favourites = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [favouriteEvents, setFavouriteEvents] = useState([]);
  const [favouriteVenues, setFavouriteVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCardId, setActiveCardId] = useState(null);

  // Check URL params for active tab on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'venues') {
      setActiveTab('venues');
    }
  }, [location]);

  // Fetch favorites based on active tab
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (activeTab === "events") {
          const response = await axios.get('http://localhost:3000/api/event/user/favorites', {
            withCredentials: true
          });
          setFavouriteEvents(response.data);
        } else {
          const response = await axios.get('http://localhost:3000/api/venue/user/favorites', {
            withCredentials: true
          });
          setFavouriteVenues(response.data);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, activeTab]);

  const removeFavouriteEvent = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/event/${id}/favorite`, {
        withCredentials: true
      });
      setFavouriteEvents(favouriteEvents.filter(event => event._id !== id));
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite event:", error);
      toast.error("Failed to remove from favorites");
    }
  };

  const removeFavouriteVenue = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/venue/${id}/favorite`, {
        withCredentials: true
      });
      setFavouriteVenues(favouriteVenues.filter(venue => venue._id !== id));
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite venue:", error);
      toast.error("Failed to remove from favorites");
    }
  };

  const handleCardClick = (id) => {
    setActiveCardId(id);
    // Reset active card after 200ms (for visual feedback)
    setTimeout(() => {
      setActiveCardId(null);
    }, 200);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL to reflect active tab
    navigate(`/favourites?tab=${tab}`);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FiHeart size={60} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">You're not logged in</h2>
          <p className="text-gray-500 mb-6">Log in to view and manage your favourites</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#ED4A43] text-white px-6 py-3 rounded-md hover:bg-[#D43C35] transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-[#ED4A43] mb-8 text-center relative">My Favourites</h1>
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            className={`px-6 py-2 rounded-md font-medium ${
              activeTab === "events" 
                ? "bg-white text-[#ED4A43] shadow-sm" 
                : "text-gray-600 hover:text-[#ED4A43]"
            }`}
            onClick={() => handleTabChange("events")}
          >
            Events
          </button>
          <button
            className={`px-6 py-2 rounded-md font-medium ${
              activeTab === "venues" 
                ? "bg-white text-[#ED4A43] shadow-sm" 
                : "text-gray-600 hover:text-[#ED4A43]"
            }`}
            onClick={() => handleTabChange("venues")}
          >
            Venues
          </button>
        </div>
      </div>

      {activeTab === "events" && (
        <>
          {favouriteEvents.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FiCalendar size={60} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No favourite events yet</h2>
              <p className="text-gray-500 mb-6">Browse events and add them to your favourites</p>
              <button
                onClick={() => navigate("/event")}
                className="bg-[#ED4A43] text-white px-6 py-3 rounded-md hover:bg-[#D43C35] transition-colors"
              >
                Explore Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouriteEvents.map((event) => (
                <div 
                  key={event._id} 
                  className={`bg-white rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                    activeCardId === event._id 
                      ? 'scale-98 shadow-inner bg-gray-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleCardClick(event._id)}
                >
                  <div className="relative">
                    <img 
                      src={`http://localhost:3000/${event.image}`} 
                      alt={event.title} 
                      className="w-full h-48 object-cover"
                    />
                    {event.category && (
                      <span className="absolute top-3 right-3 bg-white py-1 px-3 rounded-full text-sm font-medium text-gray-700">
                        {event.category}
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavouriteEvent(event._id);
                      }}
                      className="absolute top-3 left-3 bg-white p-2 rounded-full text-[#ED4A43] hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <FiHeart fill="#ED4A43" size={18} />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                    <div className="flex items-center text-gray-500 mb-2">
                      <FiCalendar className="mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center text-gray-500 mb-2">
                        <FiClock className="mr-2" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 mb-4">
                      <FiMapPin className="mr-2" />
                      <span>{event.location || event.venue?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {event.price ? (
                        <span className="text-[#ED4A43] font-bold">Rs. {event.price}</span>
                      ) : (
                        <span className="text-[#ED4A43] font-bold">Free</span>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/event/${event._id}`);
                        }}
                        className="bg-[#ED4A43] text-white px-4 py-2 rounded hover:bg-[#D43C35] active:bg-[#B8332D] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "venues" && (
        <>
          {favouriteVenues.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FaBuilding size={60} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No favourite venues yet</h2>
              <p className="text-gray-500 mb-6">Browse venues and add them to your favourites</p>
              <button
                onClick={() => navigate("/bookvenue")}
                className="bg-[#ED4A43] text-white px-6 py-3 rounded-md hover:bg-[#D43C35] transition-colors"
              >
                Explore Venues
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouriteVenues.map((venue) => (
                <div 
                  key={venue._id} 
                  className={`bg-white rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                    activeCardId === venue._id 
                      ? 'scale-98 shadow-inner bg-gray-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleCardClick(venue._id)}
                >
                  <div className="relative">
                    <img 
                      src={`http://localhost:3000/${venue.image}`} 
                      alt={venue.name} 
                      className="w-full h-48 object-cover"
                    />
                    {venue.type && (
                      <span className="absolute top-3 right-3 bg-white py-1 px-3 rounded-full text-sm font-medium text-gray-700">
                        {venue.type}
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavouriteVenue(venue._id);
                      }}
                      className="absolute top-3 left-3 bg-white p-2 rounded-full text-[#ED4A43] hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <FiHeart fill="#ED4A43" size={18} />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{venue.name}</h3>
                    <div className="flex items-center text-gray-500 mb-2">
                      <FiMapPin className="mr-2" />
                      <span>{venue.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500 mb-4">
                      <FaBuilding className="mr-2" />
                      <span>Capacity: {venue.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#ED4A43] font-bold">Rs. {venue.price}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/venue/${venue._id}`);
                        }}
                        className="bg-[#ED4A43] text-white px-4 py-2 rounded hover:bg-[#D43C35] active:bg-[#B8332D] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favourites;