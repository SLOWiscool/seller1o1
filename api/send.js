// api/send.js
const nodemailer = require('nodemailer')

export default async function handler(req, res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  const { from, password, to, subject, text } = req.body
  if(!from || !password || !to || !subject || !text) return res.status(400).json({error:'Missing fields'})

  try{
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.tm',
      port: 587,
      secure: false,
      auth:{ user: from, pass: password }
    })

    const info = await transporter.sendMail({ from, to, subject, text })
    return res.status(200).json({success:true,messageId:info.messageId})
  }catch(e){
    return res.status(500).json({success:false,error:e.message})
  }
}
