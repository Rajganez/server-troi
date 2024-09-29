import {db} from "../DB/mongo-db.js";
import dotenv from "dotenv";

dotenv.config();

export const messageCollection = db.collection("SMSCollection");

//---------------Send SMS------------------------//

