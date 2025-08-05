/**
 * @typedef {import('../../utils/types').apiResult} apiResult
 * @typedef {import('../../utils/types').apiFailure} apiFailure
 * @typedef {import('../../utils/types').apiSuccess} apiSuccess
 * @typedef {import('../../utils/types').Customer} Customer
 * @typedef {import('../../utils/types').Car} Car
 * @typedef {import('../../utils/types').Service} Service
 * @typedef {import('../../utils/types').Quote} Quote
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResult
 */
const { validateQuoteObject } = require("../../utils/quoteObject")
/**
 * 
 * @param {ExpressRequest} req 
 * @param {ExpressResult} res 
 * @returns {apiResult}
 */
function POST(req, res) {
    const reqData = req.body
    let isValidBody = validateQuoteObject(reqData)
    if (isValidBody != true) {
        /** @type {apiFailure} */
        let returnData = {success: false, data: null, error: isValidBody}
        res.status(400).json(returnData)
        return returnData
    }

    
    

}

module.exports = {POST}