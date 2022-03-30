import * as Element from './element.js'
import * as Auth from '../controller/auth.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as Review from '../model/review.js'
import * as AddReview from '../controller/add_review.js'

export function addEventListeners() {
    Element.menuButtonPurchases.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.PURCHASES)
        const label = Util.disableButton(Element.menuButtonPurchases)
        await purchases_page()
        Util.enableButton(Element.menuButtonPurchases, label)
    })
}

let carts
let reviewList
export async function purchases_page() {
    if (!Auth.currentUser) {
        Element.mainContent.innerHTML = '<h1>Protected Page</h1>'
        return
    }
    let html = '<h1>Purchase History</h1>'
    Element.mainContent.innerHTML = html

    try {
        carts = await FirebaseController.getPurchaseHistory(Auth.currentUser.uid)
        if (!carts || carts.length == 0) {
            html += 'No purchase history found.'
            return
        }
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Purchase History Error', JSON.stringify(e))
        return
    }
    

    
    html += `
    <table class="table table-striped">
        <thead>
        <tbody>
    `
    for (let index = 0; index < carts.length; index++) {
        html += `
        <tr><td>
            <form class ="purchase-history" method="post">
                <input type="hidden" name="index" value="${index}">
                <button class="btn btn-outline-secondary" type="submit">
                    ${new Date(carts[index].timestamp).toString()}
            </form>
        </td></tr>
        `
    }
    html += '</tbody></table>'

    Element.mainContent.innerHTML = html

    const historyForms = document.getElementsByClassName('purchase-history')
    for (let i = 0; i < historyForms.length; i++) {
        historyForms[i].addEventListener('submit', e => {
            e.preventDefault()
            const index = e.target.index.value

            Element.modalTransactionTitle.innerHTML = `Purchased At: ${new Date(carts[index].timestamp).toString()}`
            Element.modalTransactionBody.innerHTML = buildTransactionDetail(carts[index])


            $('#modal-transaction').modal('show')
            
            
            const addReviewButtons = document.getElementsByClassName('form-add-review-button')
            for (let i = 0; i < addReviewButtons.length; i++) {
                addReviewButtons[i].addEventListener('submit', e => {
                    e.preventDefault()
                    let result = e.target.productId.value
                    saveToLocalStorage(result)
                    let r = e.target.name.value
                    console.log(r)
                    

                    Element.modalReviewTitle.innerHTML = `Review for ${result}`
                    
                    $('#modal-transaction').modal('hide')
                    $('#modal-add-review').modal('show')

                })
            }
            const viewButtons = document.getElementsByClassName('form-view-review')
            for (let i = 0; i < viewButtons.length; i++) {
                viewButtons[i].addEventListener('submit', async e => {
                    e.preventDefault()
                    const docId = e.target.docId.value
                    console.log('VIEW: ' + docId)
                    const name = e.target.name.value
                    let imgStr = window.localStorage.getItem(`image-review-${Auth.currentUser.uid}`)
                    let imageURL = imgStr.replace(/['"]+/g, '')
                    // console.log(name)
                    const button = e.target.getElementsByTagName('button')[0]
                    const label = Util.disableButton(button)

                    $('#modal-transaction').modal('hide')
                    let add = await AddReview.buildReviewList(docId, imageURL)
                    Element.modalViewReviewTitle.innerHTML = `Review(s) of ${name}`
                    Element.modalViewReviewBody.innerHTML = add
                    window.localStorage.removeItem(`image-review-${Auth.currentUser.uid}`)
   
                    if (add) {
                        $('#modal-view-review').modal('show')
                    }
                   
                    Util.enableButton(button, label)

                    //Delete Reviews
                    const deleteReviewButtons = document.getElementsByClassName('form-delete-review-button')
                    for (let i = 0; i < deleteReviewButtons.length; i++) {
                        deleteReviewButtons[i].addEventListener('submit', async e => {
                            e.preventDefault()
                            console.log(`Button Clicked!`)
                        
                            //Named 2 not to be confused within the nested EventListeners
                            const index2 = i
                            console.log(index2)
       
                            let reviewList = await FirebaseController.getReviewList(docId, imageURL)
                            console.log(reviewList)
       
                            const button = e.target.getElementsByTagName('button')[0]
                            const label = Util.disableButton(button)
                            console.log(`Button Clicked!`)
                       
                            await AddReview.deleteReviewFromPurchases(index2, reviewList, name,add)
                            Util.enableButton(button, label)
                            
                        })
                    }
                    
                            //Edit Reviews
                            const editReviewsButtons = document.getElementsByClassName('form-edit-review-button')
                            for (let i = 0; i < editReviewsButtons.length; i++){
                                editReviewsButtons[i].addEventListener('submit', async e => {
                                    e.preventDefault()

                                    const index = i
                                    //console.log(index)
                                    let reviewList = await FirebaseController.getReviewList(docId, imageURL)

                                    const button = e.target.getElementsByTagName('button')[0]
                                    const label = Util.disableButton(button)
                                    
                                    console.log(`Edit Clicked!`)

                                    $('#modal-view-review').modal('hide')

                                    await AddReview.editReviewFromHome(index, reviewList)
                                    //$('#modal-view-review').modal('hide')
                                    Util.enableButton(button, label)
                                
                                })
                                
                                
                            
                    }

        
                })
     
            }
        })
    }
}



    function buildTransactionDetail(cart) {
        let html = `
    <table class="table table-striped">
        <thead>
            <tr>
            <th scope="col">Image</th>
            <th scope="col">Name</th>
            <th scope="col">Price</th>
            <th scope="col">Qty</th>
            <th scope="col">Subtotal</th>
            <th scope="col" width ="50%">Summary</th>
            </tr>
        </thead>
        <tbody>

    `
    cart.items.forEach(item => {
        html += `
    <tr>
        <td><img src="${item.imageURL}" width="150px"></td>
        <td>${item.name}</td>
        <td>${Util.currency(item.price)}</td>
        <td>${item.qty}</td>
        <td>${Util.currency(item.price * item.qty)}</td>
        <td>${item.summary}</td>
        <td><div>
                <form class="form-view-review " method="post">
                    <input type="hidden" name="docId" value="${item.docId}">
                    <input type= "hidden" name="name" value="${item.name}">
                    <input type= "hidden" name="imageURL" value="${item.imageURL}">
                    <button class="btn btn-outline-warning " type="submit">
                    View Reviews
                    </button>
                </form>
        </td></div>
        <td><div>
                <form class="form-add-review-button" method="post">
                <input type="hidden" name="productId" value="${item.docId}">
                <button id="button-add-review" class="btn btn-outline-secondary" type="submit">
                Write a product review
                </button>
                </form>
            
        </div></td>
    </tr>
    `


        saveImageToLocalStorage(item.imageURL)
    
    
    })
       

        html += '</tbody></table>'
        html += `<div style="font-size: 150%">Total: ${Util.currency(cart.getTotalPrice())}</div>`
        return html
}

function saveToLocalStorage(docId) {
    window.localStorage.setItem(`review-${Auth.currentUser.uid}`, JSON.stringify(`${docId}`))
}
    function saveImageToLocalStorage(imageURL) {
        window.localStorage.setItem(`image-review-${Auth.currentUser.uid}`, JSON.stringify(`${imageURL}`))
    }