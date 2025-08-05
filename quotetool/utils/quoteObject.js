/**
 * Validates a Quote object at runtime against the JSDoc typedef structure.
 * @param {any} obj - The object to validate
 * @returns {true | string[]} - true if valid, else array of error messages
 */
function validateQuoteObject(obj) {
  const errors = [];

  if (typeof obj !== 'object' || obj === null) {
    return ['Quote must be a non-null object.'];
  }

  const { customer, car, service } = obj;

  // Validate Customer
  if (typeof customer !== 'object' || customer === null) {
    errors.push('Quote.customer must be an object.');
  } else {
    if (typeof customer.name !== 'string') {
      errors.push('customer.name must be a string.');
    }

    // Coerce phoneNumber if it's a string of digits
    if (typeof customer.phoneNumber === 'string' && /^\d{10}$/.test(customer.phoneNumber)) {
      customer.phoneNumber = Number(customer.phoneNumber);
    }

    if (typeof customer.phoneNumber !== 'number') {
      errors.push('customer.phoneNumber must be a number or a numeric string.');
    } else if (!/^\d{10}$/.test(customer.phoneNumber.toString())) {
      errors.push('customer.phoneNumber must be exactly 10 digits with no spaces or dashes.');
    }

    // Email format check
    if (typeof customer.emailAddress !== 'string') {
      errors.push('customer.emailAddress must be a string.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.emailAddress)) {
        errors.push('customer.emailAddress must be a valid email format.');
      }
    }

    const validContactMethods = ['email', 'phone', 'text'];
    if (!validContactMethods.includes(customer.contactMethod)) {
      errors.push(`customer.contactMethod must be one of ${validContactMethods.join(', ')}.`);
    }
  }

  // Validate Car
  if (typeof car !== 'object' || car === null) {
    errors.push('Quote.car must be an object.');
  } else {
    if (typeof car.make !== 'string') {
      errors.push('car.make must be a string.');
    }
    if (typeof car.model !== 'string') {
      errors.push('car.model must be a string.');
    }
    if (typeof car.year !== 'number') {
      errors.push('car.year must be a number.');
    }
  }

  // Validate Service
  if (typeof service !== 'object' || service === null) {
    errors.push('Quote.service must be an object.');
  } else {
    if (typeof service.requestedService !== 'string') {
      errors.push('service.requestedService must be a string.');
    }
    if (typeof service.additionalInformation !== 'string') {
      errors.push('service.additionalInformation must be a string.');
    }
  }

  return errors.length === 0 ? true : errors;
}

module.exports = {validateQuoteObject}