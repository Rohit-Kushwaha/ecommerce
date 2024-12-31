const Items = require('../model/items_model.js');

const itemCtrl = {
    getItems: async (req, res) => {
       const allItems = await Items.find();
        res.json(allItems);
    },

    createItems: async (req, res) => {
        try{
        const { itemName, itemPrice, description, category, imageUrl, url, createdAt, updatedAt } = req.body;
        if (!itemName && !itemPrice && !description && !category && !imageUrl
            && !url) {
            return res.status(400).json({ msg: "Some fields is empty" });
        }

         // Check if the item already exists
         const existingItem = await Items.findOne({ itemName, category });
         if (existingItem) {
             return res.status(409).json({ msg: "Item already exists" }); // HTTP 409 Conflict
         }

        const itemCreated = new Items({
            itemName, itemPrice, description, category, imageUrl, url, createdAt, updatedAt
        });

        await itemCreated.save();
        res.json({msg:"Item created"});
    }catch(e){
        res.json({msg: e.message});
    }
    },
};

module.exports = itemCtrl;

