import  express ,{Request,Response,NextFunction} from 'express'
import cors from "cors"
import bcrypt from "bcrypt"
import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
import productRoutes from './routes/product'
import ordersRoutes from './routes/orders'
import customerRoutes from './routes/customer'
import helmet from 'helmet'
import { verifyTokens, isAdmin,AuthRequest } from './middleware/auth';
import analytics from './routes/analytics'
//INITIALIZATION
const port = 5000
const app = express()
//@ts-ignore
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })   
app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(helmet())


//ROUTES
app.get('/',(req,res)=>{
    try {
       res.send("hello bhai server zinda hai") 
    } catch (error) {
        console.error(error)
    }
})
app.post('/api/test',(req,res)=>{
    console.log(req.body)
    res.json(req.body)
})



// SIGNUP API
app.post("/signup",async(req,res)=>{
    try {
        const {tenantName,userName,email,password}= req.body
        if(!tenantName||!userName||!email||!password){
            return res.status(400).json({error:"All details not provided"})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const newTenant= await prisma.tenant.create({
            data:{
                name:tenantName,
                user:{
                    create:{
                        name:userName,
                        email: email,
                        passwordHash: hashedPassword,
                        role: 'ADMIN'
                    }
                }
            },
            include : { user: true}
        })
        //JWT SETUP
        const token = jwt.sign({
            userId : newTenant.user[0].id,
            tenantId : newTenant.id,
            role: newTenant.user[0].role
        }, process.env.JWT_SECRET as string,
        {expiresIn: '7d'})

       return res.status(201).json({
            message: "COmpany and admin registered",
            tenantId: newTenant.id,
            adminEmail: newTenant.user[0].email,
            token: token
        });  
    } catch (error) {
        console.error(error)
        return res.status(500).json({error:"Server error"})
    }

})
//add employee
app.post('/add-employee', verifyTokens, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        const tenantId = req.user.tenantId; 

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "Saari details daal bhai!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = await prisma.user.create({
            data: {
                name: name,
                email: email,
                passwordHash: hashedPassword,
                role: role, 
                tenantId: tenantId
            }
        });

        return res.status(200).json({newEmployee});

    } catch (error) {
        console.error("Add Employee Error:", error);
        return res.status(500).json({ error: "Server Error" });
    }
});

// get employee 
app.get('/add-employee', verifyTokens, async(req:AuthRequest, res:Response)=>{
try {
    const tenantId = req.user.tenantId
    const employees = await prisma.user.findMany({
        where:{tenantId:tenantId}
    })
    return res.status(200).json(employees)

} catch (error) {
    return res.status(500).json({error:"Server Error "})
}
})
// delete employee
app.delete('/add-employee/:id', verifyTokens , isAdmin, async(req:AuthRequest, res:Response)=>{
    try {
        const tenantId = req.user.tenantId
        const employeeId = req.params.id as string
        const deletedEmployee = await prisma.user.delete({
            where:{id:employeeId, tenantId: tenantId}
        })
    } catch (error) {
        return res.status(500).json({error:"Server Error"})
    }
})
// LOGIN API 
app.post("/login", async(req,res)=>{
    try {
        const {email, password} = req.body;
        if(!password|| !email){
            return res.status(400).json({error: "All details not provided"})
        }
       const user = await prisma.user.findUnique({
        where: {email : email}
       })
       if(!user){
        return res.status(400).json({error:"correct email not found"})
       }

       const validPassword = await bcrypt.compare(password, user.passwordHash)
       if(!validPassword){
        return res.status(400).json({error:"Wrong password"})
       }
       const token = jwt.sign(
        {
            userId : user.id,
            tenantId: user.tenantId,
            role: user.role
        },process.env.JWT_SECRET as string,
        {expiresIn:'7d'}
       )
        return res.status(201).json({
            message: "login Sucessfull",
            tenantId: user.tenantId,
            userEmail: user.email,
            token: token
        }); 

    } catch (error) {
        console.error(error)
        return res.status(500).json({error:"Server error"}) 
    }

})


//AFTER LOGIN 
app.get("/me",verifyTokens,async(req:AuthRequest,res:Response)=>{
try {
    const userId = req.user.userId
    const user = await prisma.user.findUnique({
        where:{id:userId},
        select:{
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        }
    });
    if(!user){
        return res.status(400).json({error: "user not found"})
    }
    return res.status(200).json(user)
} catch (error) {
    console.error(error)
    return res.status(500).json({error:"Server Error"})
}
})

//OTHER ROUTES
app.use('/products',verifyTokens,productRoutes)
app.use('/orders',verifyTokens,ordersRoutes)
app.use('/customer',verifyTokens,customerRoutes)
app.use('/analytics',verifyTokens,analytics)
app.listen(port ,()=>{
    console.log("server is running on port",port)
})