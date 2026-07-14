import { Router } from "express";
import { ProductController } from "./product.controller";

export const createProductRouter = (
    controller: ProductController
): Router => {
    const router = Router();

    router.post("/products", controller.create.bind(controller));

    return router;
};