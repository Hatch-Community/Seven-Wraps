// filepath: /Users/admin/Desktop/CODE/CarQuoteBS/quotetool/routes/health.js
/**
 * @typedef {import('../utils/types').apiResult} apiResult
 * @typedef {import('../utils/types').apiFailure} apiFailure
 * @typedef {import('../utils/types').apiSuccess} apiSuccess
 * @typedef {import('../utils/types').Customer} Customer
 * @typedef {import('../utils/types').Car} Car
 * @typedef {import('../utils/types').Service} Service
 * @typedef {import('../utils/types').Quote} Quote
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResult
 */

/**
 * Health check endpoint - returns API status
 * @param {ExpressRequest} req - Express request object
 * @param {ExpressResult} res - Express response object
 * @author NightShift101
 * @since The dawn of time
 */
function GET(req, res) {
    try {
        res.status(200).json({
            success: true,
            error: null,
            data: {
                message: "API is running",
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            }
        });
    } catch (error) {
        console.error('Error in GET /api/health:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            data: null
        });
    }
}

module.exports = { GET };
