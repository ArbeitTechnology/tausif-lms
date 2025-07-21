/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiX,
  FiArrowLeft,
  FiCreditCard,
  FiStar,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Checkout from "./Checkout";

const Cart = ({ setActiveView }) => {
  const [cart, setCart] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem("courseCart")) || [];
        setCart(savedCart);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        toast.error("Failed to load cart");
      }
    };

    loadCart();

    // Optional: Add event listener to sync cart across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'courseCart') {
        loadCart();
      }
    });

    return () => {
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  // Remove item from cart and update localStorage
  const removeFromCart = (courseId) => {
    try {
      const updatedCart = cart.filter((item) => item.id !== courseId);
      setCart(updatedCart);
      localStorage.setItem("courseCart", JSON.stringify(updatedCart));
      toast.success("Course removed from cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove course");
    }
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const openCheckoutModal = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setShowCheckoutModal(true);
  };

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
  };

  // Handle successful checkout
  const handleCheckoutSuccess = () => {
    try {
      // Add purchased courses to myCourses in localStorage
      const myCourses = JSON.parse(localStorage.getItem("myCourses")) || [];
      const newCourses = cart.map(course => course.id);
      localStorage.setItem("myCourses", JSON.stringify([...myCourses, ...newCourses]));

      // Clear cart
      setCart([]);
      localStorage.removeItem("courseCart");
      setShowCheckoutModal(false);

      toast.success("Payment successful! You are now enrolled in the courses.");
      setActiveView("myCourses");
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to complete checkout");
    }
  };

  return (
    <div className="min-h-screen text-gray-900">
      {/* Header */}
      <header className="bg-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => setActiveView("courseList")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" /> Back to Courses
          </motion.button>
          <div className="flex items-center">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
              {cart.length} {cart.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {cart.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
                  <h2 className="text-xl font-bold text-gray-900">
                    {cart.length} {cart.length === 1 ? "Course" : "Courses"} in Cart
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Review your selections before checkout
                  </p>
                </div>

                <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <AnimatePresence>
                    {cart.map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                            <img
                              src={course.thumbnail || 'https://via.placeholder.com/150'}
                              alt={course.title}
                              className="w-full sm:w-40 h-24 object-cover rounded-lg shadow-sm"
                            />
                          </div>

                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {course.title || "Untitled Course"}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  By {course.instructor || "Unknown Instructor"}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(course.id)}
                                className="text-gray-400 hover:text-red-500 p-1 -mt-2 -mr-2"
                              >
                                <FiX size={20} />
                              </button>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <span className="flex items-center mr-4">
                                <FiStar className="text-yellow-400 mr-1" />
                                {course.rating || 4.5} (
                                {(course.students || 0).toLocaleString()})
                              </span>
                            </div>

                            <div className="flex justify-between items-end">
                              <div>
                                {course.price > 0 ? (
                                  <span className="text-lg font-bold text-gray-600">
                                    ৳ {(course.price || 0).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-lg font-bold text-green-600">
                                    Free
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiCreditCard className="mr-2 text-gray-600" />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {cart.map((course) => (
                    <div
                      key={course.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex items-start">
                        <img
                          src={course.thumbnail || 'https://via.placeholder.com/150'}
                          alt={course.title}
                          className="w-12 h-9 object-cover rounded mr-3"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {course.title || "Untitled Course"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {course.instructor || "Unknown Instructor"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        ৳{(course.price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">৳ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">৳ 0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>৳ {total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openCheckoutModal}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-700 hover:to-gray-900 transition-colors flex items-center justify-center"
                >
                  <FiCreditCard className="mr-2" />
                  Proceed to Checkout
                </motion.button>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">
                        What's included
                      </h4>
                      <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                        <li>Lifetime access</li>
                        <li>Certificate of completion</li>
                        <li>30-day money-back guarantee</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <FiShoppingCart size={40} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Discover amazing courses to boost your skills and add them to your
              cart
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView("courseList")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors"
            >
              Browse Courses
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FiCreditCard className="mr-2 text-gray-600" />
                  Secure Checkout
                </h2>
                <button
                  onClick={closeCheckoutModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                <Checkout cart={cart} onSuccess={handleCheckoutSuccess} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;