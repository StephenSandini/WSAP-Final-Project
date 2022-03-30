import { Product } from '../model/product.js'
import * as Element from '../viewpage/element.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'
import * as HomePage from '../viewpage/home_page.js'

let imageFile2Upload

export function resetImageSelection() {
    imageFile2Upload = null
    Element.imageTagAddProduct.src = ''
}

export function addEventListeners() {
    Element.formAddProduct.addEventListener('submit', async e => {
        e.preventDefault()
        const button = Element.formAddProduct.getElementsByTagName('button')[0]
        const label = Util.disableButton(button)
        await addNewProduct(e)
        await HomePage.home_page()
        Util.enableButton(button,label)
    })
    Element.formImageAddButton.addEventListener('change', e => {
        imageFile2Upload = e.target.files[0]
        if(!imageFile2Upload) return
        //DISPLAY IMAGE
        const reader = new FileReader()
        reader.onload = () => Element.imageTagAddProduct.src = reader.result
        reader.readAsDataURL(imageFile2Upload)
        Element.formAddProductError.image.innerHTML=''
    })            
}

async function addNewProduct(e) {
    const name = e.target.name.value
    const price = e.target.price.value
    const summary = e.target.summary.value

    const errorTags = document.getElementsByClassName('error-add-product')
    for (let i = 0; i < errorTags.length; i++)
        errorTags[i].innerHTML = ''

    const product = new Product({ name, price, summary });
    //Validate
    const errors = product.validate(imageFile2Upload)
    if (errors){
        if (errors.name)
            Element.formAddProductError.name.innerHTML = errors.name
        if (errors.price)
            Element.formAddProductError.price.innerHTML = errors.price
        if (errors.summary)
            Element.formAddProductError.summary.innerHTML=errors.summary
        if (errors.image)
            Element.formAddProductError.image.innerHTML = errors.image
        return
    }
    
    try {
        const { imageName, imageURL } = await FirebaseController.uploadImage(imageFile2Upload)
        product.imageName = imageName
        product.imageURL = imageURL
        await FirebaseController.addProduct2(product)

        Util.popupInfo('Success!', `${product.name} has been added!`, 'modal-add-product')
    } catch (e) {
        if (Constant.DEV) console.log(e)
        Util.popupInfo('Add Product Error', JSON.stringify(e), 'modal-add-product')
    }
}