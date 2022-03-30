
export class Review {
    constructor(data) {
        this.reviewText = data.reviewText
        this.createdBy = data.createdBy
        this.rating =
            typeof data.rating == "number" ? data.rating : Number(data.rating)
        this.productId = data.productId
        this.timeStamp = data.timeStamp
    }

    serialize() {
        return {
            reviewText :this.reviewText,
            createdBy: this.createdBy,
            rating: this.rating,
            productId: this.productId,
            timeStamp: this.timeStamp,
        }
    }

    static isSearilizedReview(obj) {
        
        if (!obj.reviewText || typeof obj.reviewText != 'string') return false
        if (!obj.rating || typeof obj.rating != 'number') return false
        if (!obj.createdBy || typeof obj.createdBy != 'string') return false
        if (!obj.productId || typeof obj.productId != 'string') return false
        if (!obj.timeStamp || typeof obj.timeStamp !='number') return false
        
        return true        
    }

    serializeForUpdate() {
        const r = {}
        if (this.reviewText) r.reviewText = this.reviewText
        if (this.rating) r.rating = this.rating
        if (this.createdBy) r.createdBy = this.createdBy
        if (this.productId) r.productId = this.productId
        if (this.timeStamp) r.timeStamp = this.timeStamp
        return r
    }

    validate() {
        const errors = {}
        if (!this.reviewText || this.reviewText < 3)
            errors.reviewText = `Review's must be longer than 2 characters. `
        if (!this.rating || !(Number(this.rating)) || this.rating < 0 || this.rating > 5)
            errors.rating = 'Rating is invalid.'
        if(Object.keys(errors).length == 0) return null
        else return errors
    }

    
    
}