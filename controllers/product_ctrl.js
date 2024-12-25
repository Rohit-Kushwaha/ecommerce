const Products = require('../model/products_model.js');


class APIFeature {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filtering() {
        const queryObject = { ...this.queryString } // queryString = req.query
        console.log({ before: queryObject }); // before page delete
        const excludedField = ['page', 'sort', 'limit'];
        excludedField.forEach(e => delete (queryObject[e]));
        console.log({ after: queryObject }); // after page delete

        // Convert query operators (e.g., gte, lte) to MongoDB syntax
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|regex)\b/g, match => `$${match}`);

        console.log({ queryStr });

        // Apply the filtering to the query
        this.query = this.query.find(JSON.parse(queryStr));


        return this;

    }
    sorting() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); // Default sorting by newest
        }
        return this;
    }

    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 3;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

const productCtrl = {

    getProducts: async (req, res) => {

        try {
            console.log(req.query);
            const features = new APIFeature(Products.find(), req.query).filtering().sorting().pagination();
            const product = await features.query;
            res.json({
                status: "success",
                result: product.length,
                product: product
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    createProducts: async (req, res) => {
        try {
            const { product_id, title, price, description, content, images, category, checked } = req.body;
            if (!images) return res.status(400).json({ msg: "Image upload must" });
            const product = await Products.findOne({ product_id });
            if (product) return res.status(400).json({ msg: "This product already exists" });
            const newProduct = new Products({
                product_id, title: title.toLowerCase(), price, description, content, images, category, checked
            });
            res.json({ msg: "Created a product" });
            await newProduct.save();
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    deleteProducts: async (req, res) => {
        try {
            const product = await Products.findByIdAndDelete({ _id: req.params.id });
            res.json({ msg: "Deleted a product" });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    updateProducts: async (req, res) => {
        try {
            const { title, price, description, content, images, category } = req.body;
            if (!images) return res.status(400).json({ msg: "Image upload must" });
            await Products.findOneAndUpdate({
                _id: req.params.id,
            },
                {
                    title: title.toLowerCase(),
                    price,
                    description,
                    content,
                    images,
                    category,

                });

            res.json({ msg: "Product updated" });

        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    }


}

module.exports = productCtrl;