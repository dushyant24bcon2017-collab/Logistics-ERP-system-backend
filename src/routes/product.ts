import express ,{Response} from 'express'
import{prisma} from '../index'
import { AuthRequest, isAdmin, isAdminOrManager, verifyTokens } from '../middleware/auth'
const router = express.Router();
//ROUTES

//CREATE
router.post('/',isAdminOrManager,async(req:AuthRequest, res: Response)=>{
   try {
    const {name , sku , basePrice, mrp ,quantity}= req.body;
   const tenantId = req.user.tenantId
   const product = await prisma.product.create({
    data: ({
        name:name,
        sku:sku,
        basePrice:basePrice,
        mrp:mrp,
        quantity:quantity,
        tenantId: tenantId
    })
   })
   return res.status(200).json(product)
   } catch (error) {
    console.error(error)
    return res.status(500).json({error:"Server Error"})
   }
})
//READ
router.get('/', async(req:AuthRequest , res: Response)=>{
    try {
       const tenantId= req.user.tenantId
       const products = await  prisma.product.findMany({where:{tenantId:tenantId}})
       return res.status(200).json(products)
    } catch (error) {
        console.error(error)
    return res.status(500).json({error:"Server Error"})
    }
})
//UPDATE
router.put('/:id',isAdmin, async(req:AuthRequest, res:Response)=>{
    try {
        const productId= req.params.id as string
        const tenantId = req.user.tenantId
        const {basePrice , mrp , quantity} = req.body
        const updatedProduct = await prisma.product.update({
            where :{tenantId:tenantId, id : productId}, data:{
                basePrice:basePrice,
                mrp:mrp,
                quantity:quantity
            }
        })
        return res.status(200).json(updatedProduct)


    } catch (error) {
         console.error(error)
    return res.status(500).json({error:"Server Error"})
    }
})

router.delete('/:id',isAdmin, async(req:AuthRequest, res:Response)=>{
    try {
        const productId= req.params.id as string
        const tenantId = req.user.tenantId
        const deletedProduct = await prisma.product.delete({
            where:{id: productId, tenantId:tenantId}
        })
        return res.status(200).json(deletedProduct)
    } catch (error) {
         console.error(error)
    return res.status(500).json({error:"Server Error"})
    }
})

export default router 