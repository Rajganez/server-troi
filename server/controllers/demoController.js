import { db } from "../DB/mongo-db.js";

const demoCollections = db.collection("DemoCollection");

//------------Demo lead Updation------------------------//

export const updateDemoLead = async (req, res) => {
  const { name, email, number } = req.body;
  try {
    const demo = await demoCollections.findOne({
      Email: email,
      Number: number,
    });
    if (demo) {
      return res
        .status(404)
        .json({ message: "Currently in Queue Will get the callback shortly" });
    } else {
      await demoCollections.insertOne({
        Name: name,
        Email: email,
        Number: number,
      });
      return res.status(200).json({ message: "Demo lead added successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating demo lead", error });
  }
};
