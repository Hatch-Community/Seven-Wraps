/**
 * @typedef {Object} Customer
 * @property {String} name - The name of the customer
 * @property {Number} phoneNumber - The phone number of the customer no spaces or dashes (1234567890)
 * @property {String} emailAddress - Email address of the customer
 * @property {'email' | 'phone' | 'text'} contactMethod - Customers perfered contact method
 */
/**
 * @typedef {Object} Car
 * @property {String} make - Make of the car
 * @property {String} model - Model of the car
 * @property {Number} year - Year of the car
*/
/**
 * @typedef {Object} Service
 * @property {String} requestedService - The service requested
 * @property {String} additionalInformation - Any additional info provided by customer
 */
/**
 * @typedef {Object} Quote 
 * @property {String} id - The Quote ID
 * @property {Customer} customer - The customer requesting the quote
 * @property {Car} car - The car the service is to be preformed on
 * @property {Service} service - The requested service
 */
/** 
 * @typedef {(apiSuccess | apiFailure)} apiResult
 */
/**
 * @typedef {Object} apiSuccess
 * @property {true} success - True: Successful execution of the endpoint
 * @property {null} error - Null: No errors will be retuned in a successful execution
 * @property {any} data - The result of the API
 */
/**
 * @typedef {Object} apiFailure
 * @property {false} success - False: Unsuccessful execution of the endpoint
 * @property {String | String[]} error - Error or array of errors that caused the failure
 * @property {null} data - Null: no data returned in a failed execution
 */
module.exports = {}