const functions = require('firebase-functions');


const admin = require('firebase-admin');

const serviceAccount = require('./final_account_key.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});








//Exported functions to go to client side
exports.admin_addProduct2 = functions.https.onCall(addProduct2)
exports.admin_getProductList2 = functions.https.onCall(getProductList2)
exports.admin_getProductById2 = functions.https.onCall(getProductById2)
exports.admin_updateProduct2 = functions.https.onCall(updateProduct2)
exports.admin_deleteProduct2 = functions.https.onCall(deleteProduct2)
exports.admin_getUserList2 = functions.https.onCall(getUserList2)
exports.admin_updateUser2 = functions.https.onCall(updateUser2)
exports.admin_deleteUser = functions.https.onCall(deleteUser)
exports.admin_isAdmin = functions.https.onCall(isAdmin)
exports.admin_addReview = functions.https.onCall(addReview)
exports.admin_getReviewList = functions.https.onCall(getReviewList)
exports.admin_getReviewById = functions.https.onCall(getReviewById)
exports.admin_deleteReview = functions.https.onCall(deleteReview)
exports.admin_editReview = functions.https.onCall(editReview)
exports.admin_getUsersReviewList= functions.https.onCall(getUsersReviewList)

const Constant = require('./constant.js');
const { firestore } = require('firebase-admin');

function isAdmin(email, context) {
    //Returns DATA: TRUE OBJECT
    // if (Constant.adminEmails.includes(context.auth.token.email)) {
    //     return true
    // } else return false
    if (Constant.adminEmails.includes(email)) {
       return true
   }else return false
}



//CLOUD FUNCTIONS ALWAYS HAVE DATA AND CONTEXT
//PRODUCTS
async function addProduct2(data, context) {
    // if (!isAdmin(context.auth.token.email)) {
    //     if(Constant.DEV) console.log('not admin', context.auth.token.email)
    //     throw new functions.https.HttpsError('permission-denied', 'Only Admin can invoke this function')
    // }
    try {
        await admin.firestore().collection(Constant.collectionName.PRODUCTS)
                .add(data)
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'addProduct2 Failed')
    }
}
//REVIEW
async function addReview(data, context) {
    try {
        await admin.firestore().collection(Constant.collectionName.REVIEWS)
            .add(data)
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'addReview Failed')
    }
}

async function deleteReview(docId, context) {
    try {
        await admin.firestore().collection(Constant.collectionName.REVIEWS)
            .doc(docId)
            .delete()
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'deleteReview Failed')
    }
}

async function editReview(reviewInfo, context) {
    try {
        await admin.firestore().collection(Constant.collectionName.REVIEWS)
            .doc(reviewInfo.docId)
            .update(reviewInfo.data)
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'EditReview Failed')
    }
}

async function getReviewList(docId, context) {
    try {
        let reviewList = []
        const snapShot = await admin.firestore().collection(Constant.collectionName.REVIEWS)
            .where('productId','==', docId)
            .orderBy('timeStamp', 'desc')
            .get()
        snapShot.forEach(doc => {
            const { rating, reviewText, productId, createdBy, timeStamp } = doc.data() // Destructuring
            const r = { rating, reviewText, productId, createdBy, timeStamp }
            r.docId = doc.id
            reviewList.push(r)
        })
        return reviewList
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'getReviewList failed')
    }
}

async function getUsersReviewList(uid, context) {
    try {
        let list = []
        const snapShot = await admin.firestore().collection(Constant.collectionName.REVIEWS)
            .where('createdBy', '==', uid)
            .orderBy('timeStamp', 'desc')
            .get()
        snapShot.forEach(doc => {
            const { rating, reviewText, productId, createdBy, timeStamp } = doc.data() // Destructuring
            const r = { rating, reviewText, productId, createdBy, timeStamp }
            r.docId = doc.id
            list.push(r)
        })
        return list
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'getReviewList failed')
    }
}
            
async function getReviewById(docId, context) {
    try {
        const doc = await admin.firestore().collection(Constant.collectionName.REVIEWS)
            .doc(docId)
            .get()
        if (doc.exists) {
            const { rating, reviewText, timeStamp} = doc.data()
            const r = { rating, reviewText, timeStamp}
            r.docId = doc.id
            return r
        } else {
            return null
        } 
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal','getReviewById Failed')
    }
}


async function getProductList2(data, context) {
   
    try {
        let parray = []
        const snapShot = await firestore().collection(Constant.collectionName.PRODUCTS)
            .orderBy('name')
            .get()
        snapShot.forEach(doc => {
            const { name, price, summary, imageName, imageURL } = doc.data() //Destructuring
            const p = { name, price, summary, imageName, imageURL }
            p.docId = doc.id //docId comes from product instance class doc.id is firestore
            parray.push(p)
        })
        return parray
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'getProductList2 Failed')
    }
    
}

async function getProductById2(docId, context) {
   
    try {
        const doc = await admin.firestore().collection(Constant.collectionName.PRODUCTS)
            .doc(docId)
            .get()
        if (doc.exists) {
            const { name, summary, price, imageName, imageURL } = doc.data()
            const p = { name, price, summary, imageName, imageURL }
            p.docId = doc.id
            return p
        } else {
            return null
        }
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'getProductById2 Failed')
    }
}

async function updateProduct2(productInfo, context) {
    //productInfo = {docId, productUpdate}
    // if (!isAdmin(context.auth.token.email)) {
    //     if(Constant.DEV) console.log('not admin', context.auth.token.email)
    //     throw new functions.https.HttpsError('permission-denied', 'Only Admin can invoke this function')
    // }
    try {
        await admin.firestore().collection(Constant.collectionName.PRODUCTS)
                .doc(productInfo.docId).update(productInfo.data)
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'updateProduct2 Failed')
    }
}

async function deleteProduct2(docId, context) {
    // if (!isAdmin(context.auth.token.email)) {
    //     if(Constant.DEV) console.log('not admin', context.auth.token.email)
    //     throw new functions.https.HttpsError('permission-denied', 'Only Admin can invoke this function')
    // }
    try {
        await admin.firestore().collection(Constant.collectionName.PRODUCTS)
            .doc(docId)
            .delete()
        //Delete Reviews
    //    const doc = await admin.firestore().collection(Constant.collectionName.REVIEWS)
    //         .where('productId', '==', docId)
    //         .get()
    //     if (doc.exists) {
    //         const { reviewText, productId, rating, createdBy } = doc.data()
    //         del = { reviewText, productId, rating, createdBy }
    //         del.docId = doc.docId
    //         await admin.firestore().collection(Constant.collectionName.REVIEWS)
    //             .doc(del.docId)
    //             .delete()
        // }
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'deleteProduct2 Failed')
    }
}

//USERS
async function getUserList2(data, context) {
    // if (!isAdmin(context.auth.token.email)) {
    //     if(Constant.DEV) console.log('not admin', context.auth.token.email)
    //     throw new functions.https.HttpsError('permission-denied', 'Only Admin can invoke this function')
    // }
    const userList = []
    try {
        let userRecord = await admin.auth().listUsers(1000)
        userList.push(...userRecord.users) //... spread operator array moves to a list of elements
        let nextPageToken = userRecord.pageToken
        /*eslint-disable no-await-in-loop*/
        while (nextPageToken) {
            userRecord = await admin.auth().listUsers(1000, nextPageToken)
            userList.push(...userRecord.users)
            nextPageToken = user.userRecord.pageToken
        }
        /*eslint-enable no-await-in-loop*/
        return userList
        
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'getUserList2 Failed')
    }
}

async function updateUser2(data, context) {
    //data = {uid, update} -> update = {key:value}
    // if (!isAdmin(context.auth.token.email)) {
    //     if(Constant.DEV) console.log('not admin', context.auth.token.email)
    //     throw new functions.https.HttpsError('permission-denied', 'Only Admin can invoke this function')
    // }
    try {
        const uid = data.uid
        const update = data.update
        await admin.auth().updateUser(uid, update)
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'getupdateUser2 Failed')
    }
}

async function deleteUser(uid) {
    // if (!isAdmin(context.auth.token.email)) {
    //    if(Constant.DEV) console.log('not admin', context.auth.token.email)
    //    throw new functions.https.HttpsError('permission-denied', 'Only Admin can invoke this function')
    // }
    try {
        await admin.auth().deleteUser(uid)
    } catch (e) {
        if (Constant.DEV) console.log(e)
        throw new functions.https.HttpsError('internal', 'deleteUser Failed')
    }
}
    
