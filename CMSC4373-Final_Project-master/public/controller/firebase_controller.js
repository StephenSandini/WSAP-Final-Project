import { Product } from '../model/product.js'
import * as Constant from '../model/constant.js'
import { ShoppingCart } from '../model/shoppingcart.js'
import { AccountInfo } from '../model/account_info.js'
import { Review } from '../model/review.js'
import { currentUser } from './auth.js'
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////CLIENT SIDE FUNCTIONS/////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function uploadProfilePhoto(photoFile, imageName) {
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.PROFILE_PHOTOS + imageName)
    const taskSnapShot = await ref.put(photoFile)
    const photoURL = await taskSnapShot.ref.getDownloadURL()
    return photoURL
}
const cf_editReview = firebase.functions().httpsCallable('admin_editReview')
export async function editReview(review) {
    const docId = review.docId
    const data = review.serializeForUpdate()
    await cf_editReview({docId, data})
    
}

export async function updateAccountInfo(uid, updateInfo) {
    await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
        .doc(uid)
        .update(updateInfo)
}

export async function getAccountInfo(uid) {
    const doc = await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
        .doc(uid)
        .get()

    if (doc.exists) {
        const {name, address, city, state, zip, creditCardNo, photoURL} = doc.data()
        const ai = { name, address, city, state, zip, creditCardNo, photoURL}
        ai.docId = doc.id
        return ai
    } else {
        const defaultInfo = AccountInfo.instance()
        await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
            .doc(uid)
            .set(defaultInfo.serialize())
        return defaultInfo
    }
    
}

export async function createUser(email, password) {
    await firebase.auth().createUserWithEmailAndPassword(email, password)
}

export async function signIn(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password)
}

export async function signOut() {
    await firebase.auth().signOut()

}

export async function getPurchaseHistory(uid) {
    const snapShot = await firebase.firestore()
        .collection(Constant.collectionName.PURCHASE_HISTORY)
        .where('uid', '==', uid)
        .orderBy('timestamp', 'desc')
        .get()
    const carts =[]
    snapShot.forEach(doc => {
        const sc = ShoppingCart.deserialize(doc.data())
        carts.push(sc)
    })
    return carts
}

export async function checkOut(cart) {
    const data = cart.serialize(Date.now())
    await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY)
                .add(data)
}


    
export async function uploadImage(imageFile, imageName) {
    //Image Doesn't have Name
    if (!imageName) {
        imageName = Date.now() + imageFile.name
    }
    //Updating
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderName.PRODUCT_IMAGE + imageName)
    const taskSnapShot = await ref.put(imageFile)
    const imageURL = await taskSnapShot.ref.getDownloadURL()
    return {imageName, imageURL}
}

const cf_deleteReview = firebase.functions().httpsCallable('admin_deleteReview')
export async function deleteReview(docId) {
    await cf_deleteReview(docId)
}

const cf_addReview = firebase.functions().httpsCallable('admin_addReview')
export async function addReview(review) {
    await cf_addReview(review.serialize())
}
const cf_getReviewList = firebase.functions().httpsCallable('admin_getReviewList')
export async function getReviewList(docId) {
    const reviewList = []
    const result = await cf_getReviewList(docId)
    result.data.forEach(data => {
        const r = new Review(data)
        r.docId = data.docId
        reviewList.push(r)
    })
    return reviewList
}
const cf_getUsersReviewList = firebase.functions().httpsCallable('admin_getUsersReviewList')
export async function getUsersReviewList(uid) {
    
    const reviewList = []
    const result = await cf_getUsersReviewList(uid)
    result.data.forEach(data => {
        const r = new Review(data)
        r.docId = data.docId
        reviewList.push(r)
    })
    return reviewList
}

const cf_getReviewById = firebase.functions().httpsCallable('admin_getReviewById')
export async function getReviewById(docId) {
    const result = await cf_getReviewById(docId)
    if (result.data) {
        const review = new Review(result.data)
        review.docId = result.data.docId
        return review
    } else {
        return null
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////ADMIN CLOUD FUNCTIONS/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const cf_addProduct2 = firebase.functions().httpsCallable('admin_addProduct2')
export async function addProduct2(product) {
    await cf_addProduct2(product.serialize())
}
const cf_getProductList2 = firebase.functions().httpsCallable('admin_getProductList2')
export async function getProductList2() {
    const products = []
    const result = await cf_getProductList2()
    result.data.forEach(data => {
        const p = new Product(data)
        p.docId = data.docId
        products.push(p)
    })
    return products  
}
const cf_getProductById2 = firebase.functions().httpsCallable('admin_getProductById2')
export async function getProductById2(docId) {
    const result = await cf_getProductById2(docId)
    if (result.data) {
        const product = new Product(result.data)
        product.docId = result.data.docId
        return product
    } else {
        return null
    }
}
const cf_updateProduct2 = firebase.functions().httpsCallable('admin_updateProduct2')
export async function updateProduct2(product) {
    const docId = product.docId
    const data = product.serializeForUpdate()
    await cf_updateProduct2({docId, data})
}

const cf_deleteProduct2 = firebase.functions().httpsCallable('admin_deleteProduct2')
export async function deleteProduct2(docId){
    await cf_deleteProduct2(docId)
//     const ref = firebase.storage().ref()
//        .child(Constant.storageFolderName.PRODUCT_IMAGE + imageName)
//    await ref.delete()
}

// USERS
const cf_getUserList2 = firebase.functions().httpsCallable('admin_getUserList2')
export async function getUserList2() {
    const result = await cf_getUserList2()
    return result.data
}
const cf_updateUser2 = firebase.functions().httpsCallable('admin_updateUser2')
export async function updateUser2(uid, update) {
    await cf_updateUser2({uid, update})
}

const cf_deleteUser = firebase.functions().httpsCallable('admin_deleteUser')
export async function deleteUser(uid) {
    await cf_deleteUser(uid)
}

const cf_isAdmin = firebase.functions().httpsCallable('admin_isAdmin')
export async function isAdmin(email) {
    if (Constant.adminEmails.includes(email))
    {
        return true
    } else
        return false
//     await cf_isAdmin(email)
//     let bool = await cf_isAdmin(email)
//    // return bool
//     // if (bool == false) {
//     //    console.log(bool)
//     //     return bool
//     // } else if (bool == true) {
//     //     console.log(bool)
//     //     return bool
//     // } 
//     bool.toString()
//     if (bool == 'bool = {data: false}') {
//        console.log(bool)
//         return false
//     } else {
//         console.log(bool)
//         return true
//     } 
}

