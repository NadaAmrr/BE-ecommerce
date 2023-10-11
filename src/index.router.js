import authRouter from './modules/auth/auth.router.js'
import categoryRouter from './modules/category/category.router.js'
import subcategoryRouter from './modules/subCategory/subcategory.router.js'
import brandRouter from './modules/brand/brand.router.js'
import couponRouter from './modules/coupon/coupon.router.js'
import productRouter from './modules/product/product.router.js'
import cartRouter from './modules/cart/cart.router.js'
import orderRouter from './modules/order/order.router.js'
import connectDB from '../DB/connection.js'
import { globalErrorHandling } from './utils/errorHandling.js'

const bootstrap = (app , express)=>{
    app.use(express.json())

    app.use("/auth", authRouter)
    app.use("/category", categoryRouter)
    app.use("/subcategory", subcategoryRouter)
    app.use("/coupon", couponRouter)
    app.use("/brand", brandRouter)
    app.use("/product", productRouter)
    app.use("/cart", cartRouter)
    app.use("/order", orderRouter)
    app.use("/reviews", reviewsRouter)


   app.use("*",(req,res,next)=>{
    return res.json({message:"In-valid Routing"})
   });
   app.use(globalErrorHandling)

   connectDB()
}

export default bootstrap