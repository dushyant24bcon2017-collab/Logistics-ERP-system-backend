import express, { Response } from 'express';
import { prisma } from '../index'; 
import { AuthRequest, isAdminOrManager } from '../middleware/auth';
const router = express.Router();

// CREATE CUSTOMER
router.post('/',isAdminOrManager, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user.tenantId;
        const { customerName, phone } = req.body;

        if (!customerName) return res.status(400).json({ error: "Please Enter Customer Name" });
        if (!phone) return res.status(400).json({ error: "Please Enter Customer Phone Number" });
        const newCustomer = await prisma.customer.create({
            data: { tenantId, customerName, phone }
        });
        
        return res.status(201).json(newCustomer);
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
})

// GET ALL CUSTOMERS
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { customerName: 'asc' }
        });
        return res.json(customers);
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
})

// delete a customer 
router.delete('/:id', isAdminOrManager ,async(req:AuthRequest, res:Response)=>{
try {
    const tenantId = req.user.tenantId
    const customerId =req.params.id as string
    const deleteCustomer = await prisma.customer.delete({
        where:{ id:customerId,tenantId: tenantId }
    })
    return res.status(200).json(deleteCustomer)
} catch (error) {
    return res.status(500).json({ error: "Server Error" });
}
})

export default router;