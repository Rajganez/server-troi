import { Router } from "express";
import {
  getTestimonial,
  recordTestimonial,
  storeTestimonialLink,
} from "../controllers/testimonialController.js";
import { verifyToken } from "../middleware/verifyToken.js";


const testimonialRouter = Router();

testimonialRouter.post("/generate-link",verifyToken, storeTestimonialLink);
testimonialRouter.post("/get-testimonial",verifyToken, getTestimonial);
testimonialRouter.post("/client-feedback", recordTestimonial);

export default testimonialRouter;
