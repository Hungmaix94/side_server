const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const url = 'mongodb://localhost:27015/icvs?authSource=admin';
const {get} = require('lodash');
const TargetSchema = new Schema({
    location: Array,
    name: String,
    industry: Array,
    active: Boolean,
    created_by: String,
    niid: String,
    updated_at: Date,
    created_at: Date
}, {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});


const TemplateSchema = new Schema({
    name: String,
    content: String,
    target_id: String,
    active: Boolean,
    created_by: String,
    niid: String,
    location: Array,
    industry: Array,
    updated_at: Date,
    created_at: Date
}, {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});

mongoose.connect(url, {
    user: 'icvs',
    pass: 'icvs@123',
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.log(err, 'error'));

/**
 * Lấy ra những đối tượng mà user mong muốn connect
 */
async function getTargetByNiid(niid) {
    const TargetModel = mongoose.model('ext_linkedin_target', TargetSchema, 'ext_linkedin_target');
    return await TargetModel.find({
        $or: [{
            $and: [{
                niid: niid
            }, {
                active: true
            }]
        }, {
            $and: [{
                is_default: true
            }, {
                niid_not_used: {
                    $ne: niid
                }
            }]
        }]
    })
        .exec()
        .then((targets) => {
            return targets;
        })
        .catch((err) => {
            return 'error occured';
        });
    ;
}

/**
 * verify profile thuộc đối tượng cấu hình nào của user
 * return list target ma profile đó thuộc
 */
async function getTargetIDMapProfile(profile, targets) {

    let targetID = [];
    targets.forEach(async (target) => {

        let match = await checkProfileMapTarget(profile, target);
        if (match) {
            targetID.push(target._id.toString());
        }
    });

    return targetID;
}


function checkProfileMapTarget(profile, target) {
    let locationTarget = target.location;
    let industryTarget = target.industry;
    let locationProfile = profile.location;
    let industryProfile = profile.industry;
    let matchLocation = false;
    let matchIndustry = false;


    /**
     * match location k
     */
    if ((locationTarget && locationTarget.length === 0) || locationTarget.includes(locationProfile)) {

        matchLocation = true;
    }

    if ((industryTarget && industryTarget.length === 0) || industryTarget.includes(industryProfile)) {
        matchIndustry = true;
    }

    return matchLocation && matchIndustry;
}

/**
 * return random 1 template trong list template
 *
 */
async function getTemplateByTargetIDs(niid, targetIDs) {

    const TemplateModel = mongoose.model('ext_linkedin_template', TemplateSchema, 'ext_linkedin_template');
    const templates = await TemplateModel.find({
        $and: [{
            active: true,
            target_id: {
                $in: targetIDs
            }
        }, {
            $or: [{
                $and: [{
                    is_default: true
                }, {
                    niid_not_used: {
                        $ne: niid
                    }
                }]
            }, {
                $and: [{
                    is_default: {
                        $ne: false
                    }
                }, {
                    niid: niid
                }]
            }]
        }]
    }).exec()
        .then((templates) => {
            return templates.map(template => {
                return template.content;
            })
        })
        .catch((err) => {
            return err;
        });
    return templates;
}

/**
 * input niid, profile
 */
const niid = "ACoAAC6P1LgBEmq374spirHGHRfnBtYFoV8g108";
const profile = {
    location: "Vietnam",
    industry: "IT"
};

(async () => {
    const targets = await getTargetByNiid(niid);
    const targetIDs = await getTargetIDMapProfile(profile, targets);
    if (targetIDs && targetIDs.length) {
        let templates = await getTemplateByTargetIDs(niid, targetIDs);
        return templates;
    }
    return [];
})();