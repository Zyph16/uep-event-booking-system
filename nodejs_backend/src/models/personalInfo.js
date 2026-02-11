class PersonalInfo {
    constructor(personalinfoID, userID, fname, mname, lname, email, phone, street = null, city = null, barangay = null, province = null) {
        this.personalinfoID = personalinfoID;
        this.userID = userID;
        this.fname = fname;
        this.mname = mname;
        this.lname = lname;
        this.email = email;
        this.phone = phone;
        this.street = street;
        this.city = city;
        this.barangay = barangay;
        this.province = province;
    }

    static fromRow(row) {
        return new PersonalInfo(
            row.personalinfoID,
            row.userID,
            row.fname,
            row.mname || null,
            row.lname,
            row.email,
            row.phone || null,
            row.street || null,
            row.city || null,
            row.barangay || null,
            row.province || null
        );
    }

    getID() { return this.personalinfoID; }
    getUserID() { return this.userID; }
    getFname() { return this.fname; }
    getMname() { return this.mname; }
    getLname() { return this.lname; }
    getEmail() { return this.email; }
    getPhone() { return this.phone; }
    getStreet() { return this.street; }
    getCity() { return this.city; }
    getBarangay() { return this.barangay; }
    getProvince() { return this.province; }

    toArray() {
        return {
            personalinfoID: this.personalinfoID,
            userID: this.userID,
            fname: this.fname,
            mname: this.mname,
            lname: this.lname,
            email: this.email,
            phone: this.phone,
            street: this.street,
            city: this.city,
            barangay: this.barangay,
            province: this.province
        };
    }
}

module.exports = PersonalInfo;
