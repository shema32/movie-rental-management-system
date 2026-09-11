import Joi from 'joi';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // East African phone number format (simplified)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 50;
};

export const validatePassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Joi schemas
export const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().required(),
  phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  role: Joi.string().valid('EMPLOYEE', 'CUSTOMER').default('CUSTOMER'),
});

export const movieSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  director: Joi.string(),
  release_year: Joi.number().integer().min(1900),
  category_id: Joi.number().integer().required(),
  language_id: Joi.number().integer().required(),
  rental_price_per_day: Joi.number().precision(2).required(),
  sale_price: Joi.number().precision(2).required(),
  purchase_cost: Joi.number().precision(2).required(),
  duration_minutes: Joi.number().integer(),
  is_translated: Joi.boolean(),
});

export const rentalSchema = Joi.object({
  movie_id: Joi.number().integer().required(),
  customer_id: Joi.number().integer(),
  rental_duration_days: Joi.number().integer().min(1).required(),
  payment_method: Joi.string().valid('CASH', 'MOBILE_MONEY').required(),
});
