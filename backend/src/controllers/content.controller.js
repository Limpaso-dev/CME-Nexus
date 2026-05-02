import Content from "../models/Content.js";

export const createContent = async (req, res) => {
  const content = await Content.create({
    ...req.body,
    createdBy: req.user.id
  });

  res.json(content);
};

export const getAllContent = async (req, res) => {
  const { search } = req.query;

  const query = search
    ? { title: { $regex: search, $options: "i" } }
    : {};

  const data = await Content.find(query);
  res.json(data);
};