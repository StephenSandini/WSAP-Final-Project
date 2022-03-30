import { Review } from '../model/review.js'
import * as Element from '../viewpage/element.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from '../viewpage/util.js'


export function addEventListeners() {

    Element.formEditReview.addEventListener('submit', async e => {
        e.preventDefault()
        const button = e.target.getElementsByTagName('button')[0]
        const label = Util.disableButton(button)

        const r = new Review({
            rating: e.target.ratings.value,
            reviewText: e.target.reviewText.value,
           
        })
        const timeElapsed = Date.now()
        const today = new Date(timeElapsed)
        r.timeStamp = today.toString()
        r.docId = e.target.docId.value

        const errorTags = document.getElementsByClassName('error-edit-review')
        for (let i = 0; i < errorTags.length; i++)
            errorTags[i].innerHTML = ''
        
        const errors = r.validate(true)
        if (errors) {
            // if (errors.rating)
            //     Element.formEditReviewError.rating.innerHTML = errors.rating
            if (errors.reviewText)
                Element.formEditReviewError.reviewText.innerHTML = errors.reviewText
            Util.enableButton(button, label)
            return
        }

        try {  
            await FirebaseController.editReview(r)
            $('#modal-edit-review').modal('hide')
                 
        } catch (e) {
            if (Constant.DEV) console.log(e)
            Util.popupInfo('Update Review Error', JSON.stringify(e), 'modal-edit-review')
        }
        Util.enableButton(button, label)
        
    })
}