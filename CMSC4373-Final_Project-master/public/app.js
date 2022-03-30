import * as Routes from './controller/routes.js'

//USE CLOUD FUNCTION EMULATOR
// if (window.location.host.includes('localhost') ||
//     window.location.host.includes('127.0.0.1')) {
//         firebase.functions().useFunctionsEmulator('http://localhost:5001')
// }

window.onload = () => {
    const path = window.location.pathname
    Routes.routing(path)
}
//Backward or Forward
window.addEventListener('popstate', e => {
    e.preventDefault()
    const pathname = e.target.location.pathname
    Routes.routing(pathname)
})
import * as Auth from './controller/auth.js'
import * as HomePage from './viewpage/home_page.js'
import * as PurchasesPage from './viewpage/purchases_page.js'
import * as ProfilePage from './viewpage/profile_page.js'
import * as ShoppingCartPage from './viewpage/shoppingcart_page.js'
import * as UsersPage from './viewpage/users_page.js'
import * as AddProducts from './controller/add_product.js'
import * as Edit from './controller/edit_product.js'
import * as AddReview from './controller/add_review.js'
import * as EditReview from './controller/edit_review.js'

Auth.addEventListeners()
HomePage.addEventListeners()
PurchasesPage.addEventListeners()
ProfilePage.addEventListeners()
ShoppingCartPage.addEventListeners()
AddProducts.addEventListeners()
Edit.addEventListeners()
UsersPage.addEventListeners()
AddReview.addEventListeners()
EditReview.addEventListeners()
