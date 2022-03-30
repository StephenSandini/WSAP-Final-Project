export class AccountInfo{
    //data comes from firestore
    constructor(data) {
        this.docId = data.docId
        this.name = data.name
        this.address = data.address
        this.city = data.city
        this.state = data.state
        this.zip = data.zip
        this.creditCardNo = data.creditCardNo
        this.photoURL = data.photoURL
        
    }

    serialize() {
        return {
            name: this.name,
            address: this.address,
            city: this.city,
            state: this.state,
            zip: this.zip,
            creditCardNo: this.creditCardNo,
            photoURL: this.photoURL,
        }
    }

    static instance() {
        return new AccountInfo({
            name: '', address: '', city: '',
            state: '', zip: 0, creditCardNo: 0,
            photoURL: 'images/blank_profile.jfif',
        })
    }
}