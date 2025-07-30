import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// Icons
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaTicketAlt,
  FaStar,
  FaBuilding,
  FaArrowRight,
  FaSearch,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

// Images (replace with your actual paths)
import bgImage from "/public/images/bg-image.png";
import event1 from "/public/images/event1.png";
import event2 from "/public/images/event2.png";
import event3 from "/public/images/event3.png";
import event4 from "/public/images/event4.png";
import Footer from './Footer';

export const HomePage = () => {
  const navigate = useNavigate();
  const today = new Date();
  const options = { day: "numeric", month: "short", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  const { isLoggedIn, user } = useAuth();

  // State for recommended events
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for available venues
  const [venues, setVenues] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venuesError, setVenuesError] = useState(null);

  // State for categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  // State for today's events
  const [todayEvents, setTodayEvents] = useState([]);
  const [todayEventsLoading, setTodayEventsLoading] = useState(false);
  const [todayEventsError, setTodayEventsError] = useState(null);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/category");
        setCategories(response.data);
        setCategoriesError(null);
      } catch (error) {
        console.log(error);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Fetch today's events
  useEffect(() => {
    const fetchTodayEvents = async () => {
      setTodayEventsLoading(true);
      try {
        // Get today's date at start of day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Get today's date at end of day
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Format dates for query params
        const startISO = startOfDay.toISOString();
        const endISO = endOfDay.toISOString();

        // Fetch events for today
        const response = await axios.get('http://localhost:3000/api/event', {
          withCredentials: true
        });

        if (Array.isArray(response.data)) {
          // Filter events happening today
          const todaysEvents = response.data.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startOfDay && eventDate <= endOfDay;
          });

          setTodayEvents(todaysEvents);
        } else {
          console.error("Expected array but got:", typeof response.data);
          setTodayEvents([]);
        }

        setTodayEventsError(null);
      } catch (err) {
        console.error("Error fetching today's events:", err);
        setTodayEventsError("Failed to load today's events");
      } finally {
        setTodayEventsLoading(false);
      }
    };

    fetchTodayEvents();
  }, []);

  // Fetch recommended events
  useEffect(() => {
    const fetchRecommendedEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/event/recommendations', {
          withCredentials: true
        });

        if (Array.isArray(response.data)) {
          setRecommendedEvents(response.data);
        } else {
          console.error("Expected array but got:", typeof response.data);
          setRecommendedEvents([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedEvents();
  }, []);

  // Fetch available venues
  useEffect(() => {
    const fetchVenues = async () => {
      setVenuesLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/venue', {
          withCredentials: true
        });

        if (Array.isArray(response.data)) {
          setVenues(response.data);
        } else {
          console.error("Expected array of venues but got:", typeof response.data);
          setVenues([]);
        }

        setVenuesError(null);
      } catch (err) {
        console.error("Error fetching venues:", err);
        setVenuesError("Failed to load venues: " + (err.response?.data?.error || err.message));
      } finally {
        setVenuesLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Navigate to event details page
  const goToEventDetails = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // Navigate to venue details page
  const goToVenueDetails = (venueId) => {
    navigate(`/venue/${venueId}`);
  };

  // Sample events for the hero section (fallback data)
  const sampleEvents = [
    { img: event1, time: "7:00 PM", name: "Concert X", place: "Hyatt Regency" },
    { img: event2, time: "8:30 PM", name: "Live Performance", place: "Bhrikuti Mandap" },
    { img: event3, time: "6:00 PM", name: "Dancing Show", place: "Pragya Hall" },
    { img: event4, time: "9:00 PM", name: "Comedy Show", place: "Tudikhel" },
  ];

  // Function to format time from ISO date
  const formatEventTime = (dateString) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "TBA";
    }
  };

  // Get event image URL (handle both relative and absolute URLs)
  const getImageUrl = (imageUrl, defaultImage = event1) => {
    if (!imageUrl) return defaultImage;

    // If it's already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // If it's a relative path
    return `http://localhost:3000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  // Function to render event card
  const renderEventCard = (event, index, isApiEvent = false) => {
    const eventName = isApiEvent ? event.title || event.name : event.name;

    // Handle venue location properly
    let eventPlace = "Location not specified";
    if (isApiEvent) {
      if (event.venue) {
        if (typeof event.venue === 'object') {
          // Venue is populated as an object
          eventPlace = event.venue.name ?
            (event.venue.location ? `${event.venue.name}, ${event.venue.location}` : event.venue.name) :
            "Venue name not available";
        } else {
          // Venue is just an ID
          eventPlace = "Venue information not available";
        }
      } else if (event.location) {
        eventPlace = event.location;
      }
    } else {
      eventPlace = event.place || "Location not specified";
    }

    const eventTime = isApiEvent ? formatEventTime(event.date || event.startTime) : event.time;
    const eventImage = isApiEvent ? getImageUrl(event.coverImage || event.image) : event.img;
    const eventId = isApiEvent ? event._id : null;

    return (
      <div
        key={index}
        className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 cursor-pointer h-full"
        onClick={() => eventId && goToEventDetails(eventId)}
      >
        {/* Event Image Banner */}
        <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
          <img
            src={eventImage}
            alt={eventName}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = event1;
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ED4A43] transition-colors line-clamp-1">
            {eventName}
          </h3>
          <p className="flex items-center text-gray-300 mb-4 line-clamp-1">
            <FaMapMarkerAlt className="text-[#ED4A43] mr-2 flex-shrink-0" />
            <span className="truncate">{eventPlace}</span>
          </p>
          <button className="w-full flex items-center justify-center py-2 px-4 bg-transparent border-2 border-[#ED4A43] text-[#ED4A43] font-semibold rounded-lg group-hover:bg-[#ED4A43] group-hover:text-white transition-all duration-300">
            <FaTicketAlt className="mr-2" />
            {isApiEvent ? "View Details" : "Buy Ticket"}
          </button>
        </div>
      </div>
    );
  };

  // Function to render venue card
  const renderVenueCard = (venue, index) => {
    const venueName = venue.name || "Unnamed Venue";
    const venueLocation = venue.location || venue.address || "Location not specified";
    const venueCapacity = venue.capacity || "Unspecified";
    const venueImage = getImageUrl(venue.image, event1);
    const isBooked = venue.isBooked || false;

    return (
      <div
        key={index}
        className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 cursor-pointer h-full"
        onClick={() => goToVenueDetails(venue._id)}
      >
        {/* Venue Image */}
        <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
          <img
            src={venueImage}
            alt={venueName}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = event1;
            }}
          />
          {/* Capacity Badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
            <div className="flex items-center space-x-1">
              <FaBuilding className="text-[#ED4A43] text-xs" />
              <span className="text-sm font-medium text-gray-800">Cap: {venueCapacity}</span>
            </div>
          </div>

          {/* Booking Status Indicator */}
          {isBooked && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg shadow-md">
              BOOKED
            </div>
          )}
        </div>

        {/* Venue Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ED4A43] transition-colors line-clamp-1">
            {venueName}
          </h3>
          <p className="flex items-center text-gray-300 mb-4 line-clamp-1">
            <FaMapMarkerAlt className="text-[#ED4A43] mr-2 flex-shrink-0" />
            <span className="truncate">{venueLocation}</span>
          </p>
          <button className={`w-full flex items-center justify-center py-2 px-4 bg-transparent border-2 ${isBooked ? 'border-gray-500 text-gray-400' : 'border-[#ED4A43] text-[#ED4A43]'} font-semibold rounded-lg group-hover:bg-${isBooked ? 'gray-500' : '[#ED4A43]'} group-hover:text-white transition-all duration-300`}>
            <FaBuilding className="mr-2" />
            {isBooked ? 'Unavailable' : 'View Details'}
          </button>
        </div>
      </div>
    );
  };

  // Function to render category card
  const renderCategoryCard = (category, index) => {
    const categoryName = category.name || "Unnamed Category";
    const categoryImage = getImageUrl(category.image, event1);

    return (
      <div
        key={index}
        className="group relative bg-white hover:bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
        onClick={() => navigate(`/events?category=${category._id || category.name}`)}
      >
        {/* Category Image */}
        <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
          <img
            src={categoryImage}
            alt={categoryName}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = event1;
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#ED4A43] transition-colors text-center">
            {categoryName}
          </h3>
          <div className="w-0 group-hover:w-full h-0.5 bg-[#ED4A43] transition-all duration-300 mx-auto"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="App font-sans bg-gray-900">
      {/* Hero Section */}
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>

        {/* Content container */}
        <div className="relative z-10 container mx-auto h-full flex flex-col pt-24 px-4 md:px-8">
          {/* Hero content and search */}
          <div className="max-w-2xl mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Experience the <span className="text-[#ED4A43]">Best Events</span> in Town
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-gray-200">
              Celebrate with top artists, exciting activities, and unforgettable moments.
            </p>

            {/* Search Bar */}
            {/* <div className="w-full max-w-xl backdrop-blur-sm bg-white/10 rounded-full overflow-hidden">
              <form className="flex items-center">
                <div className="flex-grow relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Search events, artists, or venues"
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-300 border-none outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-4 bg-[#ED4A43] hover:bg-[#D43C35] text-white font-semibold min-w-24 transition-colors duration-300"
                >
                  Search
                </button>
              </form>
            </div> */}
          </div>

          {/* Today's Events Section */}
          <div className="flex-grow pb-16">
            {/* Header with Date Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
              <h2 className="text-2xl font-bold text-white relative pl-4">
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#ED4A43] rounded-full"></span>
                Today's Events
              </h2>
              <div className="flex items-center bg-white/10 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden">
                <div className="bg-[#ED4A43] p-3 text-white">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div className="text-left p-3">
                  <p className="text-base font-semibold text-white">{formattedDate}</p>
                  <p className="text-sm text-gray-300">{dayOfWeek}</p>
                </div>
              </div>
            </div>

            {/* Events Slider */}
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 1.5 },
                  768: { slidesPerView: 2.5 },
                  1024: { slidesPerView: 3.5 },
                  1280: { slidesPerView: 4 }
                }}
                navigation={{
                  nextEl: '.events-next',
                  prevEl: '.events-prev',
                }}
                pagination={{ clickable: true }}
                className="!pb-12"
              >
                {todayEvents.length > 0 ? (
                  todayEvents.map((event, index) => (
                    <SwiperSlide key={index} className="!h-auto">
                      {renderEventCard(event, index, true)}
                    </SwiperSlide>
                  ))
                ) : (
                  // Fallback to sample events if no events for today
                  sampleEvents.map((event, index) => (
                    <SwiperSlide key={index} className="!h-auto">
                      {renderEventCard(event, index, false)}
                    </SwiperSlide>
                  ))
                )}
              </Swiper>

              {/* Custom Navigation */}
              <button className="events-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 -ml-4">
                <FaChevronLeft />
              </button>
              <button className="events-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 -mr-4">
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Events Section */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <h2 className="text-3xl font-bold text-white relative pl-4">
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#ED4A43] rounded-full"></span>
                Recommended For You
              </h2>
              <FaStar className="text-yellow-400 text-2xl" />
            </div>
            <button
              onClick={() => navigate('/event')}
              className="inline-flex items-center px-6 py-2.5 bg-transparent border border-[#ED4A43] text-[#ED4A43] hover:bg-[#ED4A43] hover:text-white transition-all duration-300 rounded-lg font-semibold"
            >
              View All Events
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ED4A43] mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading recommendations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-300">{error}</p>
            </div>
          ) : recommendedEvents.length > 0 ? (
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 }
                }}
                navigation={{
                  nextEl: '.recommended-next',
                  prevEl: '.recommended-prev',
                }}
                className="!pb-2"
              >
                {recommendedEvents.map((event, index) => (
                  <SwiperSlide key={index} className="!h-auto">
                    {renderEventCard(event, index, true)}
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="recommended-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 -ml-4">
                <FaChevronLeft />
              </button>
              <button className="recommended-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 -mr-4">
                <FaChevronRight />
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-300">No recommendations available at the moment. Check back later!</p>
            </div>
          )}
        </div>
      </div>

      {/* Available Venues Section */}
      <div className="bg-gray-800 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <h2 className="text-3xl font-bold text-white relative pl-4">
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#ED4A43] rounded-full"></span>
                Available Venues
              </h2>
              <FaBuilding className="text-blue-400 text-2xl" />
            </div>
            <button
              onClick={() => navigate('/venues')}
              className="inline-flex items-center px-6 py-2.5 bg-transparent border border-[#ED4A43] text-[#ED4A43] hover:bg-[#ED4A43] hover:text-white transition-all duration-300 rounded-lg font-semibold"
            >
              View All Venues
            </button>
          </div>

          {venuesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ED4A43] mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading venues...</p>
            </div>
          ) : venuesError ? (
            <div className="text-center py-12">
              <p className="text-gray-300">{venuesError}</p>
            </div>
          ) : venues.length > 0 ? (
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 }
                }}
                navigation={{
                  nextEl: '.venues-next',
                  prevEl: '.venues-prev',
                }}
                className="!pb-2"
              >
                {venues.map((venue, index) => (
                  <SwiperSlide key={index} className="!h-auto">
                    {renderVenueCard(venue, index)}
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="venues-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 -ml-4">
                <FaChevronLeft />
              </button>
              <button className="venues-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 -mr-4">
                <FaChevronRight />
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-300">No venues available at the moment. Check back later!</p>
            </div>
          )}
        </div>
      </div>

      {/* Events by Category Section */}
      <div className="bg-white py-16 px-4 md:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#ED4A43]/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-[#ED4A43]/10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#ED4A43] rounded-full"></span>
              Events by Category
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Discover events that match your interests across our diverse categories
            </p>
          </div>

          {categoriesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ED4A43] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading categories...</p>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{categoriesError}</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 }
                }}
                navigation={{
                  nextEl: '.categories-next',
                  prevEl: '.categories-prev',
                }}
                pagination={{ clickable: true }}
                className="!pb-12"
              >
                {categories.map((category, index) => (
                  <SwiperSlide key={index} className="!h-auto">
                    {renderCategoryCard(category, index)}
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="categories-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-100 text-gray-800 flex items-center justify-center transition-all duration-300 -ml-4">
                <FaChevronLeft />
              </button>
              <button className="categories-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-100 text-gray-800 flex items-center justify-center transition-all duration-300 -mr-4">
                <FaChevronRight />
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No categories available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};