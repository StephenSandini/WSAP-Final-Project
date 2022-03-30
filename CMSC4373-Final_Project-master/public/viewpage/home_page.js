import * as Element from './element.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as Auth from '../controller/auth.js'
import * as Add from '../controller/add_product.js'
import * as Edit from '../controller/edit_product.js'
import * as AddReview from '../controller/add_review.js'
import {ShoppingCart} from '../model/shoppingcart.js'

export function addEventListeners() {
    Element.menuButtonHome.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.HOME)
        const label = Util.disableButton(Element.menuButtonHome)
        await home_page()
        Util.enableButton(Element.menuButtonHome, label)
    })
}
//AVAILABLE TO ENTIRE PAGE
let products;
export let cart;
let html = '';






export async function home_page() {
    let admin;
    // console.log('before check')
    
    if (Auth.currentUser) {
        try {
            admin = await FirebaseController.isAdmin(Auth.currentUser.email)
            // console.log(`admin = ${admin}`)
            // console.log('during check')
                        
        } catch (e) {
            if (Constant.DEV) console.log(e)
            return
        }
    }
    // console.log('after check')
    // if (admin == true) { console.log('true') }
    // if (admin == false) { console.log('false') }
    // if (admin == null) { console.log('null') }
    // console.log('after check after')
    if (admin == true) {
        html = `
        <h1>Products Catalog</h1> <br>
            <div>
                <button id="button-add-product" class="btn btn-outline-danger"
                >+ Add Product</button>
            </div>

        `
        Element.mainContent.innerHTML = html

        try {
            products = await FirebaseController.getProductList2()
            if (cart && cart.items) {
                cart.items.forEach(item => {
                    const product = products.find(p => {
                        return item.docId == p.docId
                    })
                    product.qty = item.qty
                })
            }
            let index = 0
            products.forEach(product => {
                
                html += buildProductCardAdmin(product, index)
                ++index
              
            })
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Get ProductsList2 As Admin Error', JSON.stringify(e))
            return
        }


        Element.mainContent.innerHTML = html
          
        //Add Product
        document.getElementById('button-add-product').addEventListener('click', () => {
            Element.formAddProduct.reset()
            Add.resetImageSelection()
            $('#modal-add-product').modal('show')
        })
        //Edit Product
        const editButtons = document.getElementsByClassName('form-edit-product')
        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('submit', async e => {
                e.preventDefault()
                const button = e.target.getElementsByTagName('button')[0]
                const label = Util.disableButton(button)
                await Edit.editProduct(e.target.docId.value)
                Util.enableButton(button, label)
            })
        }
        const deleteButtons = document.getElementsByClassName('form-delete-product')
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('submit', async e => {
                e.preventDefault()
                const button = e.target.getElementsByTagName('button')[0]
                const label = Util.disableButton(button)
                await Edit.deleteProduct2(e.target.docId.value, e.target.imageName.value)
                Util.enableButton(button, label)
            })
        }
        //WORKING HERE PLACE HOLDER
        const viewButtons = document.getElementsByClassName('form-view-review')
        for (let i = 0; i < viewButtons.length; i++) {
            viewButtons[i].addEventListener('submit', async e => {
                e.preventDefault()
                const index = e.target.index.value
                const button = e.target.getElementsByTagName('button')[0]
                const label = Util.disableButton(button)
                let docId = products[index].docId
                let imageURL = products[index].imageURL
                let body = await AddReview.buildReviewList(docId, imageURL)

                
                Element.modalViewReviewTitle.innerHTML = `Review of ${products[index].name}`
                Element.modalViewReviewBody.innerHTML = body
                
                if (body) {
                    $('#modal-view-review').modal('show')
                }
                Util.enableButton(button, label)

                //DELETE REVIEW
                const deleteReviewButtons = document.getElementsByClassName('form-delete-review-button')
                for (let i = 0; i < deleteReviewButtons.length; i++) {
                    deleteReviewButtons[i].addEventListener('submit', async e => {
                        e.preventDefault()
                        console.log(`Button Clicked!`)
                 
                        const index2 = i
                        //  console.log(index2)

                        let reviewList = await FirebaseController.getReviewList(docId, imageURL)
                        // console.log(reviewList)

                        const button = e.target.getElementsByTagName('button')[0]
                        const label = Util.disableButton(button)
                        console.log(`Button Clicked!`)
                
                        await AddReview.deleteReviewFromHome(index2, reviewList, body, products, index)
                        Util.enableButton(button, label)
     
                    })
                }
                    
                 
                const editReviewsButtons = document.getElementsByClassName('form-edit-review-button')
                for (let i = 0; i < editReviewsButtons.length; i++) {
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

        // } else if(!Constant.adminEmails.includes(Auth.currentUser.email)||Auth.currentUser.email==null) {
    } else if(!admin) {
        html = `
        <h1>Products Catalog</h1> <br>
            
        `
        Element.mainContent.innerHTML = html
        try {
            products = await FirebaseController.getProductList2()
            if (cart && cart.items) {
                cart.items.forEach(item => {
                    const product = products.find(p => {
                        return item.docId == p.docId
                    })
                    product.qty = item.qty
                })
            }
            let index = 0
            products.forEach(product => {
                // if (Constant.adminEmails.includes(Auth.currentUser.email)) {
                //     html += buildProductCardAdmin(product, index)
                //     ++index
                // } else {
                html += buildProductCard(product, index)
                ++index
                //}
            })
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Get ProductsList2 Error', JSON.stringify(e))
            return
        }


        Element.mainContent.innerHTML = html
        // Event Listeners for +/- buttons
        const plusForms = document.getElementsByClassName('form-increase-qty')
        for (let i = 0; i < plusForms.length; i++) {
            plusForms[i].addEventListener('submit', e => {
                e.preventDefault()
                const p = products[e.target.index.value]
                cart.addItem(p)
                document.getElementById(`qty-${p.docId}`).innerHTML = p.qty
                Element.shoppingCartCount.innerHTML = cart.getTotalQty()
            })
        }
     
        const minusForms = document.getElementsByClassName('form-decrease-qty')
        for (let i = 0; i < minusForms.length; i++) {
            minusForms[i].addEventListener('submit', e => {
                e.preventDefault()
                const p = products[e.target.index.value]
                cart.removeItem(p)
                document.getElementById(`qty-${p.docId}`).innerHTML
                    = (p.qty == null || p.qty == 0) ? 'Add' : p.qty
                Element.shoppingCartCount.innerHTML = cart.getTotalQty()
 
            })
        }
           //WORKING HERE PLACE HOLDER
    const viewButtons = document.getElementsByClassName('form-view-review')
    for (let i = 0; i < viewButtons.length; i++) {
        viewButtons[i].addEventListener('submit', async e => {
            e.preventDefault()
            const index = e.target.index.value
            const button = e.target.getElementsByTagName('button')[0]
            const label = Util.disableButton(button)
            let docId = products[index].docId
            let imageURL = products[index].imageURL
            let body = await AddReview.buildReviewList(docId, imageURL)


            Element.modalViewReviewTitle.innerHTML = `Review of ${products[index].name}`
            Element.modalViewReviewBody.innerHTML = body

            if (body) {
                $('#modal-view-review').modal('show')
            }
            Util.enableButton(button, label)

            //Delete Reviews
             const deleteReviewButtons = document.getElementsByClassName('form-delete-review-button')
             for (let i = 0; i < deleteReviewButtons.length; i++){
             deleteReviewButtons[i].addEventListener('submit', async e => {
                 e.preventDefault()
                 console.log(`Button Clicked!`)
                 
                 const index2 = i
                 //console.log(index2)

                 let reviewList = await FirebaseController.getReviewList(docId, imageURL)
                // console.log(reviewList)

                 const button = e.target.getElementsByTagName('button')[0]
                 const label = Util.disableButton(button)
                 console.log(`Button Clicked!`)
                
                 await AddReview.deleteReviewFromHome(index2, reviewList, body, products, index)
                Util.enableButton(button,label)
     
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
      
        
     
    } 
 
}

    function buildProductCard(product, index) {
        return `
    <div class="card" style="width: 18rem; display: inline-block">
        <img src="${product.imageURL}" class="card-img-top">
        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">
                ${Util.currency(product.price)} <br>
                ${product.summary}
                </p>
                <div class="container pt-3 bg-light ${Auth.currentUser ? 'd-block' : 'd-none'}">
                <form method="post" class ="d-inline form-decrease-qty">
                    <input type="hidden" name="index" value="${index}">
                    <button class="btn btn-outline-danger" type="submit">&minus;</button>
                </form>
                <div id ="qty-${product.docId}"
                    class = "container rounded text-center text-white bg-primary d-inline-block w-50">
                    ${product.qty == null || product.qty == 0 ? 'Add' : product.qty}
                </div>
                <form method="post" class="d-inline form-increase-qty">
                    <input type="hidden" name="index" value="${index}">
                    <button class="btn btn-outline-danger" type="submit">&plus;</button>
                </form>
                </div>
                <div>
                <form class="form-view-review" method="post">
                    <input type="hidden" name="imageURL" value="${product.imageURL}">
                    <input type="hidden" name="index" value="${index}">
                    <button class="btn btn-outline-warning " type="submit">
                    View Reviews
                    </button>
                </form>
                </div>
        </div>
    </div>
    `
    }
    function buildProductCardAdmin(product, index) {
        return `
    <div id="card-${product.docId}" class="card" style="width: 18rem; display: inline-block">
        <img src="${product.imageURL}" class="card-img-top">
        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">
                ${Util.currency(product.price)} <br>
                ${product.summary}
                </p>
        </div>
        <div class = "container pt-3 bg-light ${Auth.currentUser ? 'd-block' : 'd-none'}">
        <form class="form-edit-product float-left" method="post">
            <input type="hidden" name="docId" value="${product.docId}">
            <input type="hidden" name="index" value="${index}">
            <button class="btn btn-outline-info" type="submit">Edit</button>
        </form>
        <form class="form-delete-product float-right" method="post">
        <input type="hidden" name="docId" value="${product.docId}">
        <input type ="hidden" name="imageName" value"${product.imageName}">
        <input type="hidden" name="index" value="${index}">
        <button class="btn btn-outline-danger" type="submit">Delete</button> 
        </form>
        </div>
        <div>
            <form class="form-view-review" method="post">
               <input type="hidden" name="index" value="${index}">
                <input type="hidden" name="imageURL" value="${product.imageURL}">
                <button class="btn btn-outline-warning " type="submit">
                View Reviews
                </button>
            </form>
        </div>
    </div>
    `
    }

export function getShoppingCartFromLocalStorage() {
        let cartStr = window.localStorage.getItem(`cart-${Auth.currentUser.uid}`)
        // cartStr = '{"key": 50}'
        cart = ShoppingCart.parse(cartStr)
        //SIGNS CART DATA HAS BEEN CORRUPTED
        if (!cart || !cart.isValid() || Auth.currentUser.uid != cart.uid) {
            window.localStorage.removeItem(`cart-${Auth.currentUser.uid}`)
            cart = new ShoppingCart(Auth.currentUser.uid)
        }
    
        Element.shoppingCartCount.innerHTML = cart.getTotalQty()
}



    

