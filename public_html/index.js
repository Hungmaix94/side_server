const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const url = 'mongodb://localhost:27015/icvs?authSource=admin';

const TargetSchema = new Schema({
    "location": Array,
    "name": String,
    "industry": Array,
    "active": Boolean,
    "created_by": String,
    "niid": String,
    "updated_at": Date,
    "created_at": Date
}, {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});

mongoose.connect(url, {
    user: 'icvs',
    pass: 'icvs@123',
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.log(err, 'error'));


const target = getTarget("ACoAAC6P1LgBEmq374spirHGHRfnBtYFoV8g108");

/**
 * Lấy ra những đối tượng mà user mong muốn connect
 */
async function getTarget($niid) {
    const TargetModel = mongoose.model('ext_linkedin_target', TargetSchema, 'ext_linkedin_target');
    return await TargetModel.find({
        $or: [{
            niid: $niid
        }, {
            is_default: true
        }]
    });
}

/**
 * tim profile thuộc đối tượng nào
 * return list target ma profile đó thuộc
 */
function getTargetProfile($profile) {

}


/**
 * return random 1 template trong list template
 * @param $niid
 * @param $targets
 */
function getTemplateByTargets($niid, $targets){

}