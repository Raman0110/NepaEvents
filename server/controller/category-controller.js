const Category = require("../models/category-model");


const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.path : null; 
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
  }
    const newCategory = await Category.create({ name, image });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      Category: newCategory
    });
  } catch (error) {
    console.error('Error booking Category:', error);
    res.status(500).json({ message: 'Error booking Category', error: error.message });
  }
};
const getAllCategory = async (req, res) => {
  try {
    const category = await Category.find();
    res.status(200).json(category);
  } catch (error) {
    console.error("Error getting Categorys:", error);
    res.status(500).json({ message: "Error getting Categorys", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const newCategoryData = req.body;
    console.log(req.body);
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      newCategoryData,
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    };

    res.status(200).json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

const deleteCategory = async (req, res) => {
  try {
    const CategoryToDelete = await Category.findByIdAndDelete(req.params.id)
    if (!CategoryToDelete) {
      return res.status(404).json({ msg: "Category not found" });
    }
    res.status(204).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }

}

const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id
    const category = await Category.findById(id);
    res.status(200).json({ success: true, data: category });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

module.exports = { createCategory, getAllCategory, updateCategory, deleteCategory, getCategoryById }