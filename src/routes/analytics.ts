import express, { Response } from 'express';
import { prisma } from '../index'; 
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', async(req:AuthRequest, res: Response)=>{
   try {
    const chartData = await prisma.order.groupBy({
        by:['orderTime'],
        where:{tenantId: req.user.tenantId},
        _sum:{
            totalAmount: true
        }
    })
    return res.json(chartData)
   } catch (error) {
    return res.status(500).json({ error: "Server Error" });
   }
})
export default router
