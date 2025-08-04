// filepath: /Users/admin/Desktop/CODE/CarQuoteBS/quotetool/routes/health.js

/**
 * Health check endpoint - returns API status
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
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
