const Places = require("../model/places_model.js");

class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObject = { ...this.queryString }; // queryString = req.query
    console.log({ before: queryObject }); // before page delete
    const excludedField = ["page", "sort", "limit"];
    excludedField.forEach((e) => delete queryObject[e]);
    console.log({ after: queryObject }); // after page delete

    // Convert query operators (e.g., gte, lte) to MongoDB syntax
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|regex)\b/g,
      (match) => `$${match}`
    );

    console.log({ queryStr });

    // Apply the filtering to the query
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // Default sorting by newest
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 30;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const placeCtrl = {
  getPlace: async (req, res) => {
    try {
      console.log(req.query);
      const features = new APIFeature(Places.find(), req.query)
        .filtering()
        .sorting()
        .pagination();
      const places = await features.query;
      res.json({
        status: "Success",
        result: places.length,
        places: places,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  createPlace: async (req, res) => {
    try {
      const places = req.body;

      // Ensure the input is an array
      if (!Array.isArray(places) || places.length === 0) {
        return res
          .status(400)
          .json({ msg: "Provide a non-empty array of places." });
      }

      // Validate each place
      for (const place of places) {
        const {
          place_id,
          name,
          location,
          image,
          category,
          rating,
          description,
        } = place;

        // Check for required fields
        if (!place_id || !name || !location || !image || !category || !rating) {
          return res
            .status(400)
            .json({ msg: "All required fields must be provided." });
        }

        // Validate rating
        if (rating < 0 || rating > 5) {
          return res.status(400).json({
            msg: `Rating for place_id ${place_id} must be between 0 and 5.`,
          });
        }

        // Validate description
        if (!Array.isArray(description) || description.length === 0) {
          return res.status(400).json({
            msg: `Description for place_id ${place_id} must be a non-empty array.`,
          });
        }
      }

      // Check for duplicate `place_id` in the database
      const placeIds = places.map((place) => place.place_id);
      const existingPlaces = await Places.find({ place_id: { $in: placeIds } });

      if (existingPlaces.length > 0) {
        const existingIds = existingPlaces.map((place) => place.place_id);
        return res.status(400).json({
          msg: "Some places already exist.",
          existingIds,
        });
      }

      // Insert all valid places into the database
      const insertedPlaces = await Places.insertMany(places);

      res.status(201).json({
        msg: "Places created successfully",
        data: insertedPlaces,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  //**  These are not needed as of now */
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
      await Products.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        {
          title: title.toLowerCase(),
          price,
          description,
          content,
          images,
          category,
        }
      );

      res.json({ msg: "Product updated" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = placeCtrl;
