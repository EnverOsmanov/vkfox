module.exports = {
    "zepto": {
        "exports": "$"
    },
    "moment": {
        "exports": "Moment",
        "depends": "moment1"
    },
    "moment1": {
        "exports": "Moment",
        "depends": "moment2"
    },
    "moment2": "Moment"
};