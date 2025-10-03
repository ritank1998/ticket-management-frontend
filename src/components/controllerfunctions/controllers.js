import cron from 'node-cron'


const checkToken = async()=>{
    const token = sessionStorage.removeItem('token')
    return true
}

export const checkForToken = async()=>{
    
}

cron.schedule('*/10 * * * * *' , ()=>{
    checkToken()
    console.log("Cron is running !!")
})