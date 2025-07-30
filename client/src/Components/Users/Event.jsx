import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaSearch, FaRegCalendarAlt, FaHeart, FaTag, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export const Event = () => {
  const [ticketCounts, setTicketCounts] = useState({});
  const [discount, setDiscount] = useState(0);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [promoCodes, setPromoCodes] = useState({});
  const [appliedPromos, setAppliedPromos] = useState({});
  const [applyingPromo, setApplyingPromo] = useState(false);

  //for filtering
  const [filters, setFilters] = useState({
    sort: 'date',
    date: 'all',
    price: 'all',
    type: 'all'
  });

  // Date calculation helpers
  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === tomorrow.getTime();
  };

  const isThisWeekend = (date) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    nextSaturday.setHours(0, 0, 0, 0);

    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);
    nextSunday.setHours(23, 59, 59, 999);

    const compareDate = new Date(date);
    return compareDate >= nextSaturday && compareDate <= nextSunday;
  };

  const isNextWeek = (date) => {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));
    nextMonday.setHours(0, 0, 0, 0);

    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    const compareDate = new Date(date);
    return compareDate >= nextMonday && compareDate <= nextSunday;
  };

  // Filter and sort events
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison

    // Skip events that are in the past
    if (eventDate < today) return false;

    const searchMatch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    let dateMatch = true;
    switch (filters.date) {
      case 'today': dateMatch = isToday(eventDate); break;
      case 'tomorrow': dateMatch = isTomorrow(eventDate); break;
      case 'this weekend': dateMatch = isThisWeekend(eventDate); break;
      case 'next week': dateMatch = isNextWeek(eventDate); break;
      case 'all': default: dateMatch = true;
    }

    const priceMatch = filters.price === 'free' ? event.price === 0 :
      filters.price === 'paid' ? event.price > 0 : true;

    const typeMatch = filters.type === 'all' ? true : event.type === filters.type;

    return searchMatch && dateMatch && priceMatch && typeMatch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (filters.sort === 'price') return a.price - b.price;
    return new Date(a.date) - new Date(b.date);
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleTicketChange = (eventId, count) => {
    setTicketCounts((prev) => ({ ...prev, [eventId]: count }));
  };

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await axios.get('http://localhost:3000/api/event');
        setEvents(response.data);

        // Initialize favorites from localStorage
        const savedFavorites = localStorage.getItem('eventFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchEvent();
  }, []);

  const handleBookEvent = async (eventId) => {
    try {
      const ticketCount = ticketCounts[eventId] || 1;
      const promoCodeData = appliedPromos[eventId]?.code || null;

      const response = await axios.post('http://localhost:3000/api/event/buy', {
        eventId,
        promoCode: promoCodeData,
        quantity: ticketCount
      }, { withCredentials: true });

      localStorage.setItem('eventId', eventId);
      if (!response.data.success) {
        throw new Error("Unable to book event");
      }
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.log(error);
      toast.error("Failed to book event: " + (error.response?.data?.message || error.message));
    }
  }

  const toggleFavorite = async (eventId) => {
    try {
      if (favorites.includes(eventId)) {
        // Remove from favorites
        await axios.delete(`http://localhost:3000/api/event/${eventId}/favorite`, {
          withCredentials: true
        });
        setFavorites(favorites.filter(id => id !== eventId));
      } else {
        // Add to favorites
        await axios.post(`http://localhost:3000/api/event/${eventId}/favorite`, {}, {
          withCredentials: true
        });
        setFavorites([...favorites, eventId]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await axios.get('http://localhost:3000/api/event/user/favorites', {
          withCredentials: true
        });
        setFavorites(response.data.map(event => event._id));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }

    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn]);

  const applyGroupDiscount = (ticketCount) => (ticketCount >= 5 ? 20 : 0);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePromoCodeChange = (e, eventId) => {
    setPromoCodes(prev => ({
      ...prev,
      [eventId]: e.target.value
    }));
  };

  const applyPromoCode = async (eventId) => {
    const promoCode = promoCodes[eventId] || "";

    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setApplyingPromo(true);
    try {
      console.log("Applying promo code:", { eventId, promoCode });

      const response = await axios.post('http://localhost:3000/api/event/validate-promo', {
        eventId,
        promoCode: promoCode.trim()
      });

      console.log("Promo code validation response:", response.data);

      if (response.data.valid) {
        setAppliedPromos(prev => ({
          ...prev,
          [eventId]: {
            code: promoCode,
            discount: response.data.discountPercentage
          }
        }));
        toast.success(`Promo code applied! ${response.data.discountPercentage}% discount`);

        setPromoCodes(prev => ({
          ...prev,
          [eventId]: ""
        }));
      } else {
        toast.error(response.data.message || "Invalid or expired promo code");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      toast.error(error.response?.data?.message || "Failed to apply promo code");
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromoCode = (eventId) => {
    setAppliedPromos(prev => {
      const updated = { ...prev };
      delete updated[eventId];
      return updated;
    });
    toast.success("Promo code removed");
  };

  // Calculate total price with combined discounts
  const calculateTotalPrice = (event, ticketCount) => {
    const basePrice = event.price * ticketCount;
    const groupDiscount = applyGroupDiscount(ticketCount);
    const promoDiscount = appliedPromos[event._id]?.discount || 0;

    // Apply both discounts cumulatively (group discount first, then promo discount)
    const priceAfterGroupDiscount = basePrice * (1 - groupDiscount / 100);
    const finalPrice = priceAfterGroupDiscount * (1 - promoDiscount / 100);

    return {
      basePrice,
      groupDiscount,
      promoDiscount,
      finalPrice,
      totalDiscount: basePrice - finalPrice
    };
  };

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#ED4A43] mb-6 sm:mb-8 text-center">
          Events
        </h2>

        <div className="flex flex-col lg:flex-row gap-6 relative">
          {/* Sidebar - moves to top on mobile */}
          <div className="lg:w-1/4 lg:sticky lg:top-4 lg:self-start bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 flex items-center">
                <FaSearch className="mr-2 text-[#ED4A43]" />
                Find Events
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full p-2 sm:p-3 pl-9 sm:pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED4A43] focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-5 divide-y divide-gray-100">
              <div className="pb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Sort By</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value="price"
                      checked={filters.sort === 'price'}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="form-radio text-[#ED4A43] mr-2"
                    />
                    <span className="text-sm sm:text-base">Price</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value="date"
                      checked={filters.sort === 'date'}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="form-radio text-[#ED4A43] mr-2"
                    />
                    <span className="text-sm sm:text-base">Date</span>
                  </label>
                </div>
              </div>

              <div className="py-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 flex items-center">
                  <FaRegCalendarAlt className="mr-2 text-[#ED4A43]" />
                  Date
                </h3>
                <div className="space-y-2">
                  {['today', 'tomorrow', 'this weekend', 'next week', 'all'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="date"
                        value={option}
                        checked={filters.date === option}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="form-radio text-[#ED4A43] mr-2"
                      />
                      <span className="text-sm sm:text-base capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="py-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800 flex items-center">
                  <FaTicketAlt className="mr-2 text-[#ED4A43]" />
                  Price
                </h3>
                <div className="space-y-2">
                  {['all', 'free', 'paid'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={option}
                        checked={filters.price === option}
                        onChange={(e) => handleFilterChange('price', e.target.value)}
                        className="form-radio text-[#ED4A43] mr-2"
                      />
                      <span className="text-sm sm:text-base capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Event Type</h3>
                <div className="space-y-2">
                  {['all', 'concert', 'sports', 'exhibition', 'comedy', 'theatre', 'party'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={option}
                        checked={filters.type === option}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="form-radio text-[#ED4A43] mr-2"
                      />
                      <span className="text-sm sm:text-base capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="lg:w-3/4">
            {sortedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {sortedEvents.map((event) => {
                  const ticketCount = ticketCounts[event._id] || 1;
                  const priceDetails = calculateTotalPrice(event, ticketCount);

                  return (
                    <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative flex flex-col">
                      {/* Image with Link */}
                      <Link to={`/event/${event._id}`} className="block flex-shrink-0">
                        <div className="relative h-48 sm:h-56 overflow-hidden">
                          <img
                            src={`http://localhost:3000/${event.image}`}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </Link>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(event._id);
                        }}
                        className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200 z-20"
                      >
                        <FaHeart
                          size={18}
                          className={favorites.includes(event._id) ? "text-[#ED4A43]" : "text-gray-400"}
                        />
                      </button>

                      <div className="p-4 sm:p-6 flex-grow flex flex-col">
                        {/* Title with Link */}
                        <Link to={`/event/${event._id}`} className="hover:text-[#ED4A43] transition-colors duration-300 mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2">
                            {event.title}
                          </h3>
                        </Link>

                        <div className="space-y-2 mb-3 sm:mb-4">
                          <div className="flex items-center text-gray-600 text-sm sm:text-base">
                            <FaCalendarAlt className="text-[#ED4A43] mr-2 flex-shrink-0" />
                            <p className="truncate">{new Date(event.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm sm:text-base">
                            <FaMapMarkerAlt className="text-[#ED4A43] mr-2 flex-shrink-0" />
                            <p className="truncate">{event?.venue?.name}</p>
                          </div>
                        </div>

                        <div className="pt-3 sm:pt-4 border-t border-gray-100 mt-auto">

                          {/* Price display */}
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total:</span>
                            <div className="text-right">
                              {(priceDetails.groupDiscount > 0 || priceDetails.promoDiscount > 0) && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through mr-1 sm:mr-2">
                                  ${priceDetails.basePrice.toFixed(2)}
                                </span>
                              )}
                              <span className="text-base sm:text-lg font-bold text-[#ED4A43]">
                                ${priceDetails.finalPrice.toFixed(2)}
                              </span>
                              {(priceDetails.groupDiscount > 0 || priceDetails.promoDiscount > 0) && (
                                <div className="text-xs text-green-600 font-medium">
                                  You save: ${priceDetails.totalDiscount.toFixed(2)} (
                                  {priceDetails.groupDiscount > 0 && `${priceDetails.groupDiscount}% group`}
                                  {priceDetails.groupDiscount > 0 && priceDetails.promoDiscount > 0 && ' + '}
                                  {priceDetails.promoDiscount > 0 && `${priceDetails.promoDiscount}% promo`}
                                  )
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleBookEvent(event._id);
                            }}
                            className="w-full py-2 sm:py-3 bg-[#ED4A43] hover:bg-[#D43C35] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
                          >
                            <FaTicketAlt className="mr-1 sm:mr-2" />
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 bg-white rounded-xl shadow-md">
                <FaSearch className="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-700">No events found</h3>
                <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Try changing your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};