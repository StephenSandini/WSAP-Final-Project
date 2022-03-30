import * as Element from '../viewpage/element.js'
import * as FirebaseController from './firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as Routes from './routes.js'
import * as HomePage from '../viewpage/home_page.js'
import * as ProfilePage from '../viewpage/profile_page.js'

export let currentUser

export function addEventListeners() {
    
    //SIGN IN LISTENER
    Element.formSignin.addEventListener('submit', async e => {
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value

        try {
            await FirebaseController.signIn(email, password)
            $('#modal-form-signin').modal('hide')
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Sign In Error', JSON.stringify(e), 'modal-form-signin') //Pops up and Error Modal, Error Code, closes the modal
        }
    })

    //SIGN OUT LISTENER
    Element.menuButtonSignout.addEventListener('click', async () => {
        try {
            console.log(currentUser.email)
            await FirebaseController.signOut()
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Sign Out Error', JSON.stringify(e),)
        }
    })
    //ADMIN SIGN OUT LISTENER
    Element.adminButtonSignout.addEventListener('click', async () => {
        try {
            console.log(currentUser.email)
            await FirebaseController.signOut()
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Sign Out Error', JSON.stringify(e),)
        }

    })

//CHANGES THE PRE AND POST NEED THIS ON HOME PAGE
    firebase.auth().onAuthStateChanged(async user => {
        if (user && Constant.adminEmails.includes(user.email)) {
            currentUser = user
            
            let elements = document.getElementsByClassName('modal-pre-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
            elements = document.getElementsByClassName('modal-post-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
            elements = document.getElementsByClassName('modal-post-admin')
            for (let i = 0; i < elements.length; i++)
                    elements[i].style.display = 'block'
            const path = window.location.pathname
            Routes.routing(path)
        } else if (user && !Constant.adminEmails.includes(user.email)) {
            currentUser = user
            HomePage.getShoppingCartFromLocalStorage()

            const accountInfo = await FirebaseController.getAccountInfo(user.uid)
            ProfilePage.setProfileIcon(accountInfo.photoURL)

            let elements = document.getElementsByClassName('modal-pre-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
            elements = document.getElementsByClassName('modal-post-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block'
                elements = document.getElementsByClassName('modal-post-admin')
                for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
            
            const path = window.location.pathname
            Routes.routing(path)
           
            
        } else {
            currentUser = null
            // currentUser.email = 'guest@test.com'
            let elements = document.getElementsByClassName('modal-pre-auth')
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block'
                elements = document.getElementsByClassName('modal-post-auth')
                for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
                elements = document.getElementsByClassName('modal-post-admin')
                for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none'
            
            history.pushState(null, null, Routes.routePathname.HOME)
            const path = window.location.pathname
            Routes.routing(path)
        }
    })

    Element.buttonSignUp.addEventListener('click', () => {
        //show sign up modal
        $('#modal-form-signin').modal('hide')
        Element.formSignUp.reset()
        $('#modal-form-signup').modal('show')
    })
    Element.formSignUp.addEventListener('submit', e => {
        e.preventDefault()
        sign_up(e.target)
        
    })
}

async function sign_up(form) {
    const email = form.email.value
    const password = form.password.value
    const passwordConfirm = form.passwordConfirm.value

    Element.formSignUpPasswordError.innerHTML = ''

    if (password != passwordConfirm) {
        Element.formSignUpPasswordError.innerHTML = 'Two passwords do not match'
        return
    }

    try {
        await FirebaseController.createUser(email, password)
        Util.popupInfo('Account Created!', 'You are now signed in', 'modal-form-signup')
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Failed to create a new account', JSON.stringify(e), 'modal-form-signup')
    }
}