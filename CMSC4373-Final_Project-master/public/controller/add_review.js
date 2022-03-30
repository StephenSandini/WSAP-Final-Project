import { Review } from '../model/review.js'
import * as Element from '../viewpage/element.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as PurchasesPage from '../viewpage/purchases_page.js'
import * as Auth from './auth.js'

let track

export function addEventListeners() {
    Element.formAddReview.addEventListener('submit', async e => {
        e.preventDefault()
        // const rating=e.target.rating.value
        // if (document.getElementById('1-star'))
        //     rating = 1
        // else if (document.getElementById('2-star'))
        //     rating = 2
        //     else if(document.getElementById('3-star'))
        //     rating = 3
        //     else if(document.getElementById('4-star'))
        //     rating = 4
        //     else if(document.getElementById('5-star'))
        //     rating = 5
        // else
        //     null
        

        //console.log(rating)
        try {
            const button = Element.formAddReview.getElementsByTagName('button')[0]
            const label = Util.disableButton(button)
            await addNewReview(e)
            Util.enableButton(button, label)
            await PurchasesPage.purchases_page()
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Error In Adding', JSON.stringify(e))
        }
        
        
        
    })
   
}

async function addNewReview(e) {
    const reviewText = e.target.reviewText.value
  
    const rating = e.target.ratings.value
    console.log(`${ rating }`)
    let createdBy = Auth.currentUser.uid
    //Restructuring TimeStamp
    const timeElapsed = Date.now()
    const today = new Date(timeElapsed)
    let timeStamp = today.toString()
    let pStr = window.localStorage.getItem(`review-${Auth.currentUser.uid}`)
    let productId = pStr.replace(/['"]+/g, '')
   

    
    

    
    const errorTags = document.getElementsByClassName('error-add-review')
    for (let i = 0; i < errorTags.length; i++)
        errorTags[i].innerHTML = ''
    
    const review = new Review({ reviewText, rating, createdBy, timeStamp, productId });
    const errors = review.validate()
    if (errors) {
        if (errors.reviewText)
            Element.formAddReviewError.textReview.innerHTML = errors.reviewText
        if (errors.rating)
            Element.formAddReviewError.rating.innerHTML = errors.rating
        return
    }

    try {
        await FirebaseController.addReview(review)
        Element.formAddReview.reset()
        window.localStorage.removeItem(`review-${Auth.currentUser.uid}`)
        Util.popupInfo('Success!', 'Your review has been submitted.', 'modal-add-review')
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Add Review Error', JSON.stringify(e), 'modal-add-review')
    }
}

export async function buildReviewList(docId, imageURL) {
    let html = ''
    let reviewList = []
    let sum = 0
   

    try {
       
        reviewList = await FirebaseController.getReviewList(docId)
        
        if (!reviewList || reviewList.length == 0) {
            $('#modal-view-review').modal('hide')
            Util.popupInfo(`Product Review`, 'Currently this product does not have any reviews.')
            return
        }
        // else return reviewList
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Get Review List Error', JSON.stringify(e))
        return
    }
    
    for (let index = 0; index < reviewList.length; index++) {
        sum += reviewList[index].rating
    }
    let total = sum/reviewList.length
    html = `
    <table class="table table-striped" id="myTable">
        <thead>
        <img src="${imageURL}" width="150px" height="150px">
        Avg. Rating: ${total}
        <tr>
        <th scope="col" width="50%">Review</th>
        <th scope="col">Rating</th>
        <th scope="col">Created By</th>
        <th scope="col">Date</th>
        </tr>
        </thead>
        
        <tbody>
       
    `
    track = 0
   
    for (let index = 0; index < reviewList.length; index++){
    //Add || isAdmin next to createdBy so admins can see all delete buttons and delete reviews.
        track++
        
        html += `
    <tr id="${track}+${track+1}+${reviewList[index].docId}">
        <td>${reviewList[index].reviewText}</td>
        <td>${reviewList[index].rating}</td>
        <td>${reviewList[index].createdBy}</td>
        <td>${reviewList[index].timeStamp}</td>
       
        <td>
        <div  class="container1 ${Auth.currentUser != null && Auth.currentUser.uid == reviewList[index].createdBy
            ? 'd-block' : 'd-none'}">
            <form id="edit-review-button" method="post" class="d-inline form-edit-review-button">
                <button class="btn btn-outline-info" type="submit">Edit</button>
            </form>
        </div>
        <div  class="container2 ${Auth.currentUser != null && (Auth.currentUser.uid == reviewList[index].createdBy
                || Constant.adminEmails.includes(Auth.currentUser.email)) ? 'd-block' : 'd-none'}">
            <form id="delete-review-button" method="post" class="d-inline form-delete-review-button">
                <input="hidden" name="index" value="index">
                <input="hidden" name="reviewList" value="reviewList">
                <button class="btn btn-outline-danger" type="submit">Delete</button>
            </form>
        </div>
        </td>
    </tr>`   
    }
    html += '</tbody></table>'
    
    // window.localStorage.setItem(`${track}+${track+1}+${reviewList[track-1].createdBy}`, JSON.stringify(`${docId}`))
    return html
}

export async function deleteReviewFromHome(delReview, reviewList, body, products, index) {
    try {
        // let drStr = window.localStorage.getItem(`${track}+${track+1}+${Auth.currentUser.uid}`)
        // let delReview = drStr.replace(/['"]+/g, '')
         console.log(delReview)
        console.log(track)
        let delDocId = reviewList[delReview].docId
        await FirebaseController.deleteReview(delDocId)
        
        //Delete table row containing the info
        $('#modal-view-review').modal('hide')
        Util.popupInfo('Deleted!', `${delDocId} has been successfully removed.`)
        
        //Home Screen
        Element.modalViewReviewTitle.innerHTML = `Review of ${products[index].name}`
        Element.modalViewReviewBody.innerHTML = body
        
        $('#modal-view-review').modal('show')

    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Delete Review Error', JSON.stringify(e))
        // window.localStorage.clear()
    }
}

export async function deleteReviewFromPurchases(delReview, reviewList, name, add) {
    try {
        // let drStr = window.localStorage.getItem(`${track}+${track+1}+${Auth.currentUser.uid}`)
        // let delReview = drStr.replace(/['"]+/g, '')
        console.log(delReview)
        console.log(track)
        let delDocId = reviewList[delReview].docId
        await FirebaseController.deleteReview(delDocId)
        
        //Delete table row containing the info
        $('#modal-view-review').modal('hide')
        Util.popupInfo('Deleted!', `${delDocId} has been successfully removed.`)
        
        
        //Purchases Screen
        Element.modalViewReviewTitle.innerHTML = `Review(s) of ${name}`
        Element.modalViewReviewBody.innerHTML = add
        $('#modal-view-review').modal('show')

    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Delete Review Error', JSON.stringify(e))
        // window.localStorage.clear()
    }

}

export async function editReviewFromHome(editIndex, reviewList) {
    let review
    try {
        let editDocId = reviewList[editIndex].docId
        review = await FirebaseController.getReviewById(editDocId)
        if (!review) {
            Util.popupInfo('getReviewById Error', `No review by id ${editDocId}`)
            return
        }
        
    } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Edit Review Error', JSON.stringify(e))
    }
        Element.formEditReview.docId.value = review.docId
        //Element.formEditReview.rating.value = review.rating
        Element.formEditReview.reviewText.value = review.reviewText
    
        $('#modal-edit-review').modal('show')
  
    //Util.popupInfo('Update Review','You successfully updated the review')


    
}


