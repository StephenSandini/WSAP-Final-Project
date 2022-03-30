import * as HomePage from '../viewpage/home_page.js'
import * as PurchasesPage from '../viewpage/purchases_page.js'
import * as ProfilePage from '../viewpage/profile_page.js'
import * as ShoppingCartPage from '../viewpage/shoppingcart_page.js'
import * as UsersPage from '../viewpage/users_page.js'

export const routePathname = {
    HOME: '/',
    PURCHASES: '/purchases',
    PROFILE: '/profile',
    SHOPPINGCART: '/shoppingcart',
    USERS: '/users',
}

export const routes = [
    { pathname: routePathname.HOME, page: HomePage.home_page},
    { pathname: routePathname.PURCHASES, page: PurchasesPage.purchases_page },
    { pathname: routePathname.PROFILE, page: ProfilePage.profile_page },
    { pathname: routePathname.SHOPPINGCART, page: ShoppingCartPage.shoppingcart_page },
    { pathname: routePathname.USERS, page: UsersPage.users_page},
    
]

export function routing(path) {
    const route = routes.find(r => r.pathname == path)
    if (route) route.page()
   else routes[0].page()
}