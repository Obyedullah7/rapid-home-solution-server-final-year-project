const Service = require("../models/serviceModel");
const cloudinary = require('../config/cloudinaryConfig')
const { Readable } = require("stream");
const OrderInfo = require("../models/orderInfoModel");

const addService = async (req, res) => {
    // console.log(req.body)
    try {

        const imageStream = await Readable.from(req.file.buffer)

        const imageUrl = [];

        await new Promise((resolve, reject) => {

            const cld_upload_stream = cloudinary.uploader.upload_stream({
                folder: "rapid-home-solution/service-image",
            }, (error, result) => {
                if (result) {
                    const { secure_url, public_id } = result;
                    imageUrl.push({ public_id, secure_url });
                    resolve();
                } else {
                    reject(error);
                }
            });

            imageStream.pipe(cld_upload_stream);
        });

        // console.log(imageUrl)



        const { title, description, price, category, duration } = req.body;

        // console.log(req.body)
        const newService = new Service({
            title,
            description,
            price,
            category,
            duration,
            image: imageUrl

        })

        await newService.save();

        // console.log(newService)
        res.json({
            success: true,
            message: "Services added successfully",
            service: newService
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }

}





const updateService = async (req, res) => {

    try {

        const { id, title, description, price, category, duration } = req.body

        const update = await Service.findByIdAndUpdate({ _id: id }, { title, description, price, category, duration });


        res.json({
            success: true,
            message: "Services updated successfully",
            service: update
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }

}





const getServices = async (req, res) => {
    try {

        const { search, filter, page, limit } = req.query;

        const pageNumber = Number(page) || 1;
        const itemsPerPage = limit !== "" ? Number(limit) : null;

        let query = {};

        if (search !== "") {
            const searchRegExp = new RegExp('.*' + search + '.*', 'i');
            query.title = searchRegExp;
        }
        if (filter !== "") {
            query.category = filter;
        }


        if (itemsPerPage) {
            const skip = (pageNumber - 1) * itemsPerPage;

            const services = await Service.find(query).populate("category").sort({ createdAt: -1 }).skip(skip).limit(itemsPerPage);

            const totalServices = await Service.find(query).countDocuments();
            const totalPages = Math.ceil(totalServices / itemsPerPage)

            res.json({
                success: true,
                message: "All services",
                services,
                totalPages
            });
        }

        else {
            const services = await Service.find(query).populate("category").sort({ createdAt: -1 });

            res.json({
                success: true,
                message: "All services",
                services
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}




const getServiceById = async (req, res) => {
    try {

        const { id, serviceType } = req.query;



        const service = await Service.findById(id).populate("category");


        if (serviceType === 'quick') {

            service.price = service.price + ((15 / 100) * (service.price))

        }

        res.json({
            success: true,
            message: "Single general service",
            service
        });


    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }

}




const deleteService = async (req, res) => {

    try {

        const { id } = req.params

        const deletedData = await Service.findByIdAndDelete({ _id: id })



        const deleteImage = async (publicId) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (result) {
                    console.log(`Image deleted: ${publicId}`);
                } else {
                    console.error(`Error deleting image ${publicId}:`, error);
                }
            });
        };


        await deleteImage(deletedData.image[0].public_id);




        res.json({
            success: true,
            message: "Services deleted successfully",
            service: deletedData
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }

}



const getServiceRating = async (req, res) => {

    try {

        const { serviceId } = req.params

        const data = await OrderInfo.find({serviceId, rate: {$gt: 0}});
         
        const rate = data.map((e)=> e.rate);
        
        const totalRating = rate.reduce((e,c)=> e + c , 0) || 0;
        const totalPeople = rate.length || 0;
        const avg = totalRating > 0 ? (totalRating / totalPeople).toFixed(1) : 0;

    
        res.json({
            success: true,
            data: {
                totalRating,
                totalPeople,
                avg,
            }
            
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }

}





module.exports = { addService, updateService, getServices, getServiceById, deleteService, getServiceRating };