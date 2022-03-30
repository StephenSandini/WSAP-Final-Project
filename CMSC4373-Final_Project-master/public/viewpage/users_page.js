import * as Element from './element.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from './util.js'
import * as Auth from '../controller/auth.js'

    


export function addEventListeners() {
    Element.menuManageUsers.addEventListener('click', async () => {
        const label = Util.disableButton(Element.menuManageUsers)
        history.pushState(null, null, Routes.routePathname.USERS)
        await users_page()
        Util.enableButton(Element.menuManageUsers, label)
    })
}
export async function users_page() {
    if (!Auth.currentUser) {
        Element.mainContent.innerHTML = '<h1>Protected Page</h1>'
        return
    }
    
    let userList
    let disabledValue
    
    let html = `
    <h1>Manage Users</h1>
    `
    
    try {
        userList = await FirebaseController.getUserList2()
        userList.forEach(async user => {
            let account_Info //= await FirebaseController.getAccountInfo(user)
            html += buildUserCard(user, account_Info)

            //html += buildUserCard(user)

            
            
            });
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Error getUserList2', JSON.stringify(e))
    }
    
    Element.mainContent.innerHTML = html

    const toggleForms = document.getElementsByClassName('form-toggle-users')
    for (let i = 0; i < toggleForms.length; i++){
        toggleForms[i].addEventListener('submit', async e => {
            e.preventDefault()
            const button = e.target.getElementsByTagName('button')[0]
            const label = Util.disableButton(button)

            const uid = e.target.uid.value
            const update = {
                disabled: e.target.disabled.value === 'true' ? false : true
            }
            //Display text appropriate to the User's Display
            if (e.target.disabled.value == 'true')
                disabledValue = 'Active'
            else
                disabledValue = 'Disabled'
            try {
                await FirebaseController.updateUser2(uid, update)
                e.target.disabled.value = `${update.disabled}`
                document.getElementById(`status-${uid}`).innerHTML
                    =`${update.disabled ? 'Disabled' : 'Active'}`
                Util.popupInfo('Account Status Updated', `Status: ${disabledValue}`)
            } catch (e) {
                if (Constant.DEV) console.log(e)
                Util.popupInfo('Toggle Status Error', JSON.stringify(e))
            }
            Util.enableButton(button,label)
        })
    }

    const deleteForms = document.getElementsByClassName('form-delete-user')
    for (let i = 0; i < deleteForms.length; i++){
        deleteForms[i].addEventListener('submit', async e => {
            e.preventDefault()
            //CONFIRM
            const r = confirm('Are you sure you want to delete the user?')
            if (!r) return
            const button = e.target.getElementsByTagName('button')[0]
            const label = Util.disableButton(button)
            const uid = e.target.uid.value
            try {
                await FirebaseController.deleteUser(uid)
                document.getElementById(`user-card-${uid}`).remove()
                Util.popupInfo('Deleted!', `User Deleted: UID(${uid})`)
            } catch (e) {
                if (Constant.DEV) console.log(e)
                Util.popupInfo('deleteUser Error', JSON.stringify(e))
                Util.enableButton(button, label)
                
            }
            
        })
    }

    const detailForms = document.getElementsByClassName('form-detail-user')
    for (let i = 0; i < detailForms.length; i++){
        detailForms[i].addEventListener('submit', async e => {
            e.preventDefault()
            const button = e.target.getElementsByTagName('button')[0]
            const label = Util.disableButton(button)
            const uid = e.target.uid.value
            const email = e.target.email.value
            try {
                console.log(uid)
                console.log('Button Clicked')
                let body = await buildUserDetailModal(uid,email)

                Element.modalUserDetailTitle.innerHTML = `Profile of ${email}`
                Element.modalUserDetailBody.innerHTML = body

                $('#modal-user-detail').modal('show')
    
                
                
            } catch (e) {
                if (Constant.DEV) console.log(e)
                Util.popupInfo('userDetails Error', JSON.stringify(e))
                Util.enableButton(button, label)
                
            }
            Util.enableButton(button, label)
            //Delete BUTTON
            const deleteUserReviewButtons = document.getElementsByClassName('form-admin-delete-review-button')
            for (let i = 0; i < deleteUserReviewButtons.length; i++){
            deleteUserReviewButtons[i].addEventListener('submit', async e => {
                e.preventDefault()
                const button = e.target.getElementsByTagName('button')[0]
                const label = Util.disableButton(button)
                try {
                    let usersReviewList = await FirebaseController.getUsersReviewList(uid)
                    let index = i
                    $('#modal-user-detail').modal('hide')
                    await FirebaseController.deleteReview(usersReviewList[index].docId)
                    Util.popupInfo('Delete Review',`Success thread has been deleted.`)

                    
                } catch (e) {
                    if (Constant.DEV) console.log(e)
                    Util.popupInfo('Admin Delete Review Failed', JSON.stringify(e))
                    Util.enableButton(button, label)

                }
            //     await AddReview.deleteReviewFromHome(index2, reviewList, body, products, index)
                Util.enableButton(button, label)

               
        
            })
        }
      

            
        })
        
        
    }
   

}

function buildUserCard(user) {
    
             
        return `
        <div id="user-card-${user.uid}" class="card" style="width: 18rem; display: inline-block;">
            <img src="${Constant.adminEmails.includes(user.email) ? 'images/a.jpg' : 'images/b.jpg'}" "height:100px" class="card-img-top" >
            <div class="card-body">
                <h5 class="card-title ">${user.email}</h5>
                <p class="card-text">
                    Account Status: <span id="status-${user.uid}"> ${user.disabled ? 'Disabled' : 'Active'} </span>
                </p>
                <div class = "btn-group" role="group" aria-label="Admin Buttons">
                <form class="form-toggle-users" method="post">
                    <input type="hidden" name="uid" value="${user.uid}">
                    <input type="hidden" name="disabled" value="${user.disabled}">
                    <button class="btn btn-outline-primary btn-custom" type="submit">Toggle Active</button>
                </form>
                </form>
                <form class="form-detail-user" method="post">
                    <input type="hidden" name="email" value="${user.email}">
                    <input type="hidden" name="uid" value="${user.uid}">
                    <button class="btn btn-outline-info btn-custom" type="submit">Details</button>
                </form>
                <form class="form-delete-user" method="post">
                    <input type="hidden" name="uid" value="${user.uid}">
                    <button class="btn btn-outline-danger btn-custom" type="submit">Delete</button>
                </form>           
                </div>
            </div>
        </div>
        `  
    
}

async function buildUserDetailModal(uid, email) {
    let accountInfo = await FirebaseController.getAccountInfo(uid)
    let usersReviewList = await FirebaseController.getUsersReviewList(uid)
    let productList = []
    for (let i = 0; i < usersReviewList.length; i++){
        let productInfo = await FirebaseController.getProductById2(usersReviewList[i].productId)
        if(productInfo)
        productList.push(productInfo)
    }
    
    

    let html = `
    <div>
        <img src="${accountInfo.photoURL} heigh:"150px" width:"150px">
        <div class="body">
            
            <p class="card-text">${email}</p>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item">Name: ${accountInfo.name} </li>
            <li class="list-group-item">Address:  ${accountInfo.address}</li>
            <li class="list-group-item">City:  ${accountInfo.city} </li>
            <li class="list-group-item">State:  ${accountInfo.state}</li>
        </ul>
        <table class="card-table table">
    <thead>
      <tr>
        <th scope="col">Image of Product</th>
        <th scope="col">Product Name</th>
        <th scope="col">Rating</th>
        <th scope="col">Review</th>
        <th scope="col"></th>
      </tr>
    </thead>
    <tbody>
          
        `
    
    for (let index = 0; index < usersReviewList.length; index++){
        html += `
            <tr>
                <td><img src="${productList[index].imageURL}" width="50px" height="50px"></td>
                <td>${productList[index].name}</td>
                <td>${usersReviewList[index].rating}</td>
                <td>${usersReviewList[index].reviewText}</td>
                <td>
                    <form id="form-admin-delete-review-button" method="post" class="d-line form-admin-delete-review-button">
                        <input="hidden" name="index" value="${index}">
                        <input="hidden" name="docId" value="${usersReviewList[index].docId}">
                        <input="hidden" name="productList" value="${productList}">
                        <button class="btn btn-outline-danger" type="submit">Delete</button>
                    </form>        
                </td>
            </tr>
      `
       
    }
    
    html +=
        `   </tbody>
        </table>

        </div>
    </div>
    `
    return html
}