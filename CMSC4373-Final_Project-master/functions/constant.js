// const { testMatrix } = require("firebase-functions/lib/providers/testLab")

// testMatrix
exports.DEV = true
exports.collectionName = {
    PRODUCTS: 'products',
    PURCHASE_HISTORY: 'purchase_history',
    ACCOUNT_INFO: 'account_info',
    REVIEWS: 'reviews',
}

exports.adminEmails = ['admin@test.com', 'admin2@test.com']