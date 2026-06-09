import express ,{Request, Response , NextFunction} from 'express'
import {prisma } from '../index'
import { AuthRequest, isAdminOrManager } from '../middleware/auth'

const router = express.Router()
//ROUTES 
router.post('/',isAdminOrManager, async(req:AuthRequest, res:Response)=>{
try {
    const tenantId = req.user.tenantId 
    const {customerId ,items} = req.body
    if(!items) return res.status(400).json({error:"please enter items"})
    const finalOrder = await prisma.$transaction( async(tx)=>{
    let totalAmount = 0
    let verifiedItems=[]
        for(const item of items){
            const product = await tx.product.findUnique(
               { where :{id: item.productId , tenantId:tenantId}
            })
             if(!product) {
                throw new Error(`productId:${item.productId} not available in godown`)}
            if(product.quantity<item.quantity){
                throw new Error(`Stock of ${product.name} is low only ${product.quantity} is available `)}
                const itemPrice = Number( product.basePrice)
                totalAmount += itemPrice*item.quantity 
                verifiedItems.push({
                    tenantId: tenantId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.basePrice
                })
            }
             const order = await tx.order.create({
                data:{
                    customerId:customerId,
                    tenantId:tenantId,
                    totalAmount:totalAmount,
                    orderItem:{ create :verifiedItems} 
                }

             })
             for(const item of items){
                await tx.product.update({
                    where:{id:item.productId, tenantId:tenantId},
                    data:{quantity:{decrement:item.quantity}}
                })
                
             }
       return order
    })
    return res.status(200).json(finalOrder)

} catch (error:any) {
    console.error(error)
    return res.status(500).json({error: error.message})
}
})



router.get('/', async(req:AuthRequest, res: Response )=>{
    try {
        const tenantId = req.user.tenantId
        const order = await prisma.order.findMany({
            where:{tenantId: tenantId},
            orderBy:{ orderTime: 'desc'},
            include:{
                customer:true,
                orderItem:{
                    include:{
                        product:true
                    }
                }
            }
        })
        return res.status(200).json(order)
    } catch (error) {
        console.error(error)
    return res.status(500).json({error: "Server Error"})
    }
})

export default router 