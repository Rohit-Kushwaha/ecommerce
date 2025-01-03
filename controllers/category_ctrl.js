const Category = require("../model/category_model.js");

const categoryCtrl = {
  getCategory: async (req, res) => {
    try {
      const category = await Category.find();
      res.json(category);
    } catch (error) {
      return res.status(500).json({ msg: error.msg });
    }
  },

  createCategory: async (req, res) => {
    try {
      /// if user have role 1 ---> admin
      /// only admin can create,updata and delete
      const { name } = req.body;
      const category = await Category.find({ name });
      if (!category) {
        return res.status(400).json({ msg: "This category already exist." });
      }
      const newCategory = await Category({ name });
      await newCategory.save();
      res.json({ msg: "Created a category" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      res.json({ msg: "Deleted this category" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateCategories: async (req, res) => {
    try {
      const { name } = req.body;
      const category = await Category.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        {
          name: name,
        }
      );

      res.json({ msg: "Category updated" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = categoryCtrl;
