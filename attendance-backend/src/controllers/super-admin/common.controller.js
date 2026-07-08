const Country = require('../../models/Country');
const State = require('../../models/State');
const City = require('../../models/City');


exports.getStates = async (req, res) => {
    try {
        const country = await Country.findOne({
            name: 'India'
        });

        if (country) {
            const states = await State.find({
                'countryId': country.countryId
            }).sort({ name: 1 });

            if (states) {
                return res.status(200).json({
                    success: true,
                    data: states,
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'States not found'
                });
            }
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Country not found'
            })
        }

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false
        });
    }
}


exports.getCitiesByState = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'State is required'
            });
        }


        const cities = await City.find({
            stateId: id
        }).sort({ name: 1 });

        if (cities) {
            return res.status(200).json({
                success: true,
                data: cities
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false
        })
    }
}


exports.getStateById = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await State.findOne({
            stateId: id
        });

        return res.status(200).json({
            success: true, data: state
        });
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({
            success: false,
        })
    }
}

exports.getCityById = async (req, res) => {

    try {
        const { id } = req.params;


        const city = await City.findOne({
            cityId: id
        });

        return res.status(200).json({
            success: true, data: city
        });
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({
            success: false,
        })
    }

}