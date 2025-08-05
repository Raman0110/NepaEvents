import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaArrowLeft, FaInfoCircle, FaFileAlt, FaQrcode, FaHeart, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import VenueLocationMap from '../VenueLocationMap';

export const EventDetail = () => {
  const { id } = useParams();
  const [ticketCount, setTicketCount] = useState(1);
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/event/${id}`);
        setEvent(response.data.event);

        // Check if event is in favorites
        if (isAuthenticated) {
          const favResponse = await axios.get('http://localhost:3000/api/event/user/favorites', {
            withCredentials: true
          });
          setIsFavorite(favResponse.data.some(favEvent => favEvent._id === response.data.event._id));
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      }
    };

    if (id) fetchEvent();
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:3000/api/event/${id}/favorite`, {
          withCredentials: true
        });
      } else {
        await axios.post(`http://localhost:3000/api/event/${id}/favorite`, {}, {
          withCredentials: true
        });
      }
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites');
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    try {
      const response = await axios.post('http://localhost:3000/api/event/validate-promo', {
        eventId: id,
        promoCode: promoCode.trim()
      }, { withCredentials: true });

      if (response.data.valid) {
        setAppliedPromo({
          code: promoCode,
          discount: response.data.discountPercentage
        });
        toast.success(`Promo code applied! ${response.data.discountPercentage}% discount`);
        setPromoCode('');
      } else {
        toast.error(response.data.message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error(error.response?.data?.message || 'Failed to apply promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    toast.success('Promo code removed');
  };

  const handleTicketChange = (action) => {
    if (action === 'increase') {
      setTicketCount(prev => prev + 1);
    } else if (action === 'decrease' && ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };

  const handleBookEvent = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/event/buy', {
        eventId: id,
        promoCode: appliedPromo?.code || null,
        quantity: ticketCount
      }, { withCredentials: true });

      localStorage.setItem('eventId', id);
      if (!response.data.success) {
        throw new Error("Unable to book event");
      }
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error(error);
      toast.error("Failed to book event: " + (error.response?.data?.message || error.message));
    }
  };

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-10 text-xl">Loading event details...</div>
      </div>
    );
  }

  const calculateTotalPrice = () => {
    const basePrice = ticketCount * event.dynamicPrice;
    if (appliedPromo) {
      return basePrice * (1 - appliedPromo.discount / 100);
    }
    return basePrice;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-800">
        <img
          src={`http://localhost:3000/${event.image}`}
          alt={event.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <Link to="/event" className="inline-flex items-center text-white bg-[#ED4A43]/80 hover:bg-[#ED4A43] px-4 py-2 rounded-lg mb-4 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Events
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                  <FaCalendarAlt className="text-[#ED4A43] mr-2" />
                  <span>{new Date(event.date).toLocaleString()}</span>
                </div>
                <div className="flex items-center bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                  <FaMapMarkerAlt className="text-[#ED4A43] mr-2" />
                  <span>{event.venue.name}</span>
                </div>
              </div>
            </div>

            <button
              onClick={toggleFavorite}
              className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
            >
              <FaHeart
                size={20}
                className={isFavorite ? "text-[#ED4A43]" : "text-gray-400"}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b">
                {['description', 'details', 'terms'].map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${activeTab === tab
                      ? 'text-[#ED4A43] border-b-2 border-[#ED4A43]'
                      : 'text-gray-500 hover:text-gray-800'
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'description' && (
                  <div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {event.description}
                      </p>
                    </div>
                    <div className="mt-8">
                      <VenueLocationMap existingCoordinates={event.venue.locationCoordinates} />
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaInfoCircle className="text-[#ED4A43] mr-2" />
                      Event Details
                    </h2>
                    <div className="space-y-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Category:</span> {event.category}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Organizer:</span> {event.organizer.fullName}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Artist:</span> {event.artist || 'Various artists'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Venue Capacity:</span> {event.venue.capacity || 'Not specified'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'terms' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaFileAlt className="text-[#ED4A43] mr-2" />
                      Terms & Conditions
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>1. No refund after booking. Event rules apply.</p>
                      <p>2. Tickets are non-transferable.</p>
                      <p>3. Venue rules must be followed at all times.</p>
                      <p>4. The organizer reserves the right to refuse entry.</p>
                      <p>5. Event may be canceled due to unforeseen circumstances.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Booking */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Tickets</h2>
                <div className="flex items-center text-lg text-[#ED4A43] font-bold">
                  ${event.dynamicPrice.toFixed(2)} <span className="text-gray-500 text-sm font-normal ml-1">per ticket</span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Ticket quantity */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Number of Tickets</label>
                  <div className="flex items-center justify-between">
                    <button
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      onClick={() => handleTicketChange('decrease')}
                      disabled={ticketCount <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-[#ED4A43]"
                    />
                    <button
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      onClick={() => handleTicketChange('increase')}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <FaCheck className="text-green-500 mr-2" />
                        <span className="text-green-800 font-medium">
                          {appliedPromo.code} ({appliedPromo.discount}% off)
                        </span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#ED4A43]"
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="px-4 py-2 bg-[#ED4A43] text-white rounded-r-lg hover:bg-[#D43C35] disabled:bg-gray-400"
                      >
                        {isApplyingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* QR Code Information */}
                <div className="bg-blue-50 p-3 rounded-lg flex items-start">
                  <FaQrcode className="text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-blue-700 text-sm ml-2">
                    Each ticket will come with its own unique QR code for entry. You'll receive {ticketCount} separate {ticketCount === 1 ? 'QR code' : 'QR codes'} via email.
                  </p>
                </div>

                {/* Price calculation */}
                <div className="space-y-2 pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({ticketCount} tickets)</span>
                    <span className="font-medium">${(ticketCount * event.dynamicPrice).toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedPromo.discount}%)</span>
                      <span>-${(ticketCount * event.dynamicPrice * appliedPromo.discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span className="text-[#ED4A43]">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Book button */}
                <button
                  onClick={handleBookEvent}
                  className="w-full py-4 bg-[#ED4A43] hover:bg-[#D43C35] text-white font-bold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center text-lg mt-4"
                >
                  <FaTicketAlt className="mr-2" />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;