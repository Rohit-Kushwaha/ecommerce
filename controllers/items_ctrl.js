const Items = require("../model/items_model.js");

class APIFeature {
  constructor(query, queryString) {
    (this.query = query), (this.queryString = queryString);
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

const itemCtrl = {
  getItems: async (req, res) => {
    console.log(req.query);
    try {
      const features = new APIFeature(Items.find(), req.query)
        .filtering()
        .sorting()
        .pagination();
      console.log(features);
      const items = await features.query; // don't know
      res.json({
        status: "Success",
        result: items.length,
        items: items,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  createItems: async (req, res) => {
    try {
      // getting request in items
      const items = req.body;

      // Ensure the input is array
      if (!Array.isArray(items) && items.length == 0) {
        return res
          .status(400)
          .json({ msg: "Provide a non-empty array of items." });
      }

      // Validate each items

      for (const item of items) {
        const {
          item_id,
          name,
          image,
          description,
          price,
          currency,
          rating,
          category,
          tags,
          url,
          features,
        } = item;

        // Check for required fields
        if (
          !item_id ||
          !name ||
          !image ||
          !description ||
          !price ||
          !rating ||
          !category ||
          !tags ||
          !url ||
          !features ||
          !currency
        ) {
          return res
            .status(400)
            .json({ msg: "All required fields must be provided." });
        }

        // Validate rating
        if (rating < 0 || rating > 5) {
          return res.status(400).json({
            msg: `Rating for item_id ${item_id} must be between 0 and 5.`,
          });
        }
        //** This is a list */
        if (!Array.isArray(features) || features.length === 0) {
          return res.status(400).json({
            msg: `Description for item_id ${item_id} must be a non-empty List.`,
          });
        }
      }

      // Check for duplicate `item_id` in the database

      const itemIds = items.map((item) => item.item_id);
      const existingItems = await Items.find({ item_id: { $in: itemIds } });

      if (existingItems.length > 0) {
        const existingIds = existingItems.map((item) => item.item_id);
        return res.status(400).json({
          msg: "Some items already exist.",
          existingIds,
        });
      }

      const insertedItems = await Items.insertMany(items);

      res.status(201).json({
        msg: "Created a item",
        data: insertedItems,
      });

      //   if (existingPlaces.length > 0) {
      //     const existingIds = existingPlaces.map((place) => place.place_id);
      //     return res.status(400).json({
      //       msg: "Some places already exist.",
      //       existingIds,
      //     });
      //   }

      //   // Check if the item already exists
      //   const existingItem = await Items.findOne({ itemName, category });
      //   if (existingItem) {
      //     return res.status(409).json({ msg: "Item already exists" }); // HTTP 409 Conflict
      //   }
      //   const itemCreated = new Items({
      //     itemName,
      //     itemPrice,
      //     description,
      //     category,
      //     imageUrl,
      //     url,
      //     createdAt,
      //     updatedAt,
      //   });
      //   await itemCreated.save();
      //   res.json({ msg: "Item created" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = itemCtrl;
