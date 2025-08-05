/**
 * 
 * @typedef {import('../../utils/types').apiResult} apiResult
 * @typedef {import('../../utils/types').apiFailure} apiFailure
 * @typedef {import('../../utils/types').apiSuccess} apiSuccess
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResult
 * @typedef {import('../../utils/types').Customer} Customer
 * @typedef {import('../../utils/types').Car} Car
 * @typedef {import('../../utils/types').Service} Service
 * @typedef {import('../../utils/types').Quote} Quote
 */

/**
 * 
 * @param {ExpressRequest} req 
 * @param {ExpressResult} res 
 * @returns {Promise<apiResult>}
 */
async function GET(req,res) {
    const {Quotes} = require("../../tempdb")
    
    Quotes.push(testQuote)
    /** @type {apiSuccess} */
    const apiResult = {success: true, error: null, data: Quotes}
    res.status(200).json(apiResult)
    return {success: true, error: null, data: "API Success"}
}
/** @type {Quote} */
const testQuote = {
  id: "10",
  customer: {
    name: "Gavin Fox",
    phoneNumber: 1234567890,
    emailAddress: "24gavinfox@gmail.com",
    contactMethod: "email"
  },
  car: {
    make: "Honda",
    model: "Pilot",
    year: 2000
  },
  service: {
    requestedService: "Make white",
    additionalInformation: "time now"
  }
}

module.exports = { GET }